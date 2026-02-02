#!/bin/sh
set -e

# Run migrations
echo "Running migrations..."
php artisan migrate --force

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
