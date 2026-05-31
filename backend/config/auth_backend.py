from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

class EmailAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        email = kwargs.get('email') or username
        if email is None:
            return None
        users = UserModel.objects.filter(email=email)
        if not users.exists():
            return None
        for user in users:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        return None
