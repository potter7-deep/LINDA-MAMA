#!/bin/bash
set -e

echo "🚀 Deploying Linda Mama Backend..."

# Install dependencies
npm ci --production

# Build frontend (if integrated)
cd ../frontend
npm ci --production
npm run build
cp -r dist/* ../backend/public/

cd ../backend

# Run migrations/seed if needed
# npm run migrate
npm run seed

# Create logs dir
mkdir -p logs

echo "✅ Backend deployment complete!"
echo "Run 'pm2 start ecosystem.config.js --env production' to start"

