from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Element, MaterialQuantity
from .serializers import ElementSerializer, MaterialQuantitySerializer, CalculateSerializer
from .calculators.registry import get_calculator


class ElementViewSet(viewsets.ModelViewSet):
    queryset = Element.objects.all()
    serializer_class = ElementSerializer

    def get_queryset(self):
        qs = Element.objects.all()
        project_id = self.request.query_params.get('project_id')
        floor_id = self.request.query_params.get('floor')
        if project_id:
            qs = qs.filter(project_id=project_id)
        elif floor_id:
            qs = qs.filter(floor_id=floor_id)
        return qs

    @action(detail=False, methods=['post'])
    def calculate(self, request):
        serializer = CalculateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            calc = get_calculator(data['element_type'], data['dimensions'], data['count'])
            result = calc.calculate_all()
            return Response(result)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def save_quantities(self, request, pk=None):
        element = self.get_object()
        calc = get_calculator(element.element_type, element.dimensions, element.count)
        results = calc.calculate_all()

        MaterialQuantity.objects.filter(element=element).delete()
        for mat_type, mat_data in results.items():
            if not isinstance(mat_data, dict) or 'unit' not in mat_data:
                continue
            MaterialQuantity.objects.create(
                element=element,
                material_type=mat_type,
                unit=mat_data['unit'],
                value=mat_data['value'],
                spec_reference=mat_data.get('spec_reference', ''),
            )

        serializer = ElementSerializer(element)
        return Response(serializer.data)


class MaterialQuantityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MaterialQuantity.objects.all()
    serializer_class = MaterialQuantitySerializer
