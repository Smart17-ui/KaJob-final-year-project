# seed_data.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import Role, Skill
from apps.jobs.models import JobCategory


def seed_roles():
    """Seed default roles"""
    roles = [
        {'name': 'ADMIN', 'description': 'System Administrator with full access'},
        {'name': 'WORKER', 'description': 'Service provider who accepts jobs'},
        {'name': 'CLIENT', 'description': 'User who posts jobs'},
    ]
    
    print("\nSeeding roles...")
    for role_data in roles:
        role, created = Role.objects.get_or_create(
            name=role_data['name'],
            defaults={'description': role_data['description']}
        )
        status = "Created" if created else "Already exists"
        print(f"   {status}: {role.name}")


def seed_skills():
    """Seed default skills"""
    skills = [
        # Construction
        {'name': 'Plumbing', 'category': 'Construction'},
        {'name': 'Electrical', 'category': 'Construction'},
        {'name': 'Carpentry', 'category': 'Construction'},
        {'name': 'Painting', 'category': 'Construction'},
        {'name': 'Tiling', 'category': 'Construction'},
        {'name': 'Bricklaying', 'category': 'Construction'},
        {'name': 'Welding', 'category': 'Construction'},
        
        # Domestic
        {'name': 'Cleaning', 'category': 'Domestic'},
        {'name': 'Gardening', 'category': 'Domestic'},
        {'name': 'Cooking', 'category': 'Domestic'},
        
        # Transport
        {'name': 'Driving', 'category': 'Transport'},
        
        # Education
        {'name': 'Tutoring', 'category': 'Education'},
        
        # Creative
        {'name': 'Graphics Design', 'category': 'Creative'},
        {'name': 'Photography', 'category': 'Creative'},
    ]
    
    print("\nSeeding skills...")
    for skill_data in skills:
        skill, created = Skill.objects.get_or_create(
            name=skill_data['name'],
            defaults={'category': skill_data['category']}
        )
        status = "Created" if created else "Already exists"
        print(f"   {status}: {skill.name}")


def seed_job_categories():
    """Seed default job categories"""
    categories = [
        {'name': 'Plumbing', 'description': 'Pipe installation, repairs, and maintenance'},
        {'name': 'Electrical', 'description': 'Wiring, installations, and electrical repairs'},
        {'name': 'Carpentry', 'description': 'Woodwork, furniture, and structural carpentry'},
        {'name': 'Painting', 'description': 'Interior and exterior painting services'},
        {'name': 'Tiling', 'description': 'Tile installation and repairs'},
        {'name': 'Construction', 'description': 'General construction and labor'},
        {'name': 'Cleaning', 'description': 'Residential and commercial cleaning'},
        {'name': 'Gardening', 'description': 'Lawn maintenance, landscaping, and gardening'},
        {'name': 'Driving', 'description': 'Transportation and delivery services'},
        {'name': 'Catering', 'description': 'Food preparation and catering services'},
        {'name': 'Tutoring', 'description': 'Academic and skills tutoring'},
        {'name': 'IT Support', 'description': 'Computer and technology support'},
    ]
    
    print("\nSeeding job categories...")
    for cat_data in categories:
        cat, created = JobCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        status = "Created" if created else " Already exists"
        print(f"   {status}: {cat.name}")


def main():
    print("=" * 60)
    print("SEEDING KAJOB DATABASE")
    print("=" * 60)
    
    seed_roles()
    seed_skills()
    seed_job_categories()
    
    print("\n" + "=" * 60)
    print("Seeding complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
