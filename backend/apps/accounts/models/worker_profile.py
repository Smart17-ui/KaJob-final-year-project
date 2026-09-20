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

    # ============================================
    # RATING AGGREGATION
    # ============================================

    def update_rating(self):
        """
        Recompute average_rating and total_reviews from all reviews
        received by this worker.

        Called automatically after a Review is created, updated, or
        deleted. Uses the User.reviews_received related name.

        Excludes reviews where job_completed=False — those are
        "job wasn't done" flags rather than quality ratings. Adjust
        this policy if you want them included.
        """
        from django.db.models import Avg, Count

        # Get the reviews this worker has received
        reviews_qs = self.user.reviews_received.all()

        # Aggregate: count everything, average only actual completions
        stats = reviews_qs.aggregate(
            total=Count('id'),
            avg=Avg('rating'),
        )

        # If you'd rather exclude non-completed jobs from the average:
        # completed_stats = reviews_qs.filter(job_completed=True).aggregate(
        #     avg=Avg('rating')
        # )
        # avg_rating = completed_stats['avg'] or 0

        avg_rating = stats['avg'] or 0
        total = stats['total'] or 0

        self.average_rating = round(avg_rating, 2)
        self.total_reviews = total
        self.save(update_fields=[
            'average_rating',
            'total_reviews',
            'updated_at',
        ])

    def increment_jobs_completed(self):
        """Increment the jobs_completed counter."""
        self.jobs_completed += 1
        self.save(update_fields=['jobs_completed', 'updated_at'])

    def update_availability(self, status: str):
        """Set the availability status."""
        self.availability_status = status
        self.save(update_fields=[
            'availability_status',
            'availability_updated_at',
        ])
