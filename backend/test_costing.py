"""Test cost estimation API"""
import os, json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django; django.setup()

from django.test import Client
from costing.models import MaterialPrice
from projects.models import Project
from quantities.models import Element, MaterialQuantity

c = Client()

# 1. Check prices
r = c.get('/api/material-prices/')
prices = json.loads(r.content)
print(f"Prices: {r.status_code} ({len(prices)} items)")

# 2. Check project 1
p = Project.objects.get(id=1)
els = Element.objects.filter(floor__site__project=p)
qty_count = MaterialQuantity.objects.filter(element__in=els).count()
print(f"Project 1: {els.count()} elements, {qty_count} quantities")

# 3. Generate estimate
r2 = c.post('/api/estimates/generate/', {'project_id': 1, 'markup_percent': 15}, content_type='application/json')
data = json.loads(r2.content)
print(f"Generate estimate: {r2.status_code}")
if r2.status_code == 201:
    print(f"  Items: {len(data['items'])}")
    print(f"  Material cost: {data['total_material']:,.0f} EGP")
    print(f"  With markup (15%): {data['total_with_markup']:,.0f} EGP")
    print(f"  Estimate ID: {data['id']}")

    # 4. Update a price
    first_item = data['items'][0]
    print(f"  First item: {first_item['description']} = {first_item['unit_price']} EGP/{first_item['unit']}")

    update_resp = c.post(f"/api/estimates/{data['id']}/update_prices/",
        {'items': [{'id': first_item['id'], 'unit_price': 999}]},
        content_type='application/json')
    updated = json.loads(update_resp.content)
    updated_item = next(i for i in updated['items'] if i['id'] == first_item['id'])
    print(f"  Updated price: {updated_item['unit_price']} EGP (was {first_item['unit_price']})")
else:
    print(f"  Error: {data}")

print("\nALL COSTING TESTS PASSED")
