# apps/common/policies.py

"""
Internal disciplinary policy.
Maps report categories to allowed admin decisions.
"""

from apps.common.constants import ReportCategory, AdminDecision


DECISION_POLICY = {
    ReportCategory.FRAUD: [AdminDecision.DISMISSED, AdminDecision.BANNED],
    ReportCategory.VIOLENCE: [
        AdminDecision.DISMISSED,
        AdminDecision.BANNED,
        AdminDecision.ESCALATED,
    ],
    ReportCategory.HARASSMENT: [
        AdminDecision.DISMISSED,
        AdminDecision.WARNED,
        AdminDecision.SUSPENDED,
        AdminDecision.BANNED,
    ],
    ReportCategory.THEFT: [
        AdminDecision.DISMISSED,
        AdminDecision.SUSPENDED,
        AdminDecision.BANNED,
        AdminDecision.ESCALATED,
    ],
    ReportCategory.NO_SHOW: [
        AdminDecision.DISMISSED,
        AdminDecision.WARNED,
        AdminDecision.SUSPENDED,
    ],
    ReportCategory.POOR_CONDUCT: [
        AdminDecision.DISMISSED,
        AdminDecision.WARNED,
        AdminDecision.SUSPENDED,
        AdminDecision.BANNED,
    ],
    ReportCategory.PROPERTY_DAMAGE: [
        AdminDecision.DISMISSED,
        AdminDecision.WARNED,
        AdminDecision.SUSPENDED,
        AdminDecision.BANNED,
    ],
    ReportCategory.OTHER: [
        AdminDecision.DISMISSED,
        AdminDecision.WARNED,
        AdminDecision.SUSPENDED,
        AdminDecision.BANNED,
        AdminDecision.ESCALATED,
    ],
}


DECISION_GUIDANCE = {
    AdminDecision.DISMISSED: "No violation confirmed. Report closed with no action.",
    AdminDecision.WARNED: "Minor first offense. User is notified; account stays active.",
    AdminDecision.SUSPENDED: "Moderate violation. Account locked for 14 days.",
    AdminDecision.BANNED: "Severe or repeated violation. Account permanently disabled.",
    AdminDecision.ESCALATED: "Criminal-level incident. Account suspended + police referral.",
}


DEFAULT_SUSPENSION_DAYS = 14


def allowed_decisions_for(category):
    return DECISION_POLICY.get(category, DECISION_POLICY[ReportCategory.OTHER])


def is_valid_decision(category, decision):
    return decision in allowed_decisions_for(category)


def policy_summary(category):
    return {
        "category": category,
        "allowed_decisions": allowed_decisions_for(category),
        "guidance": DECISION_GUIDANCE,
        "default_suspension_days": DEFAULT_SUSPENSION_DAYS,
    }
