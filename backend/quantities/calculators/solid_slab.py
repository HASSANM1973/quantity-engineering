from .base import BaseCalculator


class SolidSlabCalculator(BaseCalculator):
    element_type = 'solid_slab'

    def concrete_volume(self):
        L = self.get_d('length')
        W = self.get_d('width')
        t = self.get_d('thickness')
        return L * W * t * self.count

    def formwork_area(self):
        L = self.get_d('length')
        W = self.get_d('width')
        return L * W * self.count

    def rebar_weight(self):
        L = self.get_d('length')
        W = self.get_d('width')
        bar_dia = self.get_d('bar_diameter', 12)
        spacing = self.get_d('spacing', 0.15)
        cover = self.get_d('cover', 0.025)

        bar_weight_per_m = {10: 0.617, 12: 0.888, 14: 1.208, 16: 1.578, 18: 1.998,
                           20: 2.466, 22: 2.984, 25: 3.853, 28: 4.834, 32: 6.313}

        eff_L = L - 2 * cover
        eff_W = W - 2 * cover

        bars_long = int(eff_W / spacing) + 1
        bars_short = int(eff_L / spacing) + 1

        total_length = (bars_long * eff_L + bars_short * eff_W) * self.count
        w = bar_weight_per_m.get(int(bar_dia), 0.888)
        return total_length * w * 2
