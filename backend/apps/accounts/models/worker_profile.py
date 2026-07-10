from django.db import models
from apps.common.models.mixins import BaseModel
from apps.common.constants import AvailabilityStatus


class WorkerProfile(BaseModel):
    user = models.OneToOneField(
        'User',
        on_delete=models.CASCADE,
        related_name='worker_profile'
    )
    
    bio = models.TextField(blank=True)
    years_of_experience = models.IntegerField(default=0)
    
    availability_status = models.CharField(
        max_length=20,
        choices=AvailabilityStatus.CHOICES,
        default=AvailabilityStatus.AVAILABLE
    )
    availability_updated_at = models.DateTimeField(auto_now=True)
    
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00
    )
    total_reviews = models.IntegerField(default=0)
    jobs_completed = models.IntegerField(default=0)
    
    # Skills relationship
    skills = models.ManyToManyField(
        'Skill',
        through='WorkerSkill',
        related_name='workers',
        blank=True
    )
    
    class Meta:
        db_table = 'worker_profiles'
        ordering = ['-average_rating']
        verbose_name = 'Worker Profile'
        verbose_name_plural = 'Worker Profiles'
    
    def __str__(self):
        return f"Worker: {self.user.full_name}"
    
    @property
    def is_available(self):
        return (
            self.availability_status == AvailabilityStatus.AVAILABLE
            and self.user.is_verified
            and self.user.is_active
            and not self.is_deleted
        )
    
    def get_skills_list(self):
        """Get list of skill names"""
        return [skill.name for skill in self.skills.all()]
    
    def has_skill(self, skill_name):
        """Check if worker has a specific skill"""
        return self.skills.filter(name__iexact=skill_name).exists()
    
    def add_skill(self, skill_name, proficiency='INTERMEDIATE'):
        """Add a skill to the worker"""
        from .skill import Skill
        from .worker_skill import WorkerSkill
        
        skill, created = Skill.objects.get_or_create(name=skill_name)
        WorkerSkill.objects.get_or_create(
            worker_profile=self,
            skill=skill,
            defaults={'proficiency': proficiency}
        )
        return skill
    
    def remove_skill(self, skill_name):
        """Remove a skill from the worker"""
        from .skill import Skill
        from .worker_skill import WorkerSkill
        
        try:
            skill = Skill.objects.get(name=skill_name)
            WorkerSkill.objects.filter(
                worker_profile=self,
                skill=skill
            ).delete()
            return True
        except Skill.DoesNotExist:
            return False
