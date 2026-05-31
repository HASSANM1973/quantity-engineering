from .base import BaseCalculator

BLOCK_SIZES = {
    '4_inch': {'length': 0.4, 'height': 0.2, 'thickness': 0.1, 'unit_per_m2': 12.5, 'mortar_m3_per_m2': 0.012},
    '6_inch': {'length': 0.4, 'height': 0.2, 'thickness': 0.15, 'unit_per_m2': 12.5, 'mortar_m3_per_m2': 0.015},
    '8_inch': {'length': 0.4, 'height': 0.2, 'thickness': 0.2, 'unit_per_m2': 12.5, 'mortar_m3_per_m2': 0.018},
}

BRICK_SIZES = {
    'standard': {'length': 0.25, 'height': 0.075, 'thickness': 0.12, 'unit_per_m2': 53, 'mortar_m3_per_m2': 0.020},
}

MORTAR_MIX = {
    '1:3': {'cement_kg_per_m3': 480, 'sand_m3_per_m3': 1.05},
    '1:4': {'cement_kg_per_m3': 360, 'sand_m3_per_m3': 1.08},
    '1:5': {'cement_kg_per_m3': 290, 'sand_m3_per_m3': 1.10},
    '1:6': {'cement_kg_per_m3': 240, 'sand_m3_per_m3': 1.12},
}

PLASTER_MIX = {
    '1:3': {'cement_kg_per_m3': 550, 'sand_m3_per_m3': 1.05},
    '1:4': {'cement_kg_per_m3': 440, 'sand_m3_per_m3': 1.08},
    '1:5': {'cement_kg_per_m3': 350, 'sand_m3_per_m3': 1.10},
    '1:6': {'cement_kg_per_m3': 290, 'sand_m3_per_m3': 1.12},
}


class BlockworkCalculator(BaseCalculator):
    element_type = 'blockwork'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        wall_length = self.get_d('wall_length')
        wall_height = self.get_d('wall_height')
        opening_area = self.get_d('openings_area_m2', 0)
        block_type = self.get_s('block_size', '8_inch')
        mix = self.get_s('mortar_mix', '1:4')
        plaster_thk_mm = self.get_d('plaster_thickness_mm', 15)

        block_info = BLOCK_SIZES.get(block_type, BLOCK_SIZES['8_inch'])
        mortar_info = MORTAR_MIX.get(mix, MORTAR_MIX['1:4'])
        plaster_info = PLASTER_MIX.get(mix, PLASTER_MIX['1:4'])

        net_area = wall_length * wall_height - opening_area
        if net_area < 0:
            net_area = 0

        block_count = int(net_area * block_info['unit_per_m2'])
        mortar_vol = net_area * block_info['mortar_m3_per_m2']
        cement_mortar = mortar_vol * mortar_info['cement_kg_per_m3']
        sand_mortar = mortar_vol * mortar_info['sand_m3_per_m3']

        plaster_vol = net_area * (plaster_thk_mm / 1000) * 2
        cement_plaster = plaster_vol * plaster_info['cement_kg_per_m3']
        sand_plaster = plaster_vol * plaster_info['sand_m3_per_m3']

        return {
            'blocks': {
                'value': block_count,
                'unit': 'units',
                'spec_reference': 'ASTM C90',
                'details': {
                    'block_type': block_type,
                    'net_wall_area_m2': round(net_area, 2),
                    'units_per_m2': block_info['unit_per_m2'],
                }
            },
            'mortar': {
                'value': round(mortar_vol, 3),
                'unit': 'm3',
                'spec_reference': 'ASTM C270',
            },
            'cement': {
                'value': round(cement_mortar + cement_plaster, 1),
                'unit': 'kg',
                'spec_reference': 'ASTM C150',
            },
            'sand': {
                'value': round(sand_mortar + sand_plaster, 3),
                'unit': 'm3',
                'spec_reference': 'ASTM C33',
            },
            'plaster': {
                'value': round(plaster_vol, 3),
                'unit': 'm3',
                'spec_reference': 'ASTM C926',
                'details': {
                    'thickness_mm': int(plaster_thk_mm),
                    'area_m2': round(net_area * 2, 2),
                }
            },
        }


class BrickworkCalculator(BaseCalculator):
    element_type = 'brickwork'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        wall_length = self.get_d('wall_length')
        wall_height = self.get_d('wall_height')
        opening_area = self.get_d('openings_area_m2', 0)
        brick_type = self.get_s('brick_size', 'standard')
        mix = self.get_s('mortar_mix', '1:4')

        brick_info = BRICK_SIZES.get(brick_type, BRICK_SIZES['standard'])
        mortar_info = MORTAR_MIX.get(mix, MORTAR_MIX['1:4'])

        net_area = wall_length * wall_height - opening_area
        brick_count = int(net_area * brick_info['unit_per_m2'])
        mortar_vol = net_area * brick_info['mortar_m3_per_m2']
        cement_kg = mortar_vol * mortar_info['cement_kg_per_m3']
        sand_m3 = mortar_vol * mortar_info['sand_m3_per_m3']

        return {
            'bricks': {
                'value': brick_count,
                'unit': 'units',
                'spec_reference': 'ASTM C216',
                'details': {
                    'units_per_m2': brick_info['unit_per_m2'],
                    'net_area_m2': round(net_area, 2),
                }
            },
            'mortar': {
                'value': round(mortar_vol, 3),
                'unit': 'm3',
                'spec_reference': 'ASTM C270',
            },
            'cement': {
                'value': round(cement_kg, 1),
                'unit': 'kg',
                'spec_reference': 'ASTM C150',
            },
            'sand': {
                'value': round(sand_m3, 3),
                'unit': 'm3',
                'spec_reference': 'ASTM C33',
            },
        }
