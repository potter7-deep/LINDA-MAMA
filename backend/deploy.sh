#!/bin/bash
set -e

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
echo "Database: $(node -e \"console.log(require('./config/database.js').defaultPath || 'local')\")"
echo "Ready: npm start or Render auto-start"

