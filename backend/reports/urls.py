from django.urls import path
from . import views

urlpatterns = [
    path('reports/qty-takeoff/<int:project_id>/', views.quantity_takeoff_pdf, name='qty-takeoff-pdf'),
    path('reports/bending/<int:project_id>/', views.bending_schedule_pdf, name='bending-pdf'),
    path('reports/schedule/<int:project_id>/', views.schedule_pdf, name='schedule-pdf'),
    path('reports/boq/<int:project_id>/', views.boq_excel, name='boq-excel'),
    path('reports/boq-prices-excel/<int:project_id>/', views.boq_prices_excel, name='boq-prices-excel'),
    path('reports/boq-prices-pdf/<int:project_id>/', views.boq_prices_pdf, name='boq-prices-pdf'),
]
