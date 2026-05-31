"""P4 Integration Test: auto-generate → CPM → verify results"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django; django.setup()

from projects.models import Project
from scheduling.models import Activity, Dependency
from scheduling.cpm import CPMEngine
from projects.models import Site, Floor
from quantities.models import Element, MaterialQuantity

PRODUCTIVITY = {
    'foundation': {'rate': 2.0, 'unit': 'm3/day', 'type': 'foundation'},
    'column': {'rate': 1.5, 'unit': 'm3/day', 'type': 'structure'},
    'blockwork': {'rate': 15.0, 'unit': 'm2/day', 'type': 'masonry'},
    'tiling': {'rate': 12.0, 'unit': 'm2/day', 'type': 'finishing'},
    'painting': {'rate': 25.0, 'unit': 'm2/day', 'type': 'finishing'},
}
PHASE_ORDER = {'foundation': 0, 'structure': 1, 'masonry': 2, 'finishing': 3}


def run_integration_test():
    # Clean slate
    Project.objects.filter(name='P4 Integration Test').delete()

    # 1. Create project with sites, floors, elements, quantities
    p = Project.objects.create(name='P4 Integration Test', project_type='commercial')
    s = Site.objects.create(project=p, name='Main Site', site_area=500)
    f = Floor.objects.create(site=s, name='Ground Floor', floor_number=0, floor_area=200)

    elements_data = [
        ('foundation', 'F1', 4, 'concrete', 12.0, 'm3'),
        ('column', 'C1', 6, 'concrete', 4.5, 'm3'),
        ('blockwork', 'BW1', 1, 'blocks', 60.0, 'm2'),
        ('tiling', 'Tile1', 1, 'tiles', 80.0, 'm2'),
        ('painting', 'Paint1', 1, 'paint', 150.0, 'm2'),
    ]

    for etype, ename, count, mat_type, mat_val, mat_unit in elements_data:
        el = Element.objects.create(floor=f, element_type=etype, name=ename, count=count, dimensions='{}')
        MaterialQuantity.objects.create(element=el, material_type=mat_type, value=mat_val, unit=mat_unit)

    # 2. Auto-generate activities (same logic as views.auto_generate)
    elements = Element.objects.filter(floor__site__project=p)
    created = []
    for element in elements:
        prod = PRODUCTIVITY.get(element.element_type)
        if not prod:
            continue
        qty = 0
        mq_concrete = MaterialQuantity.objects.filter(element=element, material_type='concrete').first()
        if mq_concrete and mq_concrete.value > 0:
            qty = mq_concrete.value
        if qty == 0:
            for mq in MaterialQuantity.objects.filter(element=element):
                if mq.value > 0:
                    qty = mq.value
                    break
        dur = max(1, int(qty / prod['rate'])) if qty > 0 else 1
        act = Activity.objects.create(
            project=p, name=element.name, activity_type=prod['type'],
            duration_days=dur, quantity=qty, unit=prod['unit'].split('/')[0],
            productivity_rate=prod['rate'],
            order=PHASE_ORDER.get(prod['type'], 99) * 100 + len(created),
        )
        created.append(act)

    for i in range(1, len(created)):
        Dependency.objects.create(predecessor=created[i - 1], successor=created[i], dependency_type='FS', lag_days=0)

    # 3. Run CPM
    engine = CPMEngine(p.id)
    result = engine.run()

    # 4. Verify
    assert result['total_activities'] == 5, f"Expected 5, got {result['total_activities']}"
    assert result['project_duration_days'] > 0, f"Duration should be > 0, got {result['project_duration_days']}"
    assert result['critical_path_count'] > 0

    acts = Activity.objects.filter(project=p).order_by('order')
    act_map = {a.name: a for a in acts}

    # F1 (foundation): concrete=12m³, rate=2.0 → 6 days
    assert act_map['F1'].duration_days == 6, f"F1 duration should be 6, got {act_map['F1'].duration_days}"
    assert act_map['F1'].early_start == 0
    assert act_map['F1'].early_finish == 6

    # C1 (column): concrete=4.5m³, rate=1.5 → 3 days, starts after F1
    assert act_map['C1'].duration_days == 3
    assert act_map['C1'].early_start == 6
    assert act_map['C1'].early_finish == 9

    # All activities should be on critical path (linear chain)
    for a in acts:
        assert a.is_critical, f"{a.name} should be critical (linear chain)"
        assert a.total_float == 0, f"{a.name} float should be 0, got {a.total_float}"
        assert a.early_start >= 0
        assert a.early_finish >= 0
        assert a.late_start >= 0
        assert a.late_finish >= 0
        assert a.early_finish == a.early_start + a.duration_days

    print('=' * 50)
    print('P4 INTEGRATION TEST PASSED')
    print('=' * 50)
    print(f'Duration: {result["project_duration_days"]} days')
    print(f'Activities: {result["total_activities"]}')
    print(f'Critical: {" -> ".join(result["critical_path"])}')
    print()
    for a in acts:
        flag = ' ** CRITICAL **' if a.is_critical else ''
        print(f'  {a.name:10s} ES={a.early_start:2d} EF={a.early_finish:2d} Float={a.total_float:2d}{flag}')

    # 5. Cleanup
    p.delete()
    return True


if __name__ == '__main__':
    run_integration_test()
