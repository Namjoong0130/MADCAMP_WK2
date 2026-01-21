#!/bin/bash

# MADCAMP WK2 - Deployment Script
# This script helps deploy the application to the K-Cloud VM

set -e  # Exit on error

echo "========================================"
echo "MADCAMP WK2 Deployment Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

print_info() {
    echo -e "${NC}→ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Backend Setup"
echo "---------------------"

cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cat > .env << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/modif_db"
JWT_SECRET="$(openssl rand -base64 32)"
FAL_KEY=""
PORT=3000
FRONTEND_URL="http://172.10.5.178"
EOF
    print_info "Created .env file. Please edit it with your database credentials and API keys"
    print_error "Deployment cannot continue without proper .env configuration"
    exit 1
fi

print_success ".env file found"

# Install dependencies
print_info "Installing backend dependencies..."
npm install

# Generate Prisma Client
print_info "Generating Prisma Client..."
npx prisma generate

# Ask if user wants to run migration
echo ""
read -p "Do you want to run database migration? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Running database migration..."
    npx prisma migrate dev --name add_garment_model
    print_success "Database migration completed"
else
    print_warning "Skipping database migration. Run manually with: npx prisma migrate dev"
fi

print_success "Backend setup complete"

cd ..

echo ""
echo "Step 2: Frontend Setup"
echo "---------------------"

cd frontend

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_info "Creating .env.production..."
    cat > .env.production << EOF
VITE_API_BASE_URL=http://172.10.5.178
EOF
    print_success "Created .env.production"
fi

# Install dependencies
print_info "Installing frontend dependencies..."
npm install

# Build frontend
print_info "Building frontend for production..."
npm run build

print_success "Frontend build complete"

cd ..

echo ""
echo "Step 3: Final Checks"
echo "-------------------"

# Check if dist folder was created
if [ -d "frontend/dist" ]; then
    print_success "Frontend dist folder created"
else
    print_error "Frontend dist folder not found"
    exit 1
fi

# Check if Prisma client was generated
if [ -d "backend/node_modules/.prisma" ]; then
    print_success "Prisma client generated"
else
    print_warning "Prisma client may not be generated correctly"
fi

echo ""
echo "========================================"
echo "Deployment Preparation Complete!"
echo "========================================"
echo ""
print_info "Next steps:"
echo "  1. Start the backend server:"
echo "     cd backend && npm start"
echo "     (or use PM2: pm2 start backend/server.js --name modif-backend)"
echo ""
echo "  2. Configure Nginx to serve frontend/dist and proxy /api to backend"
echo ""
echo "  3. Test the application:"
echo "     - Frontend: http://172.10.5.178"
echo "     - API Docs: http://172.10.5.178/api-docs"
echo ""
print_success "See INTEGRATION_SUMMARY.md for detailed deployment instructions"
echo ""