from django.db import models
from apps.common.models.mixins import TimestampMixin


class WorkerSkill(TimestampMixin):
    """
    Many-to-many relationship between workers and skills.
    """
    worker_profile = models.ForeignKey(
        'WorkerProfile',
        on_delete=models.CASCADE,
        related_name='worker_skills'
    )
    skill = models.ForeignKey(
        'Skill',
        on_delete=models.CASCADE,
        related_name='worker_skills'
    )
    
    # Optional: proficiency level
    proficiency = models.CharField(
        max_length=20,
        choices=[
            ('BEGINNER', 'Beginner'),
            ('INTERMEDIATE', 'Intermediate'),
            ('ADVANCED', 'Advanced'),
            ('EXPERT', 'Expert'),
        ],
        default='INTERMEDIATE'
    )
    
    # Optional: years of experience with this skill
    years_experience = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'worker_skills'
        unique_together = [['worker_profile', 'skill']]
        verbose_name = 'Worker Skill'
        verbose_name_plural = 'Worker Skills'
        indexes = [
            models.Index(fields=['worker_profile', 'skill']),
            models.Index(fields=['skill']),
        ]
    
    def __str__(self):
        return f"{self.worker_profile.user.full_name} - {self.skill.name}"
