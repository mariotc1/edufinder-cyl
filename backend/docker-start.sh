#!/bin/sh
set -e

# Run migrations
echo "Running migrations..."
echo "Linking storage..."
rm -rf public/storage
php artisan storage:link
php artisan migrate --force

# Seed Admin User (Idempotent)
echo "Seeding Admin User..."
php artisan db:seed --class=UserSeeder --force

# Sync OpenData (Only in non-local environments)
if [ "$APP_ENV" != "local" ]; then
    echo "Syncing OpenData..."
    php artisan opendata:sync
else
    echo "Skipping OpenData sync in local environment..."
fi

# Clear caches
echo "Clearing caches..."
php artisan optimize:clear

# Cache config and routes
echo "Caching config and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Supervisor
echo "Starting Supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf