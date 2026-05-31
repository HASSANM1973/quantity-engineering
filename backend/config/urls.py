from django.urls import path, include

urlpatterns = [
    path('api/', include('projects.urls')),
    path('api/', include('quantities.urls')),
    path('api/', include('scheduling.urls')),
    path('api/', include('reports.urls')),
    path('api/', include('costing.urls')),
    path('api/', include('config.auth_urls')),
]
