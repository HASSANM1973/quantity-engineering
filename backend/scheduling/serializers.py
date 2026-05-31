from rest_framework import serializers
from .models import Activity, Dependency, ResourceAssignment


class ResourceAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceAssignment
        fields = '__all__'


class ActivitySerializer(serializers.ModelSerializer):
    resources = ResourceAssignmentSerializer(many=True, read_only=True)
    incoming_count = serializers.SerializerMethodField()
    outgoing_count = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = '__all__'

    def get_incoming_count(self, obj):
        return obj.incoming_deps.count()

    def get_outgoing_count(self, obj):
        return obj.outgoing_deps.count()


class DependencySerializer(serializers.ModelSerializer):
    predecessor_name = serializers.CharField(source='predecessor.name', read_only=True)
    successor_name = serializers.CharField(source='successor.name', read_only=True)

    class Meta:
        model = Dependency
        fields = '__all__'


class ScheduleInputSerializer(serializers.Serializer):
    activities = ActivitySerializer(many=True)
    dependencies = DependencySerializer(many=True)
