from django.db import models


# Define default preferences as a regular function (not lambda)
def default_notification_preferences():
    """Default notification preferences"""
    return {
        'job_posted': True,
        'application_received': True,
        'worker_assigned': True,
        'job_completed': True,
        'report_resolved': True,
        'verification_approved': True,
        'verification_rejected': True,
        'account_suspended': True,
        'warning_issued': True,
    }


class NotificationPreference(models.Model):
    """
    User notification preferences.
    """
    user = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    
    # Preferences stored as JSON for flexibility
    preferences = models.JSONField(
        default=default_notification_preferences  # ✅ Use the function instead of lambda
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
    
    def __str__(self):
        return f"Preferences: {self.user.full_name}"
    
    def get_preference(self, key, default=True):
        """Get a specific preference"""
        return self.preferences.get(key, default)
    
    def set_preference(self, key, value):
        """Set a specific preference"""
        self.preferences[key] = value
        self.save(update_fields=['preferences'])
