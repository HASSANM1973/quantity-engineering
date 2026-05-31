from django.urls import path
from . import auth_views

urlpatterns = [
    path('auth/login/', auth_views.login_view, name='auth-login'),
    path('auth/logout/', auth_views.logout_view, name='auth-logout'),
    path('auth/me/', auth_views.me_view, name='auth-me'),
    path('auth/register/', auth_views.register_view, name='auth-register'),
]
