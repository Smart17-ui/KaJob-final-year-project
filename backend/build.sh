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

print('Roles ensured.')
"

echo "==> Seeding baseline job categories..."
python manage.py shell -c "
from apps.jobs.models import JobCategory

CATEGORIES = [
    ('Plumbing', 'Pipe repair, leak fixing, and installation'),
    ('Electrical', 'Wiring, sockets, and lighting installation'),
    ('Carpentry', 'Furniture repair, doors, and woodwork'),
    ('Painting', 'Interior and exterior painting'),
    ('Tiling', 'Floor and wall tiling'),
    ('Cleaning', 'House and office cleaning'),
    ('Gardening', 'Garden maintenance and landscaping'),
    ('Construction', 'General construction and masonry work'),
    ('Driving', 'Personal or commercial driving'),
    ('IT Support', 'Computer and network support'),
    ('Catering', 'Food preparation and catering'),
    ('Tutoring', 'Academic and skills tutoring'),
    ('Other', 'Other - describe in the job description'),
]

created = 0
for name, description in CATEGORIES:
    _, is_new = JobCategory.objects.get_or_create(
        name=name, defaults={'description': description}
    )
    if is_new:
        created += 1

print(f'Categories created this run: {created}')
print(f'Total categories in DB: {JobCategory.objects.count()}')
"

echo "==> Seeding baseline skills..."
python manage.py shell -c "
from apps.accounts.models import Skill

SKILLS = [
    # Construction
    ('Bricklaying', 'Construction', ''),
    ('Carpentry', 'Construction', ''),
    ('Electrical', 'Construction', ''),
    ('Painting', 'Construction', ''),
    ('Plumbing', 'Construction', ''),
    ('Tiling', 'Construction', ''),
    ('Welding', 'Construction', ''),
    # Domestic
    ('Cleaning', 'Domestic', ''),
    ('Cooking', 'Domestic', ''),
    ('Gardening', 'Domestic', ''),
    # Transport
    ('Driving', 'Transport', ''),
    # Creative
    ('Graphics Design', 'Creative', ''),
    ('Photography', 'Creative', ''),
    # Education
    ('Tutoring', 'Education', ''),
]

created = 0
for name, category, description in SKILLS:
    _, is_new = Skill.objects.get_or_create(
        name=name,
        defaults={'category': category, 'description': description}
    )
    if is_new:
        created += 1

print(f'Skills created this run: {created}')
print(f'Total skills in DB: {Skill.objects.count()}')
"

echo "==> Build complete."
