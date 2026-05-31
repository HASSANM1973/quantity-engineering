from .base import BaseCalculator

TILE_TYPES = {
    'ceramic': {'waste': 1.08, 'adhesive_kg_per_m2': 4.5, 'grout_kg_per_m2': 1.2},
    'porcelain': {'waste': 1.08, 'adhesive_kg_per_m2': 5.0, 'grout_kg_per_m2': 1.0},
    'marble': {'waste': 1.10, 'adhesive_kg_per_m2': 6.0, 'grout_kg_per_m2': 0.8},
    'granite': {'waste': 1.10, 'adhesive_kg_per_m2': 6.5, 'grout_kg_per_m2': 0.8},
    'vinyl': {'waste': 1.05, 'adhesive_kg_per_m2': 3.0, 'grout_kg_per_m2': 0},
}

PAINT_COVERAGE = {
    'interior_emulsion': {'m2_per_liter': 10, 'coats': 2},
    'exterior_emulsion': {'m2_per_liter': 8, 'coats': 2},
    'oil_based': {'m2_per_liter': 12, 'coats': 2},
    'primer': {'m2_per_liter': 12, 'coats': 1},
}


class TilingCalculator(BaseCalculator):
    element_type = 'tiling'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        area = self.get_d('area_m2')
        tile_type = self.get_s('tile_type', 'ceramic')

        tile_info = TILE_TYPES.get(tile_type, TILE_TYPES['ceramic'])
        net_area = area * tile_info['waste']
        adhesive_kg = area * tile_info['adhesive_kg_per_m2']
        grout_kg = area * tile_info['grout_kg_per_m2']

        return {
            'tiles': {
                'value': round(net_area, 2),
                'unit': 'm2',
                'spec_reference': 'ASTM C1028',
                'details': {
                    'tile_type': tile_type,
                    'net_area_m2': round(net_area, 2),
                    'waste_pct': round((tile_info['waste'] - 1) * 100),
                }
            },
            'adhesive': {
                'value': round(adhesive_kg, 1),
                'unit': 'kg',
                'spec_reference': 'ASTM C557',
            },
            'grout': {
                'value': round(grout_kg, 1),
                'unit': 'kg',
                'spec_reference': 'ASTM C531',
            },
        }


class PaintingCalculator(BaseCalculator):
    element_type = 'painting'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        area = self.get_d('area_m2')
        paint_type = self.get_s('paint_type', 'interior_emulsion')

        paint_info = PAINT_COVERAGE.get(paint_type, PAINT_COVERAGE['interior_emulsion'])
        total_liters = (area / paint_info['m2_per_liter']) * paint_info['coats']

        primer_info = PAINT_COVERAGE['primer']
        primer_liters = area / primer_info['m2_per_liter']

        return {
            'paint': {
                'value': round(total_liters, 1),
                'unit': 'liter',
                'spec_reference': 'ASTM D16 / ISO 12944',
                'details': {
                    'paint_type': paint_type,
                    'coats': paint_info['coats'],
                }
            },
            'primer': {
                'value': round(primer_liters, 1),
                'unit': 'liter',
                'spec_reference': 'ASTM D16',
            },
        }
