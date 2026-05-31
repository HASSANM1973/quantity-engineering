import hashlib
import time
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .auth_tokens import AUTH_TOKENS

def generate_token(user_id, email):
    raw = f'{user_id}:{email}:{time.time()}:quantix-secret'
    return hashlib.sha256(raw.encode()).hexdigest()


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(request, email=email, password=password)
    if user is not None:
        token = generate_token(user.id, user.email)
        AUTH_TOKENS[token] = user.id
        return Response({
            'token': token,
            'user': {'id': user.id, 'email': user.email, 'name': user.get_full_name() or user.username}
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def logout_view(request):
    token = request.data.get('token') or request.headers.get('Authorization', '').replace('Bearer ', '')
    AUTH_TOKENS.pop(token, None)
    return Response({'message': 'Logged out'})


@api_view(['GET'])
def me_view(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = AUTH_TOKENS.get(token)
    if not user_id:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    from django.contrib.auth.models import User
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({'id': user.id, 'email': user.email, 'name': user.get_full_name() or user.username})


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name', '')
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    from django.contrib.auth.models import User
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
    username = email.split('@')[0]
    base = username
    i = 1
    while User.objects.filter(username=username).exists():
        username = f'{base}{i}'
        i += 1
    user = User.objects.create_user(username=username, email=email, password=password)
    if name:
        parts = name.strip().split(' ', 1)
        user.first_name = parts[0]
        if len(parts) > 1:
            user.last_name = parts[1]
        user.save()
    token = generate_token(user.id, user.email)
    AUTH_TOKENS[token] = user.id
    return Response({
        'token': token,
        'user': {'id': user.id, 'email': user.email, 'name': user.get_full_name() or user.username}
    }, status=status.HTTP_201_CREATED)
