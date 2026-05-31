from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'activities', views.ActivityViewSet)
router.register(r'dependencies', views.DependencyViewSet)
router.register(r'resources', views.ResourceAssignmentViewSet)
router.register(r'cpm', views.CPMViewSet, basename='cpm')

urlpatterns = [
    path('', include(router.urls)),
]
