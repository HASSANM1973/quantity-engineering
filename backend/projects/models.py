from django.db import models
from django.conf import settings


class Project(models.Model):
    PROJECT_TYPES = [
        ('residential', 'Residential'),
        ('commercial', 'Commercial'),
        ('infrastructure', 'Infrastructure'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='projects')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    project_type = models.CharField(max_length=50, choices=PROJECT_TYPES, default='residential')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Site(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sites')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    site_area = models.FloatField(help_text='Site area in m²', default=0)

    def __str__(self):
        return f'{self.project.name} - {self.name}'


class Floor(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='floors')
    name = models.CharField(max_length=255)
    floor_number = models.IntegerField(default=0)
    level_elevation = models.FloatField(help_text='Elevation in meters', default=0)
    floor_area = models.FloatField(help_text='Floor area in m²', default=0)

    class Meta:
        ordering = ['floor_number']

    def __str__(self):
        return f'{self.site.name} - {self.name}'
