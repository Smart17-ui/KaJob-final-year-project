#!/usr/bin/env bash
set -o errexit

echo "==> Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Collecting static files..."
python manage.py collectstatic --no-input

echo "==> Running migrations..."
python manage.py migrate --no-input

echo "==> Ensuring required roles exist..."
python manage.py shell -c "
from apps.accounts.models import Role
from apps.common.constants import RoleType

for role_name in [RoleType.ADMIN, RoleType.WORKER, RoleType.CLIENT]:
    role, created = Role.objects.get_or_create(name=role_name)
    print(f\"{'Created' if created else 'Exists'}: {role_name}\")

print('Roles ensured successfully.')
"

echo "==> Build complete."
