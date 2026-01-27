#!/bin/bash
set -e

echo "🚀 Starting backend deployment..."

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "📋 Loading environment variables..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build new images
echo "🏗️ Building Docker images..."
docker-compose build --no-cache

# Start database first
echo "🗄️ Starting database..."
docker-compose up -d db

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose run --rm backend npm run migrate

# Start backend service
echo "🚀 Starting backend service..."
docker-compose up -d backend

# Wait for service to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:${BACKEND_PORT:-3000}/ > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

echo "✅ Backend deployment completed successfully!"
