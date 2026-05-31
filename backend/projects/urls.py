from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet)
router.register(r'sites', views.SiteViewSet)
router.register(r'floors', views.FloorViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
