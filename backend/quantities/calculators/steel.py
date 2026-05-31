from .base import BaseCalculator
from .aisc_shapes import STEEL_SHAPES


class SteelBeamCalculator(BaseCalculator):
    element_type = 'steel_beam'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        shape_name = self.get_s('shape_name', 'W12x26')
        shape = STEEL_SHAPES.get(shape_name)
        if not shape:
            shape = STEEL_SHAPES['W12x26']
        L = self.get_d('length', 6)
        count = self.get_d('count', 1)
        weight_kg = shape['weight'] * L * count
        return {
            'steel_beam': {
                'value': round(weight_kg / 1000, 3),
                'unit': 'ton',
                'spec_reference': 'AISC 360-22',
                'details': {
                    'shape': shape_name,
                    'weight_per_m': shape['weight'],
                    'length_m': L,
                    'count': int(count),
                    'd_mm': round(shape['d'] * 1000, 1),
                    'bf_mm': round(shape['bf'] * 1000, 1),
                }
            }
        }


class SteelColumnCalculator(BaseCalculator):
    element_type = 'steel_column'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        shape_name = self.get_s('shape_name', 'W12x26')
        shape = STEEL_SHAPES.get(shape_name)
        if not shape:
            shape = STEEL_SHAPES['W12x26']
        height = self.get_d('height', 3)
        count = self.get_d('count', 1)
        weight_kg = shape['weight'] * height * count
        return {
            'steel_column': {
                'value': round(weight_kg / 1000, 3),
                'unit': 'ton',
                'spec_reference': 'AISC 360-22',
                'details': {
                    'shape': shape_name,
                    'weight_per_m': shape['weight'],
                    'height_m': height,
                    'count': int(count),
                    'd_mm': round(shape['d'] * 1000, 1),
                    'bf_mm': round(shape['bf'] * 1000, 1),
                }
            }
        }


class SteelConnectionCalculator(BaseCalculator):
    element_type = 'steel_connection'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        bolt_dia = self.get_d('bolt_diameter_mm', 20)
        bolt_count = int(self.get_d('bolt_count', 8))
        plate_thk = self.get_d('plate_thickness_mm', 10)
        plate_area = self.get_d('plate_area_m2', 0.1)
        weld_length = self.get_d('weld_length_m', 0.5)
        count = self.get_d('count', 1)

        bolt_weight_per_100 = {16: 0.16, 20: 0.25, 22: 0.32, 24: 0.38, 27: 0.49, 30: 0.62}
        bolt_w = bolt_weight_per_100.get(int(bolt_dia), 0.25)

        steel_density = 7850
        plate_weight = plate_thk / 1000 * plate_area * steel_density

        return {
            'bolts': {
                'value': round(bolt_count * bolt_w * count, 2),
                'unit': 'kg',
                'spec_reference': 'AISC 360-22 / ASTM A325',
                'details': {
                    'bolt_diameter_mm': int(bolt_dia),
                    'bolt_count': int(bolt_count * count),
                }
            },
            'plate': {
                'value': round(plate_weight * count, 2),
                'unit': 'kg',
                'spec_reference': 'AISC 360-22 / ASTM A36',
                'details': {
                    'plate_thickness_mm': int(plate_thk),
                    'plate_area_m2': round(plate_area, 3),
                }
            },
            'weld': {
                'value': round(weld_length * count, 2),
                'unit': 'm',
                'spec_reference': 'AWS D1.1 / AISC 360-22',
            }
        }
