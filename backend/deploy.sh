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
mkdir -p /opt/render/project/src/db
  DB_PATH=${DB_PATH:-/opt/render/project/src/db/linda_mama.db}
  export DB_PATH

# Install dependencies (postinstall will build frontend)
echo "📦 Installing dependencies..."
npm ci

# Run seed (idempotent - only adds if missing demo users)
echo "🌱 Seeding database..."
npm run seed

echo "✅ Deployment complete!"
echo "JWT_SECRET: ${JWT_SECRET:0:8}... (set)"
echo "CORS_ORIGIN: $CORS_ORIGIN"
echo "Database path: $DB_PATH"
node -e "
  const dbPath = process.env.DB_PATH || require('./config/database.js').defaultPath;
  console.log('DB ready at:', dbPath);
"
echo "Ready: npm start or Render auto-start"

