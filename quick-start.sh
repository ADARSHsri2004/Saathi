#!/bin/bash
# Quick Start Script for Saathi Development Environment
# This script helps you set up and run both frontend and backend

echo "🚀 Saathi Quick Start Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js v16+ is required. You have v$NODE_VERSION"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm $(npm --version) detected"
echo ""

# Function to ask yes/no questions
ask_yes_no() {
    local prompt="$1"
    local response
    read -p "$prompt (y/n): " response
    [[ "$response" =~ ^[Yy]$ ]]
}

# Check PostgreSQL
echo "Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL command-line tools not found"
    if ask_yes_no "Would you like to use Docker for PostgreSQL?"; then
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Install from https://www.docker.com"
            exit 1
        fi
        
        echo "Starting PostgreSQL container..."
        docker run --name saathi-postgres \
          -e POSTGRES_PASSWORD=postgres \
          -e POSTGRES_DB=saathi_db \
          -p 5432:5432 \
          -d postgres:15
        
        echo "✅ PostgreSQL running in Docker"
        sleep 3
    else
        echo "⚠️  Please ensure PostgreSQL is installed and running"
        echo "   Download from: https://www.postgresql.org/download"
    fi
else
    echo "✅ PostgreSQL detected"
fi

echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
npm install --silent
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"

# Check if Prisma is installed
if [ ! -d "node_modules/@prisma" ]; then
    echo "📦 Installing Prisma..."
    npm install -g prisma
fi

echo ""
echo "🗄️  Setting up Database..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate --silent

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy --silent 2>/dev/null || echo "⚠️  Running migrations interactively..."
npx prisma migrate dev --name init

echo "✅ Database ready"

echo ""
cd ..
echo "📦 Installing Frontend Dependencies..."
cd frontend
npm install --silent
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Start the Backend (in one terminal):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Start the Frontend (in another terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Choose platform:"
echo "   - Press 'w' for web"
echo "   - Press 'a' for Android"
echo "   - Press 'i' for iOS (macOS only)"
echo "   - Scan QR code for physical device"
echo ""
echo "4. View Database (in terminal with backend):"
echo "   npm run prisma:studio"
echo ""
echo "📚 Documentation:"
echo "   - SETUP.md - Complete setup guide"
echo "   - BACKEND_INTEGRATION.md - Backend integration details"
echo "   - backend/API_DOCUMENTATION.md - API reference"
echo ""
