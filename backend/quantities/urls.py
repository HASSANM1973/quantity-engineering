from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'elements', views.ElementViewSet)
router.register(r'quantities', views.MaterialQuantityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
