# apps/reports/services/disciplinary_service.py

from apps.common.constants import AdminDecision, ReportStatus
from apps.common.policies import is_valid_decision, allowed_decisions_for
from apps.accounts.services.account_status_service import AccountStatusService


class DisciplinaryService:

    @staticmethod
    def apply_decision(report, investigation, admin):
        decision = investigation.decision
        notes = investigation.decision_notes or ""
        target = report.reported_user

        if not is_valid_decision(report.category, decision):
            allowed = ", ".join(allowed_decisions_for(report.category))
            raise ValueError(
                f"Decision '{decision}' is not allowed for category "
                f"'{report.category}'. Allowed: {allowed}"
            )

        if decision == AdminDecision.DISMISSED:
            DisciplinaryService._dismiss(report, target, admin, notes)

        elif decision == AdminDecision.WARNED:
            AccountStatusService.warn_user(target, notes, admin)

        elif decision == AdminDecision.SUSPENDED:
            AccountStatusService.suspend_user(target, notes, admin)

        elif decision == AdminDecision.BANNED:
            AccountStatusService.ban_user(target, notes, admin)

        elif decision == AdminDecision.ESCALATED:
            # Escalation = permanent ban pending police investigation
            AccountStatusService.ban_user(
                target,
                reason=f"Escalated to police: {notes}",
                admin=admin,
            )
            report.status = ReportStatus.ESCALATED_TO_POLICE
            report.save(update_fields=['status'])
            DisciplinaryService._notify_reporter_escalated(report, admin)

        return report

    # ============================================
    # DISMISSED
    # ============================================

    @staticmethod
    def _dismiss(report, target, admin, notes):
        try:
            from apps.notifications.services import NotificationService
            NotificationService().create_notification(
                recipient_id=target.id,
                notification_type="REPORT_RESOLVED",
                title="Report Resolved",
                message="A report filed against you was reviewed and dismissed.",
                redirect_url="/account/status",
                data={"reason": notes},
                send_email=False,
                send_push=True,
            )
        except Exception as e:
            print(f"[DisciplinaryService] notify dismiss failed: {e}")

    # ============================================
    # ESCALATED — notify the reporter
    # ============================================

    @staticmethod
    def _notify_reporter_escalated(report, admin):
        try:
            from apps.notifications.services import NotificationService
            NotificationService().create_notification(
                recipient_id=report.reporter.id,
                notification_type="REPORT_RESOLVED",
                title="Report Referred to Law Enforcement",
                message=(
                    f"Your report {report.reference_number} "
                    f"({report.get_category_display()}) has been reviewed "
                    f"and referred to law enforcement. We'll keep you "
                    f"updated as the case progresses."
                ),
                redirect_url=f"/reports/my/{report.id}",
                data={"report_id": report.id},
                send_email=True,
                send_push=True,
            )
        except Exception as e:
            print(f"[DisciplinaryService] reporter notify failed: {e}")
