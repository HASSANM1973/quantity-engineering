"""Test REST API endpoints for P4 scheduling"""
import os, json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django; django.setup()

from django.test import Client
from projects.models import Project, Site, Floor
from quantities.models import Element, MaterialQuantity

# Setup
Project.objects.filter(name='REST API Test').delete()
p = Project.objects.create(name='REST API Test', project_type='commercial')
s = Site.objects.create(project=p, name='Site A', site_area=300)
f = Floor.objects.create(site=s, name='Floor 1', floor_number=1, floor_area=150)

e1 = Element.objects.create(floor=f, element_type='foundation', name='F1', count=2, dimensions='{}')
MaterialQuantity.objects.create(element=e1, material_type='concrete', value=10.0, unit='m3')
e2 = Element.objects.create(floor=f, element_type='column', name='C1', count=4, dimensions='{}')
MaterialQuantity.objects.create(element=e2, material_type='concrete', value=3.0, unit='m3')

c = Client()

# Test auto_generate
resp = c.post('/api/cpm/auto_generate/', {'project_id': p.id}, content_type='application/json')
assert resp.status_code == 200, f"auto_generate failed: {resp.status_code}"
data = json.loads(resp.content)
assert data['generated_count'] == 2
assert data['cpm']['project_duration_days'] > 0
assert len(data['cpm']['critical_path']) > 0
print(f"auto_generate: {data['generated_count']} activities, "
      f"{data['cpm']['project_duration_days']} days, "
      f"critical: {data['cpm']['critical_path']}")

# Test compute
resp2 = c.post('/api/cpm/compute/', {'project_id': p.id}, content_type='application/json')
assert resp2.status_code == 200, f"compute failed: {resp2.status_code}"
data2 = json.loads(resp2.content)
assert data2['cpm']['project_duration_days'] > 0
print(f"compute: {data2['cpm']['project_duration_days']} days, "
      f"{data2['cpm']['total_activities']} activities")

# Test by_project
resp3 = c.get(f'/api/activities/by_project/', {'project_id': p.id})
assert resp3.status_code == 200
data3 = json.loads(resp3.content)
assert len(data3) == 2
print(f"by_project: {len(data3)} activities")

# Validate activity fields have CPM data
for act in data3:
    assert 'early_start' in act
    assert 'early_finish' in act
    assert 'late_start' in act
    assert 'late_finish' in act
    assert 'total_float' in act
    assert 'is_critical' in act

p.delete()
print("ALL REST API TESTS PASSED")
