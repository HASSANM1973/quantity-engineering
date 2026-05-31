from .base import BaseCalculator
from .aci_rebar import BAR_DATA


class FoundationCalculator(BaseCalculator):
    element_type = 'foundation'

    def concrete_volume(self):
        L = self.get_d('length')
        W = self.get_d('width')
        H = self.get_d('height')
        return L * W * H * self.count

    def formwork_area(self):
        L = self.get_d('length')
        W = self.get_d('width')
        H = self.get_d('height')
        perimeter = 2 * (L + W)
        return perimeter * H * self.count

    def rebar_weight(self):
        L = self.get_d('length')
        W = self.get_d('width')
        bar_dia = self.get_d('bar_diameter', 12)
        spacing = self.get_d('spacing', 0.15)
        cover = self.get_d('cover', 0.05)

        eff_L = L - 2 * cover
        eff_W = W - 2 * cover
        bars_long = int(eff_W / spacing) + 1
        bars_short = int(eff_L / spacing) + 1
        total_length = (bars_long * eff_L + bars_short * eff_W) * self.count
        w = BAR_DATA.get(int(bar_dia), BAR_DATA[12])['weight_kg_per_m']
        return total_length * w

    def bar_schedule(self):
        L = self.get_d('length')
        W = self.get_d('width')
        bar_dia = int(self.get_d('bar_diameter', 12))
        spacing = self.get_d('spacing', 0.15)
        cover = self.get_d('cover', 0.05)

        eff_L = L - 2 * cover
        eff_W = W - 2 * cover
        bars_long = int(eff_W / spacing) + 1
        bars_short = int(eff_L / spacing) + 1

        return [
            {'dia': bar_dia, 'count': bars_long * self.count, 'length': eff_L, 'shape_code': '1', 'shape_desc': 'Straight Bar (Long Direction)'},
            {'dia': bar_dia, 'count': bars_short * self.count, 'length': eff_W, 'shape_code': '1', 'shape_desc': 'Straight Bar (Short Direction)'},
        ]
