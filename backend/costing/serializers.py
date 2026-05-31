from rest_framework import serializers
from .models import MaterialPrice, LaborRate, CostEstimate, CostItem


class MaterialPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialPrice
        fields = '__all__'


class LaborRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaborRate
        fields = '__all__'


class CostItemSerializer(serializers.ModelSerializer):
    element_name = serializers.CharField(source='element.name', read_only=True, default='')
    element_type = serializers.CharField(source='element.element_type', read_only=True, default='')

    class Meta:
        model = CostItem
        fields = '__all__'


class CostEstimateSerializer(serializers.ModelSerializer):
    items = CostItemSerializer(many=True, read_only=True)
    total_material = serializers.SerializerMethodField()
    total_with_markup = serializers.SerializerMethodField()

    class Meta:
        model = CostEstimate
        fields = '__all__'

    def get_total_material(self, obj):
        return sum(item.total_cost for item in obj.items.all())

    def get_total_with_markup(self, obj):
        base = sum(item.total_cost for item in obj.items.all())
        return base * (1 + obj.markup_percent / 100)
