# apps/admin_panel/models/platform_setting.py

from django.db import models
from apps.common.models.mixins import BaseModel


class PlatformSetting(BaseModel):
    """
    Platform-wide settings configurable by admin.
    """
    
    SETTING_TYPES = [
        ('STRING', 'String'),
        ('INTEGER', 'Integer'),
        ('BOOLEAN', 'Boolean'),
        ('JSON', 'JSON'),
        ('DECIMAL', 'Decimal'),
    ]
    
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPES, default='STRING')
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default='GENERAL')
    is_public = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'platform_settings'
        ordering = ['category', 'key']
        verbose_name = 'Platform Setting'
        verbose_name_plural = 'Platform Settings'
    
    def __str__(self):
        return f"{self.key} = {self.value}"
    
    def get_typed_value(self):
        """Return the value cast to the correct type."""
        if self.setting_type == 'INTEGER':
            return int(self.value)
        elif self.setting_type == 'BOOLEAN':
            return self.value.lower() in ('true', '1', 'yes')
        elif self.setting_type == 'JSON':
            import json
            return json.loads(self.value)
        elif self.setting_type == 'DECIMAL':
            return float(self.value)
        return self.value
