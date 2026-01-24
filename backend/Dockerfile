FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    nginx \
    supervisor

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Configure Nginx
COPY nginx.conf /etc/nginx/sites-available/default
# Remove default nginx config if it exists
# RUN rm /etc/nginx/sites-enabled/default
# Link new config? Default in sites-available/default is already included by nginx.conf

# Configure Supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create a non-root user (optional but good practice, here skipping for simplicity/speed)

# Expose ports
EXPOSE 8000

# Start Supervisor
CMD ["/usr/bin/supervisord"]
