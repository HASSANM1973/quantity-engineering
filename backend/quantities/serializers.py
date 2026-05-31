from rest_framework import serializers
from .models import Element, MaterialQuantity


class MaterialQuantitySerializer(serializers.ModelSerializer):
    class Meta:
        model = MaterialQuantity
        fields = '__all__'


class ElementSerializer(serializers.ModelSerializer):
    quantities = MaterialQuantitySerializer(many=True, read_only=True)

    class Meta:
        model = Element
        fields = '__all__'


class CalculateSerializer(serializers.Serializer):
    element_type = serializers.ChoiceField(choices=[
        'foundation', 'column', 'beam', 'solid_slab', 'ribbed_slab',
        'steel_beam', 'steel_column', 'steel_connection',
        'retaining_wall', 'stairs',
        'blockwork', 'brickwork', 'tiling', 'painting',
        'waterproofing', 'insulation', 'earthwork',
        # Infrastructure
        'road_pavement', 'water_pipe', 'sewage_pipe', 'manhole',
        'sidewalk', 'curb', 'storm_drainage', 'water_tank', 'street_lighting',
    ])
    dimensions = serializers.JSONField()
    count = serializers.IntegerField(default=1)
