# apps/common/utilities.py


def paginate_request(request, default_size=20, max_size=100):
    """
    Parse ?page and ?page_size query params from a DRF request.

    Returns (page, size) with sane clamping:
      - page is 1-based, minimum 1
      - size is 1..max_size, defaults to default_size
      - invalid values fall back to defaults rather than raising

    Admin list endpoints should use this so they all respond with the
    same shape: {count, page, page_size, results}.
    """
    try:
        page = max(int(request.query_params.get('page', 1)), 1)
    except (TypeError, ValueError):
        page = 1

    try:
        size = min(
            max(int(request.query_params.get('page_size', default_size)), 1),
            max_size,
        )
    except (TypeError, ValueError):
        size = default_size

    return page, size
