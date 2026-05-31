from .base import BaseCalculator

SOIL_TYPES = {
    'sand': {'density_kg_m3': 1800, 'swell_pct': 15, 'shrink_pct': 10},
    'silty_sand': {'density_kg_m3': 1850, 'swell_pct': 20, 'shrink_pct': 12},
    'clay': {'density_kg_m3': 1900, 'swell_pct': 30, 'shrink_pct': 15},
    'gravel': {'density_kg_m3': 2000, 'swell_pct': 10, 'shrink_pct': 5},
    'rock': {'density_kg_m3': 2600, 'swell_pct': 40, 'shrink_pct': 3},
}

COMPACTION_FACTORS = {
    'sand': 0.85,
    'silty_sand': 0.88,
    'clay': 0.90,
    'gravel': 0.82,
    'rock': 0.75,
}


class EarthworkCalculator(BaseCalculator):
    element_type = 'earthwork'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        length = self.get_d('length')
        width = self.get_d('width')
        depth = self.get_d('depth')
        soil_type = self.get_s('soil_type', 'sand')
        depth_to_rock = self.get_d('depth_to_rock_m', 0)

        soil_info = SOIL_TYPES.get(soil_type, SOIL_TYPES['sand'])

        vol_bank = length * width * depth
        vol_swell = vol_bank * (1 + soil_info['swell_pct'] / 100)
        vol_compact = vol_bank * (1 - soil_info['shrink_pct'] / 100)

        mass = vol_bank * soil_info['density_kg_m3']

        excavation_type = 'Common Earth'
        if soil_type == 'rock':
            excavation_type = 'Rock'
        elif depth_to_rock > 0:
            excavation_type = 'Earth over Rock'

        return {
            'excavation': {
                'value': round(vol_bank, 3),
                'unit': 'm3',
                'spec_reference': 'ASTM D2488 / OSHA 1926',
                'details': {
                    'soil_type': soil_type,
                    'excavation_class': excavation_type,
                    'dimensions_m': f'{length}x{width}x{depth}',
                }
            },
            'backfill': {
                'value': round(vol_compact, 3),
                'unit': 'm3',
                'spec_reference': 'ASTM D698 (Proctor)',
                'details': {
                    'compaction_required': '95% Standard Proctor',
                    'compacted_vol_m3': round(vol_compact, 3),
                }
            },
            'haul': {
                'value': round(vol_swell, 3),
                'unit': 'm3 (loose)',
                'spec_reference': 'ASTM D2844',
                'details': {
                    'swell_pct': soil_info['swell_pct'],
                    'loose_vol_m3': round(vol_swell, 3),
                    'mass_kg': round(mass, 0),
                }
            },
        }
