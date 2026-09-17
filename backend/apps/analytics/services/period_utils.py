# apps/analytics/services/period_utils.py

"""
Period parsing helper for analytics endpoints.

Converts a ?period=... query string into a (start_date, end_date) tuple.
Both dates are inclusive. For "all_time", returns (None, None).
"""

from datetime import date, timedelta


def _last_month_range(today):
    first_of_this_month = today.replace(day=1)
    last_day_of_prev_month = first_of_this_month - timedelta(days=1)
    first_of_prev_month = last_day_of_prev_month.replace(day=1)
    return first_of_prev_month, last_day_of_prev_month


def _last_week_range(today):
    # Previous full Monday–Sunday block
    this_monday = today - timedelta(days=today.weekday())
    last_monday = this_monday - timedelta(days=7)
    last_sunday = last_monday + timedelta(days=6)
    return last_monday, last_sunday


def parse_period(period_str, today=None):
    """
    Returns (start_date, end_date) for the given period.

    Supported values:
      today, yesterday,
      this_week, last_week,
      this_month, last_month,
      this_year,
      last_7_days, last_30_days,
      all_time
    """
    if today is None:
        from django.utils import timezone
        today = timezone.now().date()

    if not period_str:
        period_str = 'this_month'

    p = period_str.lower().strip()

    if p == 'today':
        return today, today

    if p == 'yesterday':
        y = today - timedelta(days=1)
        return y, y

    if p == 'this_week':
        monday = today - timedelta(days=today.weekday())
        return monday, today

    if p == 'last_week':
        return _last_week_range(today)

    if p == 'this_month':
        return today.replace(day=1), today

    if p == 'last_month':
        return _last_month_range(today)

    if p == 'this_year':
        return today.replace(month=1, day=1), today

    if p == 'last_7_days':
        return today - timedelta(days=6), today

    if p == 'last_30_days':
        return today - timedelta(days=29), today

    if p == 'all_time':
        return None, None

    # Default fallback
    return today.replace(day=1), today


def filter_by_period(queryset, date_field, period_str, today=None):
    """Filter a queryset by the given period on a date/datetime field."""
    start, end = parse_period(period_str, today)
    if start is None or end is None:
        return queryset
    return queryset.filter(**{
        f'{date_field}__date__gte': start,
        f'{date_field}__date__lte': end,
    })


def period_label(period_str, today=None):
    """Human-readable label for the period (for the frontend to display)."""
    if today is None:
        from django.utils import timezone
        today = timezone.now().date()

    start, end = parse_period(period_str, today)
    if start is None:
        return "All time"
    if start == end:
        return start.strftime('%B %d, %Y')
    return f"{start.strftime('%b %d, %Y')} – {end.strftime('%b %d, %Y')}"
