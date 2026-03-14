#!/bin/bash
set -e

# Validate required env vars
if [ -z "$JWT_SECRET" ]; then
  echo "❌ ERROR: JWT_SECRET environment variable is required"
  echo "Set in Render dashboard or .env"
  exit 1
fi

if [ -z "$CORS_ORIGIN" ]; then
  echo "❌ ERROR: CORS_ORIGIN environment variable is required"
  echo "Example: https://linda-mama.onrender.com"
  exit 1
fi

echo "✅ Env vars validated"
echo "🚀 Deploying Linda Mama Backend to Render..."

# Ensure in backend directory
cd "$(dirname "$0")"

# Create Render persistent disk directory if needed
mkdir -p /opt/render/project/src

# Install dependencies (postinstall will build frontend)
echo "📦 Installing dependencies..."
npm ci

# Run seed (idempotent - only adds if missing demo users)
echo "🌱 Seeding database..."
npm run seed

echo "✅ Deployment complete!"
echo "JWT_SECRET: ${JWT_SECRET:0:8}... (set)"
echo "CORS_ORIGIN: $CORS_ORIGIN"
echo "Database: $(node -e \"console.log(require('./config/database.js').defaultPath || 'local')\")"
echo "Database: $(node -e \"console.log(require('./config/database.js').defaultPath || 'local')\")"
echo "Ready: npm start or Render auto-start"

