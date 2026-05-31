from rest_framework import serializers
from .models import Project, Site, Floor


class FloorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Floor
        fields = '__all__'


class SiteSerializer(serializers.ModelSerializer):
    floors = FloorSerializer(many=True, read_only=True)

    class Meta:
        model = Site
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    sites = SiteSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
