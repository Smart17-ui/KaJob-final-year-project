from django.db import models

class WorkerSkill(models.Model):
    """
    Many-to-many relationship between workers and skills.
    """
    worker_profile = models.ForeignKey(
        'WorkerProfile',
        on_delete=models.CASCADE
    )
    skill = models.ForeignKey(
        'Skill',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'worker_skills'
        unique_together = [['worker_profile', 'skill']]

    def __str__(self):
        return f"{self.worker_profile.user.full_name} - {self.skill.name}"
