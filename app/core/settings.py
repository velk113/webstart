import os
import environ
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))


CDEK_API = {
    'CDEK_ACCOUNT': 'EMscd6r9JnFiQ3bLoyjJY6eM78JrJceI',
    'CDEK_SECURE_PASSWORD': 'PjLZkKBHEiLK3YsjtNrt3TGNG0ahs3kG',
    'CDEK_TARIFF_CODE': '10',
    'CODE_SENDING_LOCATION': '270',
    'IS_SANDBOX': True,
}

SECRET_KEY = env('DJANGO_SECRET_KEY')

DEBUG = bool(int(env('DEBUG', default=1)))

ALLOWED_HOSTS = env('DJANGO_ALLOWED_HOSTS').split(' ')



INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'apps.account',
    'apps.catalog',
    'apps.delivery_widget',
    'apps.blog',
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

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.{}'.format(
            env('DATABASE_ENGINE', default='sqlite3')
        ),
        'NAME': env('DATABASE_NAME', default='no_name'),
        'USER': env('DATABASE_USERNAME', default='postgres'),
        'PASSWORD': env('DATABASE_PASSWORD', default='postgres'),
        'HOST': env('DATABASE_HOST', default='127.0.0.1'),
        'PORT': env('DATABASE_PORT', default='5432'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

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


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'ru-RU'

TIME_ZONE = 'Europe/Moscow'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/


STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

#MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_ROOT = '/vol/web/media/'
MEDIA_URL = '/static/media/'

#STATIC_ROOT = os.path.join(BASE_DIR, 'public')
STATIC_ROOT = '/vol/web/static/'
STATIC_URL = '/static/static/'