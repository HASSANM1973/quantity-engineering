from .base import BaseCalculator
from .aci_rebar import BAR_DATA


class BeamCalculator(BaseCalculator):
    element_type = 'beam'

    def concrete_volume(self):
        b = self.get_d('width')
        h = self.get_d('depth')
        L = self.get_d('length')
        span_count = int(self.get_d('span_count', 1))
        return b * h * L * span_count * self.count

    def formwork_area(self):
        b = self.get_d('width')
        h = self.get_d('depth')
        L = self.get_d('length')
        span_count = int(self.get_d('span_count', 1))
        bottom = b * L
        sides = 2 * h * L
        return (bottom + sides) * span_count * self.count

    def rebar_weight(self):
        L = self.get_d('length')
        span_count = int(self.get_d('span_count', 1))
        bar_dia_top = int(self.get_d('bar_diameter_top', 16))
        bar_dia_bot = int(self.get_d('bar_diameter_bottom', 16))
        bar_count_top = int(self.get_d('bar_count_top', 3))
        bar_count_bot = int(self.get_d('bar_count_bottom', 3))
        stirrup_dia = int(self.get_d('stirrup_diameter', 10))
        stirrup_spacing = self.get_d('stirrup_spacing', 0.15)
        cover = self.get_d('cover', 0.04)
        b = self.get_d('width')
        h = self.get_d('depth')

        total_L = L * span_count * self.count
        top_weight = bar_count_top * total_L * BAR_DATA[bar_dia_top]['weight_kg_per_m']
        bot_weight = bar_count_bot * total_L * BAR_DATA[bar_dia_bot]['weight_kg_per_m']

        stirrup_count = int(total_L / stirrup_spacing) + 1
        stirrup_perimeter = 2 * ((b - 2 * cover) + (h - 2 * cover))
        stirrup_weight = stirrup_count * stirrup_perimeter * BAR_DATA[stirrup_dia]['weight_kg_per_m']

        return top_weight + bot_weight + stirrup_weight

    def bar_schedule(self):
        L = self.get_d('length')
        span_count = int(self.get_d('span_count', 1))
        bar_dia_top = int(self.get_d('bar_diameter_top', 16))
        bar_dia_bot = int(self.get_d('bar_diameter_bottom', 16))
        bar_count_top = int(self.get_d('bar_count_top', 3))
        bar_count_bot = int(self.get_d('bar_count_bottom', 3))
        stirrup_dia = int(self.get_d('stirrup_diameter', 10))
        stirrup_spacing = self.get_d('stirrup_spacing', 0.15)
        cover = self.get_d('cover', 0.04)
        b = self.get_d('width')
        h = self.get_d('depth')

        a = b - 2 * cover
        stirrup_count = int(L * span_count * self.count / stirrup_spacing) + 1
        hook = 0.10
        stirrup_perimeter = 2 * (a + h - 2 * cover)

        return [
            {'dia': bar_dia_top, 'count': bar_count_top * span_count * self.count, 'length': L, 'shape_code': '1', 'shape_desc': 'Top Reinforcement'},
            {'dia': bar_dia_bot, 'count': bar_count_bot * span_count * self.count, 'length': L, 'shape_code': '1', 'shape_desc': 'Bottom Reinforcement'},
            {'dia': stirrup_dia, 'count': stirrup_count, 'length': stirrup_perimeter + 2 * hook, 'shape_code': 'Stirrup', 'shape_desc': f'Stirrup {int(a*1000)}x{int((h-2*cover)*1000)} mm'},
        ]
