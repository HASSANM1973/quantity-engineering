from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Activity, Dependency, ResourceAssignment
from .serializers import ActivitySerializer, DependencySerializer, ResourceAssignmentSerializer
from .cpm import CPMEngine


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

    @action(detail=False, methods=['get'])
    def by_project(self, request):
        project_id = request.query_params.get('project_id')
        if not project_id:
            return Response({'error': 'project_id required'}, status=status.HTTP_400_BAD_REQUEST)
        activities = Activity.objects.filter(project_id=project_id).order_by('order')
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)


class DependencyViewSet(viewsets.ModelViewSet):
    queryset = Dependency.objects.all()
    serializer_class = DependencySerializer


class ResourceAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ResourceAssignment.objects.all()
    serializer_class = ResourceAssignmentSerializer


class CPMViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def compute(self, request):
        project_id = request.data.get('project_id')
        if not project_id:
            return Response({'error': 'project_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            engine = CPMEngine(project_id)
            result = engine.run()
            activities = Activity.objects.filter(project_id=project_id).order_by('order')
            serializer = ActivitySerializer(activities, many=True)
            return Response({
                'cpm': result,
                'activities': serializer.data,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def auto_generate(self, request):
        """
        Automatically generate activities from project elements/quantities
        using predefined productivity rates
        """
        from projects.models import Project
        from quantities.models import Element, MaterialQuantity
        from datetime import date, timedelta
        from django.db.models import Q

        project_id = request.data.get('project_id')
        project = Project.objects.get(id=project_id)

        Activity.objects.filter(project=project).delete()
        Dependency.objects.filter(predecessor__project=project).delete()

        PRODUCTIVITY = {
            'foundation': {'rate': 2.0, 'unit': 'm3/day', 'type': 'foundation'},
            'column': {'rate': 1.5, 'unit': 'm3/day', 'type': 'structure'},
            'beam': {'rate': 2.0, 'unit': 'm3/day', 'type': 'structure'},
            'solid_slab': {'rate': 3.0, 'unit': 'm3/day', 'type': 'structure'},
            'ribbed_slab': {'rate': 2.5, 'unit': 'm3/day', 'type': 'structure'},
            'steel_beam': {'rate': 1.0, 'unit': 'ton/day', 'type': 'structure'},
            'steel_column': {'rate': 1.0, 'unit': 'ton/day', 'type': 'structure'},
            'retaining_wall': {'rate': 2.0, 'unit': 'm3/day', 'type': 'structure'},
            'stairs': {'rate': 1.5, 'unit': 'm3/day', 'type': 'structure'},
            'blockwork': {'rate': 15.0, 'unit': 'm2/day', 'type': 'masonry'},
            'brickwork': {'rate': 8.0, 'unit': 'm2/day', 'type': 'masonry'},
            'tiling': {'rate': 12.0, 'unit': 'm2/day', 'type': 'finishing'},
            'painting': {'rate': 25.0, 'unit': 'm2/day', 'type': 'finishing'},
            'waterproofing': {'rate': 20.0, 'unit': 'm2/day', 'type': 'insulation'},
            'insulation': {'rate': 15.0, 'unit': 'm2/day', 'type': 'insulation'},
            'earthwork': {'rate': 30.0, 'unit': 'm3/day', 'type': 'earthwork'},
            # Infrastructure
            'road_pavement': {'rate': 200.0, 'unit': 'm2/day', 'type': 'infrastructure'},
            'water_pipe': {'rate': 20.0, 'unit': 'm/day', 'type': 'infrastructure'},
            'sewage_pipe': {'rate': 15.0, 'unit': 'm/day', 'type': 'infrastructure'},
            'manhole': {'rate': 1.0, 'unit': 'unit/day', 'type': 'infrastructure'},
            'sidewalk': {'rate': 50.0, 'unit': 'm2/day', 'type': 'infrastructure'},
            'curb': {'rate': 30.0, 'unit': 'm/day', 'type': 'infrastructure'},
            'storm_drainage': {'rate': 15.0, 'unit': 'm/day', 'type': 'infrastructure'},
            'water_tank': {'rate': 0.5, 'unit': 'm3/day', 'type': 'infrastructure'},
            'street_lighting': {'rate': 4.0, 'unit': 'unit/day', 'type': 'infrastructure'},
        }

        PHASE_TYPES = {
            'infrastructure': 0,
            'earthwork': 1,
            'foundation': 2,
            'structure': 3,
            'masonry': 4,
            'insulation': 5,
            'finishing': 6,
        }

        elements = Element.objects.filter(Q(floor__site__project=project) | Q(project=project))
        created = []
        start_date = project.created_at.date() if hasattr(project.created_at, 'date') else date.today()

        for element in elements:
            prod = PRODUCTIVITY.get(element.element_type)
            if not prod:
                continue

            concrete_qty = MaterialQuantity.objects.filter(
                element=element, material_type='concrete'
            ).first()
            qty = concrete_qty.value if concrete_qty else 0

            if qty == 0:
                for mq in MaterialQuantity.objects.filter(element=element):
                    if mq.value > 0:
                        qty = mq.value
                        break

            dur = max(1, int(qty / prod['rate'])) if qty > 0 else 1

            act = Activity.objects.create(
                project=project,
                name=f'{element.name}',
                activity_type=prod['type'],
                duration_days=dur,
                quantity=qty,
                unit=prod['unit'].split('/')[0],
                productivity_rate=prod['rate'],
                order=PHASE_TYPES.get(prod['type'], 99) * 100 + len(created),
            )
            created.append(act)

        for i in range(1, len(created)):
            Dependency.objects.create(
                predecessor=created[i - 1],
                successor=created[i],
                dependency_type='FS',
                lag_days=0,
            )

        engine = CPMEngine(project_id)
        result = engine.run()
        activities = Activity.objects.filter(project_id=project_id).order_by('order')
        serializer = ActivitySerializer(activities, many=True)

        return Response({
            'cpm': result,
            'activities': serializer.data,
            'generated_count': len(created),
        })
