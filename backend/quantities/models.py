from django.db import models
from projects.models import Project, Floor


class Element(models.Model):
    ELEMENT_TYPES = [
        ('foundation', 'Foundation'),
        ('column', 'Column'),
        ('beam', 'Beam'),
        ('solid_slab', 'Solid Slab'),
        ('ribbed_slab', 'Ribbed Slab'),
        ('steel_beam', 'Steel Beam (AISC)'),
        ('steel_column', 'Steel Column (AISC)'),
        ('steel_connection', 'Steel Connection'),
        ('retaining_wall', 'Retaining Wall'),
        ('stairs', 'Stairs'),
        ('blockwork', 'Blockwork'),
        ('brickwork', 'Brickwork'),
        ('tiling', 'Tiling'),
        ('painting', 'Painting'),
        ('waterproofing', 'Waterproofing'),
        ('insulation', 'Insulation'),
        ('earthwork', 'Earthwork'),
        # Infrastructure
        ('road_pavement', 'Road Pavement'),
        ('water_pipe', 'Water Supply Pipe'),
        ('sewage_pipe', 'Sewage Pipe'),
        ('manhole', 'Manhole'),
        ('sidewalk', 'Sidewalk'),
        ('curb', 'Curb / Road Barrier'),
        ('storm_drainage', 'Storm Drainage'),
        ('water_tank', 'Water Tank'),
        ('street_lighting', 'Street Lighting'),
    ]

    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name='elements', null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='infrastructure_elements', null=True, blank=True)
    element_type = models.CharField(max_length=50, choices=ELEMENT_TYPES)
    name = models.CharField(max_length=255, blank=True)
    count = models.IntegerField(help_text='Number of identical elements', default=1)
    dimensions = models.JSONField(help_text='Dimensions as key-value pairs in meters', default=dict)
    concrete_grade = models.CharField(max_length=50, blank=True, default='C30')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        location = self.floor or self.project
        return f'{location} - {self.name or self.get_element_type_display()}'


class MaterialQuantity(models.Model):
    MATERIAL_TYPES = [
        ('concrete', 'Concrete'),
        ('rebar', 'Rebar'),
        ('formwork', 'Formwork'),
        ('steel_beam', 'Steel Beam'),
        ('steel_column', 'Steel Column'),
        ('bolts', 'Bolts'),
        ('plate', 'Plate'),
        ('weld', 'Weld'),
        ('blocks', 'Blocks'),
        ('bricks', 'Bricks'),
        ('mortar', 'Mortar'),
        ('plaster', 'Plaster'),
        ('cement', 'Cement'),
        ('sand', 'Sand'),
        ('tiles', 'Tiles'),
        ('adhesive', 'Adhesive'),
        ('grout', 'Grout'),
        ('paint', 'Paint'),
        ('primer', 'Primer'),
        ('waterproofing', 'Waterproofing'),
        ('insulation', 'Insulation'),
        ('insulation_weight', 'Insulation Weight'),
        ('excavation', 'Excavation'),
        ('backfill', 'Backfill'),
        ('haul', 'Haul'),
        # Infrastructure
        ('subbase', 'Subbase'),
        ('base_course', 'Base Course'),
        ('asphalt', 'Asphalt Concrete'),
        ('prime_coat', 'Prime Coat'),
        ('tack_coat', 'Tack Coat'),
        ('bedding_sand', 'Bedding Sand'),
        ('pipe_di', 'Ductile Iron Pipe'),
        ('pipe_pvc', 'PVC Pipe'),
        ('pipe_hdpe', 'HDPE Pipe'),
        ('pipe_concrete', 'Concrete Pipe'),
        ('frame_cover', 'Frame & Cover'),
        ('pavement', 'Pavement'),
        ('pole', 'Lighting Pole'),
        ('luminaire', 'Luminaire'),
        ('cable', 'Cable'),
    ]
    UNIT_CHOICES = [
        ('m3', 'Cubic Meter'),
        ('kg', 'Kilogram'),
        ('m2', 'Square Meter'),
        ('ton', 'Ton'),
        ('m', 'Meter'),
    ]

    element = models.ForeignKey(Element, on_delete=models.CASCADE, related_name='quantities')
    material_type = models.CharField(max_length=50, choices=MATERIAL_TYPES)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    value = models.FloatField(default=0)
    spec_reference = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f'{self.element} - {self.material_type}: {self.value} {self.unit}'
