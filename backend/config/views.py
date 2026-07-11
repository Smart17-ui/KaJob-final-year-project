# config/views.py
from django.http import JsonResponse


def bad_request(request, exception=None):
    """400 Bad Request error handler"""
    return JsonResponse({
        'error': 'Bad Request',
        'message': 'The request could not be understood by the server.',
        'status_code': 400,
    }, status=400)


def permission_denied(request, exception=None):
    """403 Forbidden error handler"""
    return JsonResponse({
        'error': 'Forbidden',
        'message': 'You do not have permission to perform this action.',
        'status_code': 403,
    }, status=403)


def page_not_found(request, exception=None):
    """404 Not Found error handler"""
    return JsonResponse({
        'error': 'Not Found',
        'message': 'The requested resource was not found.',
        'status_code': 404,
    }, status=404)


def server_error(request):
    """500 Internal Server Error handler"""
    return JsonResponse({
        'error': 'Internal Server Error',
        'message': 'Something went wrong on our end. Please try again later.',
        'status_code': 500,
    }, status=500)
