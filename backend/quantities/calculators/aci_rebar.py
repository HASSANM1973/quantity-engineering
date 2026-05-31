import math

BAR_DATA = {
    10: {'dia_mm': 10, 'dia_in': 0.375, 'area_mm2': 71, 'weight_kg_per_m': 0.617, 'us_size': '#3'},
    12: {'dia_mm': 12,  'dia_in': 0.500, 'area_mm2': 113, 'weight_kg_per_m': 0.888, 'us_size': '#4'},
    14: {'dia_mm': 14,  'dia_in': 0.625, 'area_mm2': 154, 'weight_kg_per_m': 1.208, 'us_size': '#5'},
    16: {'dia_mm': 16,  'dia_in': 0.750, 'area_mm2': 201, 'weight_kg_per_m': 1.578, 'us_size': '#6'},
    18: {'dia_mm': 18,  'dia_in': 0.875, 'area_mm2': 254, 'weight_kg_per_m': 1.998, 'us_size': '#7'},
    20: {'dia_mm': 20,  'dia_in': 1.000, 'area_mm2': 314, 'weight_kg_per_m': 2.466, 'us_size': '#8'},
    22: {'dia_mm': 22,  'dia_in': 1.125, 'area_mm2': 387, 'weight_kg_per_m': 2.984, 'us_size': '#9'},
    25: {'dia_mm': 25,  'dia_in': 1.250, 'area_mm2': 510, 'weight_kg_per_m': 3.853, 'us_size': '#10'},
    28: {'dia_mm': 28,  'dia_in': 1.375, 'area_mm2': 645, 'weight_kg_per_m': 4.834, 'us_size': '#11'},
    32: {'dia_mm': 32,  'dia_in': 1.500, 'area_mm2': 819, 'weight_kg_per_m': 6.313, 'us_size': '#14'},
}

STIRRUP_HOOK_LENGTH = {10: 0.10, 12: 0.12, 14: 0.14, 16: 0.16}

def get_bar(dia):
    return BAR_DATA.get(int(dia), BAR_DATA[12])


def development_length_tension(dia_mm, fc=28, fy=420, top_bar=False, lightweight=False):
    """
    ACI 318-19 Section 25.4.2 — Development length for deformed bars in tension (Ld)
    ld = (fy * psi_t * psi_e * psi_s) / (2.1 * lambda * sqrt(fc)) * db

    psi_t = 1.0 (other bars), 1.3 (top bars with >300mm concrete below)
    psi_e = 1.0 (uncoated), 1.5 (epoxy-coated with cover < 3db)
    psi_s = 0.8 (db <= 20mm), 1.0 (db >= 22mm)
    lambda = 1.0 (normal weight concrete), 0.85 (lightweight)
    """
    db = dia_mm / 1000.0
    psi_t = 1.3 if top_bar else 1.0
    psi_e = 1.0
    psi_s = 0.8 if dia_mm <= 20 else 1.0
    lmbda = 0.85 if lightweight else 1.0

    ld_m = (fy * psi_t * psi_e * psi_s) / (2.1 * lmbda * math.sqrt(fc)) * db
    return max(ld_m, 0.3)


def lap_splice_tension(ld, class_type='B'):
    """
    ACI 318-19 Section 25.5 — Lap splices
    Class A: 1.0 * ld (when area provided > 2x required, and < 50% lapped)
    Class B: 1.3 * ld (all other cases)
    """
    factor = 1.0 if class_type == 'A' else 1.3
    return ld * factor


def standard_hook_development(dia_mm, fc=28, fy=420, lightweight=False):
    """
    ACI 318-19 Section 25.4.3 — Standard hook development length
    ldh = (fy * psi_e * psi_r * psi_c * psi_o) / (2.1 * lambda * sqrt(fc)) * db
    Simplified: ldh = 0.7 * ld typically
    """
    ld = development_length_tension(dia_mm, fc, fy, top_bar=False, lightweight=lightweight)
    return max(0.7 * ld, 0.15 * dia_mm / 1000, 0.15)


def bending_schedule(bars, stirrups=None):
    """
    Generate a bar bending schedule (BBS) from bar definitions
    bars: list of {dia, count, length, shape_code, shape_desc}
    stirrups: list of {dia, count, a, b, hook_length}
    """
    schedule = []

    for bar in bars:
        total_length = bar['count'] * bar['length']
        weight = total_length * BAR_DATA.get(int(bar['dia']), BAR_DATA[12])['weight_kg_per_m']
        schedule.append({
            'dia_mm': bar['dia'],
            'us_size': BAR_DATA.get(int(bar['dia']), BAR_DATA[12])['us_size'],
            'count': bar['count'],
            'length_m': round(bar['length'], 3),
            'total_length_m': round(total_length, 3),
            'weight_kg': round(weight, 2),
            'shape_code': bar.get('shape_code', ''),
            'shape_desc': bar.get('shape_desc', 'Straight Bar'),
        })

    if stirrups:
        for st in stirrups:
            a = st.get('a', 0)
            b = st.get('b', 0)
            hook = st.get('hook_length', 0.10)
            perimeter = 2 * (a + b) + 2 * hook
            total = st['count'] * perimeter
            weight = total * BAR_DATA.get(int(st['dia']), BAR_DATA[12])['weight_kg_per_m']
            schedule.append({
                'dia_mm': st['dia'],
                'us_size': BAR_DATA.get(int(st['dia']), BAR_DATA[12])['us_size'],
                'count': st['count'],
                'length_m': round(perimeter, 3),
                'total_length_m': round(total, 3),
                'weight_kg': round(weight, 2),
                'shape_code': 'Stirrup',
                'shape_desc': f'{int(a*1000)}x{int(b*1000)} mm Stirrup',
            })

    return schedule
