from .base import BaseCalculator
from .aci_rebar import BAR_DATA


class RetainingWallCalculator(BaseCalculator):
    element_type = 'retaining_wall'

    def concrete_volume(self):
        L = self.get_d('length')
        stem_h = self.get_d('stem_height', 3)
        stem_t = self.get_d('stem_top_thickness', 0.2)
        stem_b = self.get_d('stem_bottom_thickness', 0.3)
        base_w = self.get_d('base_width', 2.5)
        base_t = self.get_d('base_thickness', 0.4)

        stem_vol = (stem_t + stem_b) / 2 * stem_h * L
        base_vol = base_w * base_t * L
        return (stem_vol + base_vol) * self.count

    def formwork_area(self):
        L = self.get_d('length')
        stem_h = self.get_d('stem_height', 3)
        base_t = self.get_d('base_thickness', 0.4)

        stem_form = 2 * stem_h * L
        base_form = 2 * base_t * L
        return (stem_form + base_form) * self.count

    def rebar_weight(self):
        L = self.get_d('length')
        stem_h = self.get_d('stem_height', 3)
        bar_dia = int(self.get_d('bar_diameter', 16))
        spacing = self.get_d('spacing', 0.15)
        cover = self.get_d('cover', 0.05)
        bar_dia_h = int(self.get_d('horizontal_bar_diameter', 12))
        hor_spacing = self.get_d('horizontal_spacing', 0.20)

        vertical_count = int(L / spacing) + 1
        vert_len = vertical_count * (stem_h + 0.5) * self.count
        vert_weight = vert_len * BAR_DATA[bar_dia]['weight_kg_per_m']

        hor_count = int(stem_h / hor_spacing) + 1
        hor_len = hor_count * L * self.count
        hor_weight = hor_len * BAR_DATA[bar_dia_h]['weight_kg_per_m']

        return vert_weight + hor_weight

    def bar_schedule(self):
        L = self.get_d('length')
        stem_h = self.get_d('stem_height', 3)
        bar_dia = int(self.get_d('bar_diameter', 16))
        spacing = self.get_d('spacing', 0.15)
        bar_dia_h = int(self.get_d('horizontal_bar_diameter', 12))
        hor_spacing = self.get_d('horizontal_spacing', 0.20)

        vertical_count = int(L / spacing) + 1
        hor_count = int(stem_h / hor_spacing) + 1

        return [
            {'dia': bar_dia, 'count': vertical_count * self.count, 'length': stem_h + 0.5, 'shape_code': '7', 'shape_desc': 'Vertical Bar with Hook'},
            {'dia': bar_dia_h, 'count': hor_count * self.count, 'length': L, 'shape_code': '1', 'shape_desc': 'Horizontal Distribution Bar'},
        ]


class StairsCalculator(BaseCalculator):
    element_type = 'stairs'

    def concrete_volume(self):
        width = self.get_d('width', 1.2)
        rise = self.get_d('rise', 0.15)
        tread = self.get_d('tread', 0.30)
        num_steps = int(self.get_d('number_of_steps', 20))
        landing_thk = self.get_d('landing_thickness', 0.15)
        landing_length = self.get_d('landing_length', 1.2)

        step_vol = num_steps * (rise * tread / 2) * width
        slab_h = (num_steps * tread) * (rise / tread * tread + landing_thk)
        waist = num_steps * tread / (tread / (tread**2 + rise**2)**0.5)
        waist_vol = waist * landing_thk * width
        landing_vol = landing_length * width * landing_thk

        return (step_vol + waist_vol + landing_vol) * self.count

    def formwork_area(self):
        width = self.get_d('width', 1.2)
        num_steps = int(self.get_d('number_of_steps', 20))
        tread = self.get_d('tread', 0.30)
        rise = self.get_d('rise', 0.15)
        landing_length = self.get_d('landing_length', 1.2)

        soffit = num_steps * tread * width
        side = num_steps * (rise + tread) * (width * 0 + 0.15)
        landing_form = landing_length * width

        return (soffit + landing_form) * self.count

    def rebar_weight(self):
        width = self.get_d('width', 1.2)
        num_steps = int(self.get_d('number_of_steps', 20))
        tread = self.get_d('tread', 0.30)
        bar_dia = int(self.get_d('bar_diameter', 12))
        spacing = self.get_d('spacing', 0.15)

        total_len = num_steps * tread
        bar_count = int(width / spacing) + 1
        main_rebar = bar_count * total_len * self.count
        main_weight = main_rebar * BAR_DATA[bar_dia]['weight_kg_per_m']

        dist_bar_dia = int(self.get_d('distribution_bar_diameter', 10))
        dist_count = int(total_len / 0.20) + 1
        dist_len = dist_count * width * self.count
        dist_weight = dist_len * BAR_DATA[dist_bar_dia]['weight_kg_per_m']

        return main_weight + dist_weight
