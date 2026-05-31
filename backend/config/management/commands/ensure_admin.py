from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Ensure a default admin user exists'

    def handle(self, *args, **options):
        email = 'admin@test.com'
        password = 'admin123'
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(username='admin', email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Created admin user: {email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Admin user already exists: {email}'))
