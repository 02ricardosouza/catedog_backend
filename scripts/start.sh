#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npm run migrate:prod

echo "🚀 Starting application..."
exec npm start
