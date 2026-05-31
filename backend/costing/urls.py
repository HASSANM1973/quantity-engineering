from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'material-prices', views.MaterialPriceViewSet)
router.register(r'labor-rates', views.LaborRateViewSet)
router.register(r'estimates', views.CostEstimateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
