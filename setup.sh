#!/bin/bash

# Get the script directory (handles paths with spaces)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏥 Linda Mama - Setup Script${NC}\n"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Error: Node.js 18+ required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node -v)${NC}\n"

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd "$SCRIPT_DIR/backend" || exit 1
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend dependencies installed${NC}\n"

# Seed database
echo -e "${YELLOW}🗄️ Seeding database...${NC}"
npm run seed
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to seed database${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database seeded successfully${NC}\n"

# Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd "$SCRIPT_DIR/frontend" || exit 1
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend dependencies installed${NC}\n"

echo -e "${GREEN}🎉 Setup complete!${NC}\n"
echo -e "To start the application:\n"
echo -e "${YELLOW}Terminal 1 (Backend):${NC}"
echo -e "  cd $SCRIPT_DIR/backend && npm start"
echo -e "  (Server runs on http://localhost:3000)\n"
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo -e "  cd $SCRIPT_DIR/frontend && npm run dev"
echo -e "  (App runs on http://localhost:5173)\n"
echo -e "${GREEN}Demo Accounts:${NC}"
echo -e "  Admin: admin@lindamama.ke / password123"
echo -e "  Provider: provider@lindamama.ke / password123"
echo -e "  Mother: grace@email.com / password123\n"

