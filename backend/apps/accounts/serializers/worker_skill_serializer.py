# apps/accounts/serializers/worker_skill_serializer.py

from rest_framework import serializers

from apps.accounts.models import Skill, WorkerSkill


# ============================================================
# SKILL — master list (for the "pick a skill" dropdown)
# ============================================================

class SkillSerializer(serializers.ModelSerializer):
    """Read-only serializer for the master Skill list."""
    class Meta:
        model = Skill
        fields = [
            'id',
            'name',
            'category',
            'description',
            'icon',
        ]


# ============================================================
# WORKER SKILL — read view
# ============================================================

class WorkerSkillSerializer(serializers.ModelSerializer):
    """Read serializer for a worker's skill entry."""
    skill_id = serializers.IntegerField(source='skill.id', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)
    skill_icon = serializers.CharField(source='skill.icon', read_only=True)
    proficiency_display = serializers.CharField(
        source='get_proficiency_display', read_only=True
    )

    class Meta:
        model = WorkerSkill
        fields = [
            'id',
            'skill_id',
            'skill_name',
            'skill_category',
            'skill_icon',
            'proficiency',
            'proficiency_display',
            'years_experience',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'skill_id',
            'skill_name',
            'skill_category',
            'skill_icon',
            'proficiency_display',
            'created_at',
            'updated_at',
        ]


# ============================================================
# WORKER SKILL — create (add a skill)
# ============================================================

class WorkerSkillCreateSerializer(serializers.Serializer):
    """Write serializer for adding a skill to a worker's profile."""
    skill_id = serializers.IntegerField(required=True)
    proficiency = serializers.ChoiceField(
        choices=WorkerSkill._meta.get_field('proficiency').choices,
        required=False,
        default='INTERMEDIATE',
    )
    years_experience = serializers.IntegerField(
        required=False,
        default=0,
        min_value=0,
        max_value=60,
    )

    def validate_skill_id(self, value):
        if not Skill.objects.filter(id=value).exists():
            raise serializers.ValidationError("Skill not found.")
        return value


# ============================================================
# WORKER SKILL — update (change proficiency / years only)
# ============================================================

class WorkerSkillUpdateSerializer(serializers.Serializer):
    """Write serializer for updating proficiency / years_experience.

    The skill itself cannot be changed — remove and re-add instead.
    """
    proficiency = serializers.ChoiceField(
        choices=WorkerSkill._meta.get_field('proficiency').choices,
        required=False,
    )
    years_experience = serializers.IntegerField(
        required=False,
        min_value=0,
        max_value=60,
    )
