"""
Django settings for config project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# ============================================
# LOAD ENVIRONMENT VARIABLES FROM .env
# ============================================

ENV_PATH = BASE_DIR / '.env'

if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
    print(f"Loaded environment variables from: {ENV_PATH}")
else:
    print(f"Warning: .env file not found at {ENV_PATH}")

# ============================================
# HELPER FUNCTION TO GET ENV VARIABLES
# ============================================

def get_env(key, default=None, required=False, cast=None):
    """
    Get environment variable with optional casting.
    """
    value = os.getenv(key, default)
    
    if required and value is None:
        raise ValueError(f"Required environment variable '{key}' is missing!")
    
    if value is not None and cast is not None:
        if cast is bool:
            return value.lower() in ('true', '1', 'yes', 'on')
        elif cast is int:
            try:
                return int(value)
            except ValueError:
                return default
        elif cast is list:
            if isinstance(value, str):
                return [item.strip() for item in value.split(',') if item.strip()]
            return value
        else:
            return cast(value)
    
    return value

# ============================================
# DJANGO CORE SETTINGS
# ============================================

SECRET_KEY = get_env('SECRET_KEY', required=True)
DEBUG = get_env('DEBUG', default='True', cast=bool)
ALLOWED_HOSTS = get_env('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=list)

# ============================================
# APPLICATION DEFINITION
# ============================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Local apps
    'apps.accounts',
    'apps.jobs',
    'apps.notifications',
    'apps.reports',
    'apps.common',
    'apps.matching',
    'apps.audit',
    'apps.identity_verification',
    'apps.reviews',
    'apps.admin_panel',

    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ============================================
# DATABASE CONFIGURATION
# ============================================

DATABASES = {
    'default': {
        'ENGINE': get_env('DB_ENGINE', default='django.db.backends.postgresql'),
        'NAME': get_env('DB_NAME', required=True),
        'USER': get_env('DB_USER', required=True),
        'PASSWORD': get_env('DB_PASSWORD', required=True),
        'HOST': get_env('DB_HOST', default='localhost'),
        'PORT': get_env('DB_PORT', default='5432'),
        'CONN_MAX_AGE': get_env('DB_CONN_MAX_AGE', default='600', cast=int),
        'OPTIONS': {
            'options': get_env('DB_OPTIONS', default='-c search_path=public'),
        },
    }
}

# ============================================
# AUTH USER MODEL
# ============================================

AUTH_USER_MODEL = 'accounts.User'

# ============================================
# PASSWORD VALIDATION
# ============================================

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ============================================
# INTERNATIONALIZATION
# ============================================

LANGUAGE_CODE = get_env('LANGUAGE_CODE', default='en-us')
TIME_ZONE = get_env('TIME_ZONE', default='Africa/Lusaka')
USE_I18N = True
USE_TZ = True

# ============================================
# STATIC FILES
# ============================================

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []

# ============================================
# MEDIA FILES
# ============================================

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ============================================
# DEFAULT PRIMARY KEY FIELD
# ============================================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ============================================
# REST FRAMEWORK CONFIGURATION
# ============================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'register': '5/hour',
        'login': '10/minute',
    },
}

# ============================================
# JWT CONFIGURATION
# ============================================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(
        days=get_env('JWT_ACCESS_TOKEN_LIFETIME', default=1, cast=int)
    ),
    'REFRESH_TOKEN_LIFETIME': timedelta(
        days=get_env('JWT_REFRESH_TOKEN_LIFETIME', default=7, cast=int)
    ),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# ============================================
# EMAIL CONFIGURATION
# ============================================

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
FRONTEND_URL = get_env('FRONTEND_URL', default='http://localhost:3000')

# ============================================
# LOGGING
# ============================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'kajob.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': True,
        },
    },
}

# Ensure logs directory exists
LOG_DIR = BASE_DIR / 'logs'
if not LOG_DIR.exists():
    LOG_DIR.mkdir(parents=True, exist_ok=True)

print(f"Database: {DATABASES['default']['NAME']} at {DATABASES['default']['HOST']}:{DATABASES['default']['PORT']}")
print(f"User: {DATABASES['default']['USER']}")
print(f"Debug Mode: {DEBUG}")
print(f"JWT Access Token Lifetime: {SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']}")
