#!/bin/bash

# Vercel Deployment Script
# This script helps deploy your React application to Vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
        if command -v vercel &> /dev/null; then
            log_success "Vercel CLI installed successfully"
        else
            log_error "Failed to install Vercel CLI"
            exit 1
        fi
    else
        log_success "Vercel CLI is already installed"
    fi
}

# Check if we're logged in to Vercel
check_auth() {
    log_info "Checking Vercel authentication..."
    if vercel whoami &> /dev/null; then
        log_success "Already authenticated with Vercel"
    else
        log_warning "Not authenticated with Vercel"
        log_info "Please run: vercel login"
        exit 1
    fi
}

# Prepare the application for deployment
prepare_app() {
    log_info "Preparing application for deployment..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Run tests
    log_info "Running tests..."
    npm test
    
    # Run linting
    log_info "Running linting..."
    npm run lint
    
    # Build application
    log_info "Building application..."
    npm run build
    
    log_success "Application preparation completed"
}

# Deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    # Check if vercel.json exists
    if [ ! -f "vercel.json" ]; then
        log_error "vercel.json not found"
        exit 1
    fi
    
    # Deploy the application
    if vercel --prod; then
        log_success "Deployment to production successful"
    else
        log_error "Deployment failed"
        exit 1
    fi
}

# Deploy preview to Vercel
deploy_preview() {
    log_info "Deploying preview to Vercel..."
    
    # Deploy preview
    if vercel; then
        log_success "Preview deployment successful"
    else
        log_error "Preview deployment failed"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Get the application URL from Vercel
    APP_URL=$(vercel ls --scope $(vercel whoami | cut -d' ' -f1) | grep $(basename $(pwd)) | head -1 | awk '{print $3}')
    
    if [ -z "$APP_URL" ]; then
        log_warning "Could not retrieve application URL"
        return
    fi
    
    log_info "Checking application health at: $APP_URL"
    
    # Wait for the application to be ready
    for i in {1..30}; do
        if curl -f "$APP_URL" &> /dev/null; then
            log_success "Application is healthy and ready!"
            echo "Application URL: $APP_URL"
            break
        else
            log_info "Waiting for application to be ready... ($i/30)"
            sleep 10
        fi
        
        if [ $i -eq 30 ]; then
            log_warning "Health check failed after 30 attempts"
            log_info "Please check the application logs: vercel logs"
        fi
    done
}

# Main deployment process
main() {
    log_info "Starting Vercel deployment process..."
    
    # Check prerequisites
    check_vercel_cli
    check_auth
    
    # Prepare application
    prepare_app
    
    # Deploy
    deploy_to_vercel
    
    # Health check
    health_check
    
    log_success "Deployment process completed!"
    log_info "You can check your application status with: vercel ls"
    log_info "View logs with: vercel logs"
}

# Handle script arguments
case "${1:-}" in
    "prepare")
        prepare_app
        ;;
    "deploy")
        deploy_to_vercel
        ;;
    "preview")
        deploy_preview
        ;;
    "health")
        health_check
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [prepare|deploy|preview|health|help]"
        echo ""
        echo "Commands:"
        echo "  prepare  - Prepare the application for deployment"
        echo "  deploy   - Deploy to Vercel production"
        echo "  preview  - Deploy preview to Vercel"
        echo "  health   - Perform health check after deployment"
        echo "  help     - Show this help message"
        echo ""
        echo "If no command is provided, the full deployment process will run."
        ;;
    "")
        main
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac
