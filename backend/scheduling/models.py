from django.db import models
from projects.models import Project


class Activity(models.Model):
    ACTIVITY_TYPES = [
        ('earthwork', 'Earthwork'),
        ('foundation', 'Foundation'),
        ('structure', 'Structure'),
        ('masonry', 'Masonry'),
        ('finishing', 'Finishing'),
        ('insulation', 'Insulation'),
        ('mep', 'MEP'),
        ('roofing', 'Roofing'),
        ('other', 'Other'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='activities')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES, default='structure')
    duration_days = models.IntegerField(default=1)
    quantity = models.FloatField(default=0, help_text='Quantity of work')
    unit = models.CharField(max_length=20, blank=True, help_text='Unit of quantity')
    productivity_rate = models.FloatField(default=0, help_text='Quantity per day')
    crew_size = models.IntegerField(default=1)
    planned_start = models.DateField(null=True, blank=True)
    planned_end = models.DateField(null=True, blank=True)
    order = models.IntegerField(default=0, help_text='Display order')

    # CPM computed fields
    early_start = models.IntegerField(default=0)
    early_finish = models.IntegerField(default=0)
    late_start = models.IntegerField(default=0)
    late_finish = models.IntegerField(default=0)
    total_float = models.IntegerField(default=0)
    is_critical = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Activities'
        ordering = ['order']

    def __str__(self):
        return f'{self.project.name} - {self.name}'


class Dependency(models.Model):
    DEPENDENCY_TYPES = [
        ('FS', 'Finish-to-Start'),
        ('SS', 'Start-to-Start'),
        ('FF', 'Finish-to-Finish'),
        ('SF', 'Start-to-Finish'),
    ]

    predecessor = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='outgoing_deps')
    successor = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='incoming_deps')
    dependency_type = models.CharField(max_length=2, choices=DEPENDENCY_TYPES, default='FS')
    lag_days = models.IntegerField(default=0)

    def __str__(self):
        return f'{self.predecessor.name} -> {self.successor.name} ({self.dependency_type}+{self.lag_days})'


class ResourceAssignment(models.Model):
    RESOURCE_TYPES = [
        ('labor', 'Labor'),
        ('equipment', 'Equipment'),
        ('material', 'Material'),
    ]

    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='resources')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    name = models.CharField(max_length=255)
    quantity = models.FloatField(default=1)
    unit = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f'{self.name} x{self.quantity} -> {self.activity.name}'
