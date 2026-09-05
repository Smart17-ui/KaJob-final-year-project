"""
Django settings for config project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta


# ============================================
# BUILD PATHS
# ============================================

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
        raise ValueError(
            f"Required environment variable '{key}' is missing!"
        )

    if value is not None and cast is not None:

        if cast is bool:
            return value.lower() in (
                'true',
                '1',
                'yes',
                'on'
            )

        elif cast is int:
            try:
                return int(value)
            except ValueError:
                return default

        elif cast is list:
            if isinstance(value, str):
                return [
                    item.strip()
                    for item in value.split(',')
                    if item.strip()
                ]
            return value

        else:
            return cast(value)

    return value


# ============================================
# DJANGO CORE SETTINGS
# ============================================

SECRET_KEY = get_env(
    'SECRET_KEY',
    required=True
)

DEBUG = get_env(
    'DEBUG',
    default='True',
    cast=bool
)

ALLOWED_HOSTS = get_env(
    'ALLOWED_HOSTS',
    default='localhost,127.0.0.1',
    cast=list
)


# ============================================
# APPLICATION DEFINITION
# ============================================

INSTALLED_APPS = [
    'daphne',

    # Django default apps
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
    'apps.analytics',

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'channels',
]

# ============================================
# MIDDLEWARE CONFIGURATION
# ============================================

MIDDLEWARE = [
    
    # Django default middleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',

    # Custom CORS middleware
    'infrastructure.middleware.cors_middleware.CORSMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # Custom middleware
    'infrastructure.middleware.request_id_middleware.RequestIDMiddleware',
    'infrastructure.middleware.logging_middleware.RequestLoggingMiddleware',
    'infrastructure.middleware.auth_middleware.JWTAuthenticationMiddleware',
    'infrastructure.middleware.rate_limit_middleware.RateLimitMiddleware',
    'infrastructure.middleware.audit_middleware.AuditMiddleware',
    'infrastructure.middleware.performance_middleware.PerformanceMiddleware',
    'infrastructure.middleware.security_middleware.SecurityHeadersMiddleware',
]

# ============================================
# CORS SETTINGS
# ============================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOWED_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-request-id',
    'x-requested-with',
]

CORS_ALLOW_CREDENTIALS = True

CORS_MAX_AGE = 86400

ROOT_URLCONF = 'config.urls'


# ============================================
# TEMPLATES
# ============================================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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


# ============================================
# WSGI APPLICATION
# ============================================

WSGI_APPLICATION = 'config.wsgi.application'


# ============================================
# DATABASE CONFIGURATION
# ============================================

DATABASES = {
    'default': {

        'ENGINE': get_env(
            'DB_ENGINE',
            default='django.db.backends.postgresql'
        ),

        'NAME': get_env(
            'DB_NAME',
            required=True
        ),

        'USER': get_env(
            'DB_USER',
            required=True
        ),

        'PASSWORD': get_env(
            'DB_PASSWORD',
            required=True
        ),

        'HOST': get_env(
            'DB_HOST',
            default='localhost'
        ),

        'PORT': get_env(
            'DB_PORT',
            default='5432'
        ),

        'CONN_MAX_AGE': get_env(
            'DB_CONN_MAX_AGE',
            default='600',
            cast=int
        ),

        'OPTIONS': {
            'options': get_env(
                'DB_OPTIONS',
                default='-c search_path=public'
            ),
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
        'NAME':
            'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },

    {
        'NAME':
            'django.contrib.auth.password_validation.MinimumLengthValidator',
    },

    {
        'NAME':
            'django.contrib.auth.password_validation.CommonPasswordValidator',
    },

    {
        'NAME':
            'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ============================================
# INTERNATIONALIZATION
# ============================================

LANGUAGE_CODE = get_env(
    'LANGUAGE_CODE',
    default='en-us'
)

TIME_ZONE = get_env(
    'TIME_ZONE',
    default='Africa/Lusaka'
)

USE_I18N = True

USE_TZ = True


# ============================================
# STATIC FILES
# ============================================

STATIC_URL = 'static/'

STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_DIRS = [
    BASE_DIR / 'static'
] if (BASE_DIR / 'static').exists() else []


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

    'DEFAULT_PAGINATION_CLASS':
        'rest_framework.pagination.PageNumberPagination',

    'PAGE_SIZE': 20,

    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ),

    # ============================================
    # 🆕 ENHANCED RATE LIMITING
    # Will be overridden below based on DEBUG
    # ============================================

    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'register': '5/hour',
        'login': '10/minute',
    },

    'DEFAULT_SCHEMA_CLASS':
        'drf_spectacular.openapi.AutoSchema',
}


# ============================================
# 🆕 ENVIRONMENT-BASED RATE LIMITING
# ============================================

if DEBUG:
    # 🔓 DEVELOPMENT MODE: High limits for testing
    REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
        # General limits
        'anon': '10000/day',        # 10,000 requests per day
        'user': '50000/day',        # 50,000 requests per day
        
        # Authentication
        'register': '100/hour',     # 100 registrations per hour
        'login': '100/minute',      # 100 login attempts per minute
        
        # Application features
        'application': '500/minute', # 500 job applications per minute
        'location': '500/minute',    # 500 location updates per minute
        'job_create': '100/minute',  # 100 job creations per minute
        'review': '100/minute',      # 100 reviews per minute
        'verification': '50/hour',   # 50 verification attempts per hour
        
        # Additional endpoint groups
        'jobs': '200/minute',        # 200 job-related requests per minute
        'profile': '200/minute',     # 200 profile requests per minute
        'matching': '200/minute',    # 200 matching requests per minute
        'notifications': '200/minute', # 200 notification requests per minute
    }
    print("🔓 DEVELOPMENT MODE: High rate limits enabled (50x higher)")
else:
    # 🔒 PRODUCTION MODE: Strict limits for security
    REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
        # General limits
        'anon': '100/day',
        'user': '1000/day',
        
        # Authentication
        'register': '5/hour',
        'login': '10/minute',
        
        # Application features
        'application': '100/minute',
        'location': '60/minute',
        'job_create': '10/minute',
        'review': '10/minute',
        'verification': '3/hour',
        
        # Additional endpoint groups
        'jobs': '60/minute',
        'profile': '60/minute',
        'matching': '60/minute',
        'notifications': '60/minute',
    }
    print("🔒 PRODUCTION MODE: Strict rate limits enabled")


# ============================================
# JWT CONFIGURATION
# ============================================

SIMPLE_JWT = {

    'ACCESS_TOKEN_LIFETIME': timedelta(
        days=get_env(
            'JWT_ACCESS_TOKEN_LIFETIME',
            default=1,
            cast=int
        )
    ),

    'REFRESH_TOKEN_LIFETIME': timedelta(
        days=get_env(
            'JWT_REFRESH_TOKEN_LIFETIME',
            default=7,
            cast=int
        )
    ),

    'ROTATE_REFRESH_TOKENS': True,

    'BLACKLIST_AFTER_ROTATION': True,

    'ALGORITHM': 'HS256',

    'SIGNING_KEY': SECRET_KEY,

    'VERIFYING_KEY': None,

    'AUTH_HEADER_TYPES': (
        'Bearer',
    ),

    'AUTH_HEADER_NAME':
        'HTTP_AUTHORIZATION',

    'USER_ID_FIELD':
        'id',

    'USER_ID_CLAIM':
        'user_id',

    'AUTH_TOKEN_CLASSES': (
        'rest_framework_simplejwt.tokens.AccessToken',
    ),

    'TOKEN_TYPE_CLAIM':
        'token_type',

    'JTI_CLAIM':
        'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM':
        'refresh_exp',

    'SLIDING_TOKEN_LIFETIME':
        timedelta(minutes=5),

    'SLIDING_TOKEN_REFRESH_LIFETIME':
        timedelta(days=1),
}


# ============================================
# EMAIL CONFIGURATION
# ============================================

EMAIL_BACKEND = get_env(
    'EMAIL_BACKEND', 
    default='django.core.mail.backends.smtp.EmailBackend'
)
EMAIL_HOST = get_env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = get_env('EMAIL_PORT', default='587', cast=int)
EMAIL_USE_TLS = get_env('EMAIL_USE_TLS', default='True', cast=bool)
EMAIL_HOST_USER = get_env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = get_env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = get_env('DEFAULT_FROM_EMAIL', default='noreply@kajob.com')

FRONTEND_URL = get_env('FRONTEND_URL', default='http://localhost:5173')

# ============================================
# CHANNELS / WEBSOCKET CONFIGURATION
# ============================================

ASGI_APPLICATION = 'config.asgi.application'

# ✅ In-memory channel layer (no Redis needed!)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

WEBSOCKET_URL = '/ws/'


# ============================================
# LOGGING
# ============================================

LOGGING = {

    'version': 1,

    'disable_existing_loggers': False,

    'formatters': {

        'verbose': {
            'format':
                '{levelname} {asctime} {module} '
                '{process:d} {thread:d} {message}',

            'style': '{',
        },

        'simple': {
            'format':
                '{levelname} {asctime} {message}',

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
            'handlers': [
                'console',
                'file'
            ],

            'level': 'INFO',

            'propagate': True,
        },

        'apps': {

            'handlers': [
                'console',
                'file'
            ],

            'level':
                'DEBUG' if DEBUG else 'INFO',

            'propagate': True,
        },
        'channels': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': True,
        },
    },
}


# ============================================
# ENSURE LOG DIRECTORY EXISTS
# ============================================

LOG_DIR = BASE_DIR / 'logs'

if not LOG_DIR.exists():
    LOG_DIR.mkdir(
        parents=True,
        exist_ok=True
    )


# ============================================
# STARTUP INFORMATION
# ============================================

print(
    f"Database: "
    f"{DATABASES['default']['NAME']} "
    f"at "
    f"{DATABASES['default']['HOST']}:"
    f"{DATABASES['default']['PORT']}"
)

print(
    f"User: "
    f"{DATABASES['default']['USER']}"
)

print(
    f"Debug Mode: "
    f"{DEBUG}"
)

print(
    f"JWT Access Token Lifetime: "
    f"{SIMPLE_JWT['ACCESS_TOKEN_LIFETIME']}"
)

print(
    f"Email Backend: "
    f"{EMAIL_BACKEND}"
)

print(
    f"Email Host: "
    f"{EMAIL_HOST}"
)

print(
    f"Email User: "
    f"{EMAIL_HOST_USER}"
)

# 🆕 Display rate limit information
print("\n" + "="*50)
print("RATE LIMITING STATUS")
print("="*50)
for scope, rate in REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'].items():
    print(f"  {scope}: {rate}")
print("="*50 + "\n")
