from .base import BaseCalculator

# ──────────────────────────────────────────────
# ROAD PAVEMENT
# ──────────────────────────────────────────────

class RoadPavementCalculator(BaseCalculator):
    element_type = 'road_pavement'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        L = self.get_d('length')
        W = self.get_d('width')
        asphalt_thk = self.get_d('asphalt_thickness')
        base_thk = self.get_d('base_thickness')
        subbase_thk = self.get_d('subbase_thickness')

        asphalt_vol = L * W * asphalt_thk
        base_vol = L * W * base_thk
        subbase_vol = L * W * subbase_thk
        area = L * W

        ASPHALT_DENSITY = 2.35  # ton/m3
        asphalt_ton = asphalt_vol * ASPHALT_DENSITY

        return {
            'excavation': {
                'value': round(L * W * (asphalt_thk + base_thk + subbase_thk), 3),
                'unit': 'm3',
                'spec_reference': 'Standard Specifications for Roads'
            },
            'subbase': {
                'value': round(subbase_vol, 3),
                'unit': 'm3',
                'spec_reference': 'AASHTO M147'
            },
            'base_course': {
                'value': round(base_vol, 3),
                'unit': 'm3',
                'spec_reference': 'AASHTO M147'
            },
            'asphalt': {
                'value': round(asphalt_ton, 2),
                'unit': 'ton',
                'spec_reference': 'AASHTO M332'
            },
            'prime_coat': {
                'value': round(area, 2),
                'unit': 'm2',
                'spec_reference': 'AASHTO M81'
            },
            'tack_coat': {
                'value': round(area, 2),
                'unit': 'm2',
                'spec_reference': 'AASHTO M82'
            },
        }


PIPE_MATERIALS = {
    'ductile_iron': {'wall_factor': 1.0},
    'pvc': {'wall_factor': 0.4},
    'hdpe': {'wall_factor': 0.5},
    'concrete': {'wall_factor': 1.2},
}


def _trench_calc(L, diam_mm, depth, pipe_key):
    diam_m = diam_mm / 1000
    trench_width = diam_m + 0.6
    if trench_width < 0.8:
        trench_width = 0.8

    excavation = L * trench_width * depth
    bedding_vol = L * trench_width * 0.15
    pipe_count = L
    backfill_vol = excavation - bedding_vol - (3.1416 * (diam_m / 2) ** 2 * L)

    pipe_type = PIPE_MATERIALS.get(pipe_key, PIPE_MATERIALS['ductile_iron'])

    return {
        'excavation': {
            'value': round(excavation, 3),
            'unit': 'm3',
            'spec_reference': 'OSHA 1926 Subpart P'
        },
        'bedding_sand': {
            'value': round(bedding_vol, 3),
            'unit': 'm3',
            'spec_reference': 'ASTM D2940'
        },
        f'pipe_{pipe_key}': {
            'value': round(pipe_count, 2),
            'unit': 'm',
            'spec_reference': f'AWWA C{pipe_key}'
        },
        'backfill': {
            'value': round(backfill_vol, 3),
            'unit': 'm3',
            'spec_reference': 'ASTM D698 (95% Proctor)'
        },
    }


# ──────────────────────────────────────────────
# WATER SUPPLY PIPE
# ──────────────────────────────────────────────

class WaterPipeCalculator(BaseCalculator):
    element_type = 'water_pipe'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        L = self.get_d('length')
        diam = self.get_d('diameter_mm', 100)
        depth = self.get_d('avg_depth', 1.2)
        pipe_mat = self.get_s('pipe_material', 'ductile_iron')
        return _trench_calc(L, diam, depth, pipe_mat)


# ──────────────────────────────────────────────
# SEWAGE PIPE
# ──────────────────────────────────────────────

class SewagePipeCalculator(BaseCalculator):
    element_type = 'sewage_pipe'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        L = self.get_d('length')
        diam = self.get_d('diameter_mm', 200)
        depth = self.get_d('avg_depth', 1.5)
        pipe_mat = self.get_s('pipe_material', 'pvc')
        results = _trench_calc(L, diam, depth, pipe_mat)

        manhole_spacing = 50
        manhole_count = max(1, int(L / manhole_spacing))
        results['frame_cover'] = {
            'value': manhole_count,
            'unit': 'unit',
            'spec_reference': 'EN 124 Class D400',
            'details': {'manhole_count': manhole_count, 'spacing_m': manhole_spacing}
        }
        return results


# ──────────────────────────────────────────────
# MANHOLE
# ──────────────────────────────────────────────

class ManholeCalculator(BaseCalculator):
    element_type = 'manhole'

    def concrete_volume(self):
        depth = self.get_d('depth', 2.0)
        diam = self.get_d('diameter', 1.5)
        wall_thk = self.get_d('wall_thickness', 0.2)
        base_slab_thk = 0.25

        wall_vol = 3.1416 * diam * wall_thk * depth
        base_vol = 3.1416 * (diam / 2 + wall_thk) ** 2 * base_slab_thk
        return wall_vol + base_vol

    def formwork_area(self):
        depth = self.get_d('depth', 2.0)
        diam = self.get_d('diameter', 1.5)
        return 2 * 3.1416 * (diam / 2) * depth

    def rebar_weight(self):
        vol = self.concrete_volume()
        return vol * 80

    def extra_results(self):
        return {
            'excavation': {
                'value': round(self.get_d('depth', 2.0) * 3.1416 * (self.get_d('diameter', 1.5) / 2 + 0.5) ** 2, 3),
                'unit': 'm3',
                'spec_reference': 'OSHA 1926 Subpart P'
            },
            'frame_cover': {
                'value': 1,
                'unit': 'unit',
                'spec_reference': 'EN 124 Class D400'
            },
        }


# ──────────────────────────────────────────────
# SIDEWALK
# ──────────────────────────────────────────────

class SidewalkCalculator(BaseCalculator):
    element_type = 'sidewalk'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        L = self.get_d('length')
        W = self.get_d('width')
        thk = self.get_d('thickness', 0.1)
        base_thk = self.get_d('base_thickness', 0.15)
        pave_type = self.get_s('pavement_type', 'interlock')

        area = L * W
        base_vol = area * base_thk
        excav_vol = area * (thk + base_thk)

        if pave_type == 'concrete':
            pave_result = {'value': round(area * thk, 3), 'unit': 'm3'}
        else:
            pave_result = {'value': round(area, 2), 'unit': 'm2'}

        return {
            'excavation': {
                'value': round(excav_vol, 3),
                'unit': 'm3',
                'spec_reference': 'Standard Specs'
            },
            'base_course': {
                'value': round(base_vol, 3),
                'unit': 'm3',
                'spec_reference': 'AASHTO M147'
            },
            'pavement': pave_result,
            'backfill': {
                'value': round(excav_vol * 0.1, 3),
                'unit': 'm3',
            },
        }


# ──────────────────────────────────────────────
# CURB / ROAD BARRIER
# ──────────────────────────────────────────────

class CurbCalculator(BaseCalculator):
    element_type = 'curb'

    def concrete_volume(self):
        L = self.get_d('length')
        curb_type = self.get_s('curb_type', 'mountable')
        sectional_area = 0.05 if curb_type == 'mountable' else 0.12
        return L * sectional_area

    def formwork_area(self):
        L = self.get_d('length')
        return L * 2

    def rebar_weight(self):
        return self.concrete_volume() * 60

    def extra_results(self):
        return {}


# ──────────────────────────────────────────────
# STORM DRAINAGE
# ──────────────────────────────────────────────

class StormDrainageCalculator(BaseCalculator):
    element_type = 'storm_drainage'

    def concrete_volume(self):
        return 0

    def formwork_area(self):
        return 0

    def rebar_weight(self):
        return 0

    def extra_results(self):
        L = self.get_d('length')
        diam = self.get_d('diameter_mm', 300)
        depth = self.get_d('depth', 1.5)
        pipe_mat = self.get_s('pipe_material', 'concrete')
        results = _trench_calc(L, diam, depth, pipe_mat)

        cb_spacing = 30
        cb_count = max(1, int(L / cb_spacing))
        results['frame_cover'] = {
            'value': cb_count,
            'unit': 'unit',
            'spec_reference': 'EN 124 Class C250',
            'details': {'catch_basin_count': cb_count, 'spacing_m': cb_spacing}
        }
        return results


# ──────────────────────────────────────────────
# WATER TANK
# ──────────────────────────────────────────────

class WaterTankCalculator(BaseCalculator):
    element_type = 'water_tank'

    def concrete_volume(self):
        cap = self.get_d('capacity', 100)
        H = self.get_d('height', 4.0)
        D = self.get_d('diameter', 0)
        L = self.get_d('length', 0)
        W = self.get_d('width', 0)

        if D > 0:
            A = 3.1416 * (D / 2) ** 2
        else:
            A = L * W if L > 0 and W > 0 else cap / H if H > 0 else 25

        wall_thk = 0.3
        base_thk = 0.4
        roof_thk = 0.15

        perimeter = 2 * (L + W) if L > 0 and W > 0 else 3.1416 * D
        wall_vol = perimeter * H * wall_thk
        base_vol = A * base_thk
        roof_vol = A * roof_thk
        return wall_vol + base_vol + roof_vol

    def formwork_area(self):
        cap = self.get_d('capacity', 100)
        H = self.get_d('height', 4.0)
        D = self.get_d('diameter', 0)
        L = self.get_d('length', 0)
        W = self.get_d('width', 0)
        A = (3.1416 * (D / 2) ** 2) if D > 0 else (L * W if L > 0 and W > 0 else cap / H if H > 0 else 25)

        return 2 * A + (2 * (L + W) * H if L > 0 and W > 0 else 3.1416 * D * H)

    def rebar_weight(self):
        return self.concrete_volume() * 100

    def extra_results(self):
        return {}


# ──────────────────────────────────────────────
# STREET LIGHTING
# ──────────────────────────────────────────────

class StreetLightingCalculator(BaseCalculator):
    element_type = 'street_lighting'

    def concrete_volume(self):
        count = self.get_d('pole_count', 1)
        return count * 0.5

    def formwork_area(self):
        count = self.get_d('pole_count', 1)
        return count * 2.0

    def rebar_weight(self):
        return self.concrete_volume() * 80

    def extra_results(self):
        count = int(self.get_d('pole_count', 1))
        pole_h = self.get_d('pole_height', 9)
        spacing = self.get_d('spacing', 30)
        cable_L = self.get_d('cable_length', 0)

        if cable_L <= 0:
            cable_L = count * spacing

        return {
            'excavation': {
                'value': round(count * 1.0, 3),
                'unit': 'm3',
                'spec_reference': 'IEC 60364'
            },
            'pole': {
                'value': count,
                'unit': 'unit',
                'spec_reference': f'ISO 1461 ({pole_h}m height)'
            },
            'cable': {
                'value': round(cable_L, 2),
                'unit': 'm',
                'spec_reference': 'IEC 60502'
            },
            'luminaire': {
                'value': count,
                'unit': 'unit',
                'spec_reference': 'IESNA RP-8',
                'details': {'pole_height_m': pole_h, 'spacing_m': spacing}
            },
        }
