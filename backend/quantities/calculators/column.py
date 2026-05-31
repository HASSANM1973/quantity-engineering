from .base import BaseCalculator
from .aci_rebar import BAR_DATA


class ColumnCalculator(BaseCalculator):
    element_type = 'column'

    def concrete_volume(self):
        b = self.get_d('width')
        h = self.get_d('depth')
        height = self.get_d('height')
        return b * h * height * self.count

    def formwork_area(self):
        b = self.get_d('width')
        h = self.get_d('depth')
        height = self.get_d('height')
        perimeter = 2 * (b + h)
        return perimeter * height * self.count

    def rebar_weight(self):
        height = self.get_d('height')
        bar_dia = int(self.get_d('bar_diameter', 16))
        bar_count = int(self.get_d('bar_count', 8))
        tie_dia = int(self.get_d('tie_diameter', 10))
        tie_spacing = self.get_d('tie_spacing', 0.20)
        cover = self.get_d('cover', 0.04)
        b = self.get_d('width')
        h = self.get_d('depth')

        vertical_length = bar_count * height * self.count
        vert_weight = vertical_length * BAR_DATA[bar_dia]['weight_kg_per_m']

        tie_count = int(height / tie_spacing) + 1
        tie_perimeter = 2 * ((b - 2 * cover) + (h - 2 * cover))
        total_ties = tie_count * tie_perimeter * self.count
        tie_weight = total_ties * BAR_DATA[tie_dia]['weight_kg_per_m']

        return vert_weight + tie_weight

    def bar_schedule(self):
        height = self.get_d('height')
        bar_dia = int(self.get_d('bar_diameter', 16))
        bar_count = int(self.get_d('bar_count', 8))
        tie_dia = int(self.get_d('tie_diameter', 10))
        tie_spacing = self.get_d('tie_spacing', 0.20)
        cover = self.get_d('cover', 0.04)
        b = self.get_d('width')
        h = self.get_d('depth')

        a = b - 2 * cover
        hook = 0.10

        tie_count = int(height / tie_spacing) + 1
        tie_perimeter = 2 * (a + h - 2 * cover)

        return [
            {'dia': bar_dia, 'count': bar_count * self.count, 'length': height, 'shape_code': '1', 'shape_desc': 'Vertical Bar'},
            {'dia': tie_dia, 'count': tie_count * self.count, 'length': tie_perimeter + 2 * hook, 'shape_code': 'Stirrup', 'shape_desc': f'Tie {int(a*1000)}x{int((h-2*cover)*1000)} mm'},
        ]
