#!/usr/bin/env bash
set -o errexit

echo "==> Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Collecting static files..."
python manage.py collectstatic --no-input

echo "==> Running migrations..."
python manage.py migrate --no-input

echo "==> Ensuring superuser exists..."
python manage.py shell -c "
from apps.accounts.models import User, Role
from apps.common.constants import UserAccountStatus, RoleType

email = 'adminSmart@gmail.com'
if not User.objects.filter(email=email).exists():
    user = User.objects.create_user(
        email=email,
        password='17110011qq',
        first_name='Admin',
        last_name='Server',
        phone_number='+260970000000',
        account_status=UserAccountStatus.ACTIVE,
        is_verified=True,
    )
    admin_role, _ = Role.objects.get_or_create(name=RoleType.ADMIN)
    user.add_role(admin_role)
    print(f'Superuser created: {user.email}')
else:
    print(f'Superuser {email} already exists')
"

echo "==> Build complete."
