#!/bin/sh
set -e 

if [ "$DATABASE_ENGINE" = "postgresql_psycopg2" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi


python manage.py collectstatic --noinput
python manage.py migrate

#python manage.py runserver 0.0.0.0:8000
gunicorn core.wsgi:application \
--bind 0.0.0.0:8000 \
--log-level=debug

exec "$@"