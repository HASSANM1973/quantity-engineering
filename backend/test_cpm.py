import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django; django.setup()

from projects.models import Project
from scheduling.models import Activity, Dependency
from scheduling.cpm import CPMEngine


def test_cpm():
    # Clean up any previous run
    Project.objects.filter(name='CPM Test').delete()

    p = Project.objects.create(name='CPM Test', project_type='commercial')

    # Build a realistic construction schedule
    act = {}

    act['site_prep'] = Activity.objects.create(project=p, name='Site Preparation', activity_type='earthwork', duration_days=5, order=1)
    act['excavation'] = Activity.objects.create(project=p, name='Excavation', activity_type='earthwork', duration_days=7, order=2)
    act['foundation'] = Activity.objects.create(project=p, name='Foundation Work', activity_type='foundation', duration_days=10, order=3)
    act['columns_gf'] = Activity.objects.create(project=p, name='Ground Floor Columns', activity_type='structure', duration_days=6, order=4)
    act['slab_gf'] = Activity.objects.create(project=p, name='Ground Floor Slab', activity_type='structure', duration_days=8, order=5)
    act['blockwork'] = Activity.objects.create(project=p, name='Blockwork', activity_type='masonry', duration_days=12, order=6)
    act['plastering'] = Activity.objects.create(project=p, name='Plastering', activity_type='finishing', duration_days=10, order=7)
    act['tiling'] = Activity.objects.create(project=p, name='Tiling', activity_type='finishing', duration_days=8, order=8)
    act['painting'] = Activity.objects.create(project=p, name='Painting', activity_type='finishing', duration_days=6, order=9)
    act['plumbing'] = Activity.objects.create(project=p, name='Plumbing Rough-in', activity_type='mep', duration_days=5, order=10)
    act['electrical'] = Activity.objects.create(project=p, name='Electrical Rough-in', activity_type='mep', duration_days=5, order=11)

    # Dependencies
    deps = [
        ('site_prep', 'excavation', 'FS', 0),
        ('excavation', 'foundation', 'FS', 0),
        ('foundation', 'columns_gf', 'FS', 3),
        ('columns_gf', 'slab_gf', 'FS', 0),
        ('columns_gf', 'plumbing', 'FS', 0),
        ('columns_gf', 'electrical', 'FS', 0),
        ('slab_gf', 'blockwork', 'FS', 2),
        ('blockwork', 'plastering', 'FS', 0),
        ('plastering', 'tiling', 'FS', 2),
        ('tiling', 'painting', 'FS', 0),
        ('plumbing', 'painting', 'FF', 0),
        ('electrical', 'painting', 'FF', 0),
    ]

    for pred, succ, dep_type, lag in deps:
        Dependency.objects.create(
            predecessor=act[pred],
            successor=act[succ],
            dependency_type=dep_type,
            lag_days=lag,
        )

    engine = CPMEngine(p.id)
    result = engine.run()

    # Assertions
    assert result['project_duration_days'] == 79, f'Expected 79, got {result["project_duration_days"]}'
    assert result['total_activities'] == 11
    assert result['critical_path_count'] == 9

    activities = Activity.objects.filter(project=p).order_by('order')
    vals = {a.name: a for a in activities}

    # Critical path check — all should have float=0
    for name in ['Site Preparation', 'Excavation', 'Foundation Work', 'Ground Floor Columns',
                 'Ground Floor Slab', 'Blockwork', 'Plastering', 'Tiling', 'Painting']:
        assert vals[name].total_float == 0, f'{name} float={vals[name].total_float}'

    # Plumbing and Electrical are non-critical
    assert vals['Plumbing Rough-in'].total_float > 0
    assert vals['Electrical Rough-in'].total_float > 0

    # ES/EF checks
    assert vals['Site Preparation'].early_start == 0
    assert vals['Site Preparation'].early_finish == 5
    assert vals['Painting'].early_start == 73
    assert vals['Painting'].early_finish == 79
    assert vals['Plumbing Rough-in'].early_start == 31
    assert vals['Plumbing Rough-in'].early_finish == 36

    # No negative floats
    for a in activities:
        assert a.total_float >= 0, f'{a.name} has negative float {a.total_float}'

    # All early/late values should be >= 0
    for a in activities:
        assert a.early_start >= 0
        assert a.early_finish >= 0
        assert a.late_start >= 0
        assert a.late_finish >= 0

    # Forward consistency: EF = ES + duration for critical path items
    for a in activities:
        assert a.early_finish >= a.early_start + a.duration_days

    # Backward consistency
    for a in activities:
        assert a.late_finish >= a.late_start + a.duration_days

    print('ALL CPM ASSERTIONS PASSED')
    print(f'Duration: {result["project_duration_days"]} days')
    print(f'Critical: {" -> ".join(result["critical_path"])}')
    p.delete()


if __name__ == '__main__':
    test_cpm()
