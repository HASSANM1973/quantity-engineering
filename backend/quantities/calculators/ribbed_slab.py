from .base import BaseCalculator


class RibbedSlabCalculator(BaseCalculator):
    element_type = 'ribbed_slab'

    def concrete_volume(self):
        L = self.get_d('length')
        W = self.get_d('width')
        t_slab = self.get_d('topping_slab_thickness', 0.07)
        rib_width = self.get_d('rib_width', 0.12)
        rib_depth = self.get_d('rib_depth', 0.25)
        rib_spacing = self.get_d('rib_spacing', 0.50)
        num_ribs = int(W / rib_spacing)

        topping_vol = L * W * t_slab
        one_rib = rib_width * rib_depth * L
        ribs_vol = one_rib * num_ribs

        return (topping_vol + ribs_vol) * self.count

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
        rib_spacing = self.get_d('rib_spacing', 0.50)
        rib_depth = self.get_d('rib_depth', 0.25)
        num_ribs = int(W / rib_spacing)

        bar_weight_per_m = {10: 0.617, 12: 0.888, 14: 1.208, 16: 1.578, 18: 1.998,
                           20: 2.466, 22: 2.984, 25: 3.853, 28: 4.834, 32: 6.313}

        eff_L = L - 2 * cover
        eff_W = W - 2 * cover

        mesh_bars_long = int(eff_W / spacing) + 1
        mesh_bars_short = int(eff_L / spacing) + 1
        mesh_weight = (mesh_bars_long * eff_L + mesh_bars_short * eff_W) * self.count
        mesh_weight *= bar_weight_per_m.get(int(bar_dia), 0.888)

        rib_bars = num_ribs * 2 * L * self.count
        rib_weight = rib_bars * bar_weight_per_m.get(int(bar_dia + 4), 1.208)

        stirrup_count = int(L / 0.20) + 1
        stirrup_perimeter = 2 * (rib_depth + 0.15)
        stirrup_weight = stirrup_count * stirrup_perimeter * num_ribs * self.count * 0.617

        return mesh_weight + rib_weight + stirrup_weight
