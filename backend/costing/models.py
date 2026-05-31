from django.db import models
from projects.models import Project
from quantities.models import Element, MaterialQuantity


class MaterialPrice(models.Model):
    material_type = models.CharField(max_length=50)
    unit = models.CharField(max_length=10)
    unit_price = models.FloatField(help_text='Price per unit in EGP')
    category = models.CharField(max_length=50, blank=True, help_text='e.g. concrete, rebar, masonry')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('material_type', 'unit')

    def __str__(self):
        return f'{self.material_type} = {self.unit_price} EGP/{self.unit}'


class LaborRate(models.Model):
    trade = models.CharField(max_length=100)
    unit = models.CharField(max_length=20, help_text='day, m2, m3, ton')
    rate = models.FloatField(help_text='Rate in EGP per unit')
    crew_size = models.IntegerField(default=1)

    def __str__(self):
        return f'{self.trade}: {self.rate} EGP/{self.unit}'


class CostEstimate(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='cost_estimates')
    name = models.CharField(max_length=255, default='Main Estimate')
    markup_percent = models.FloatField(default=15, help_text='Overhead & profit %')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.project.name} - {self.name}'


class CostItem(models.Model):
    estimate = models.ForeignKey(CostEstimate, on_delete=models.CASCADE, related_name='items')
    element = models.ForeignKey(Element, on_delete=models.SET_NULL, null=True, blank=True)
    material_type = models.CharField(max_length=50)
    description = models.CharField(max_length=255)
    quantity = models.FloatField()
    unit = models.CharField(max_length=10)
    unit_price = models.FloatField(default=0)
    total_cost = models.FloatField(default=0)

    def save(self, *args, **kwargs):
        self.total_cost = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.description}: {self.quantity} x {self.unit_price}'
