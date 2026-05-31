from .base import BaseCalculator

WATERPROOFING_TYPES = {
    'bituminous_membrane': {'coverage_m2_per_m2': 1.1, 'primer_kg_per_m2': 0.3},
    'liquid_membrane': {'coverage_m2_per_m2': 1.05, 'primer_kg_per_m2': 0.2},
    'cementitious': {'coverage_m2_per_m2': 1.05, 'primer_kg_per_m2': 0},
    'pvc_membrane': {'coverage_m2_per_m2': 1.15, 'primer_kg_per_m2': 0.3},
}

INSULATION_TYPES = {
    'polystyrene_xps': {'thk_mm': 50, 'm2_per_pack': 5, 'weight_kg_per_m3': 35, 'r_value_per_mm': 0.029},
    'polystyrene_eps': {'thk_mm': 50, 'm2_per_pack': 4, 'weight_kg_per_m3': 20, 'r_value_per_mm': 0.028},
    'polyurethane': {'thk_mm': 40, 'm2_per_pack': 3, 'weight_kg_per_m3': 40, 'r_value_per_mm': 0.040},
    'rockwool': {'thk_mm': 50, 'm2_per_pack': 4, 'weight_kg_per_m3': 100, 'r_value_per_mm': 0.045},
    'fiberglass': {'thk_mm': 50, 'm2_per_pack': 6, 'weight_kg_per_m3': 16, 'r_value_per_mm': 0.044},
}


class WaterproofingCalculator(BaseCalculator):
    element_type = 'waterproofing'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        area = self.get_d('area_m2')
        wp_type = self.get_s('waterproofing_type', 'bituminous_membrane')
        wp_info = WATERPROOFING_TYPES.get(wp_type, WATERPROOFING_TYPES['bituminous_membrane'])

        membrane_m2 = area * wp_info['coverage_m2_per_m2']
        primer_kg = area * wp_info['primer_kg_per_m2']

        return {
            'waterproofing': {
                'value': round(membrane_m2, 2),
                'unit': 'm2',
                'spec_reference': 'ASTM D6162 / D6380',
                'details': {
                    'type': wp_type,
                    'net_m2': round(membrane_m2, 2),
                }
            },
            'primer': {
                'value': round(primer_kg, 1),
                'unit': 'kg',
                'spec_reference': 'ASTM D41',
            },
        }


class InsulationCalculator(BaseCalculator):
    element_type = 'insulation'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        area = self.get_d('area_m2')
        ins_type = self.get_s('insulation_type', 'polystyrene_xps')
        ins_info = INSULATION_TYPES.get(ins_type, INSULATION_TYPES['polystyrene_xps'])
        thk_mm = self.get_d('thickness_mm', ins_info['thk_mm'])

        r_value = thk_mm * ins_info['r_value_per_mm']
        packs_needed = int(area / ins_info['m2_per_pack']) + 1
        weight = area * (thk_mm / 1000) * ins_info['weight_kg_per_m3']

        return {
            'insulation': {
                'value': round(area, 2),
                'unit': 'm2',
                'spec_reference': 'ASTM C578 / C1289',
                'details': {
                    'type': ins_type,
                    'thickness_mm': int(thk_mm),
                    'r_value': round(r_value, 2),
                    'packs': packs_needed,
                }
            },
            'insulation_weight': {
                'value': round(weight, 1),
                'unit': 'kg',
                'spec_reference': 'ASTM C303',
            },
        }
