# apps/analytics/management/commands/calculate_stats.py

from django.core.management.base import BaseCommand
from apps.analytics.services import StatsService


class Command(BaseCommand):
    """
    Command to calculate platform statistics.
    
    Usage:
    python manage.py calculate_stats
    """
    
    help = 'Calculate platform statistics for analytics'
    
    def handle(self, *args, **options):
        self.stdout.write('Calculating platform statistics...')
        
        try:
            StatsService.calculate_all_stats()
            self.stdout.write(
                self.style.SUCCESS('✅ Statistics calculated successfully!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error calculating stats: {str(e)}')
            )
