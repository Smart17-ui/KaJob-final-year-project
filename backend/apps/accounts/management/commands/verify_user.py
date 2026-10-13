# backend/apps/accounts/management/commands/verify_user.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User

class Command(BaseCommand):
    help = 'Verifies a user by email address'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the user to verify')

    def handle(self, *args, **options):
        email = options['email']
        try:
            u = User.objects.get(email=email)
            
            u.phone_verified = True
            u.phone_verified_at = timezone.now()
            u.email_verified = True
            u.email_verified_at = timezone.now()
            u.is_verified = True
            u.save(update_fields=['phone_verified', 'phone_verified_at', 'email_verified', 'email_verified_at', 'is_verified'])
            
            self.stdout.write(self.style.SUCCESS(f'Successfully verified user: {email}'))
            self.stdout.write(f'  is_verified: {u.is_verified}')
            self.stdout.write(f'  phone_verified: {u.phone_verified}')
            self.stdout.write(f'  email_verified: {u.email_verified}')
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User not found: {email}'))
