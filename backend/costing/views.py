from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import MaterialPrice, LaborRate, CostEstimate, CostItem
from .serializers import MaterialPriceSerializer, LaborRateSerializer, CostEstimateSerializer, CostItemSerializer
from projects.models import Project
from quantities.models import Element, MaterialQuantity


class MaterialPriceViewSet(viewsets.ModelViewSet):
    queryset = MaterialPrice.objects.all()
    serializer_class = MaterialPriceSerializer


class LaborRateViewSet(viewsets.ModelViewSet):
    queryset = LaborRate.objects.all()
    serializer_class = LaborRateSerializer


class CostEstimateViewSet(viewsets.ModelViewSet):
    queryset = CostEstimate.objects.all()
    serializer_class = CostEstimateSerializer

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Auto-generate cost estimate from project elements and material prices.
        """
        project_id = request.data.get('project_id')
        markup = float(request.data.get('markup_percent', 15))

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=404)

        # Build price lookup
        prices = {p.material_type: p for p in MaterialPrice.objects.all()}

        estimate = CostEstimate.objects.create(project=project, markup_percent=markup)

        elements = Element.objects.filter(Q(floor__site__project=project) | Q(project=project)).prefetch_related('quantities')
        items_created = 0

        for el in elements:
            for mq in el.quantities.all():
                material_type = mq.material_type
                unit = mq.unit
                qty = mq.value
                unit_price = 0

                price = prices.get(material_type)
                if price:
                    unit_price = price.unit_price

                if qty > 0:
                    CostItem.objects.create(
                        estimate=estimate,
                        element=el,
                        material_type=material_type,
                        description=f'{el.name or el.element_type} - {material_type}',
                        quantity=qty,
                        unit=unit,
                        unit_price=unit_price,
                    )
                    items_created += 1

        if items_created == 0:
            estimate.delete()
            return Response({
                'error': 'No quantities found. Add elements with quantities first.'
            }, status=400)

        serializer = self.get_serializer(estimate)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=['post'])
    def update_prices(self, request, pk=None):
        """Update unit prices for items in this estimate."""
        estimate = self.get_object()
        updates = request.data.get('items', [])
        updated = 0
        for item_data in updates:
            try:
                item = estimate.items.get(id=item_data['id'])
                item.unit_price = float(item_data['unit_price'])
                item.save()
                updated += 1
            except (CostItem.DoesNotExist, KeyError, ValueError):
                pass
        serializer = self.get_serializer(estimate)
        return Response(serializer.data)
