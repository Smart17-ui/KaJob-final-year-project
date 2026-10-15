# apps/common/utils/media.py

from django.conf import settings


def build_absolute_media_url(file_field, request=None) -> str | None:
    """
    Return an absolute URL for a Django FileField / ImageField.

    Prefers the incoming request to build the absolute URI.
    Falls back to BACKEND_URL from settings when no request is
    available (e.g. serializers instantiated without context).

    Returns None if the field is empty or invalid.
    """
    if not file_field:
        return None

    try:
        url = file_field.url
    except (ValueError, AttributeError):
        return None

    if request is not None:
        try:
            return request.build_absolute_uri(url)
        except Exception:
            pass

    backend_url = getattr(settings, 'BACKEND_URL', 'http://localhost:8000')
    return f"{backend_url.rstrip('/')}{url}"
