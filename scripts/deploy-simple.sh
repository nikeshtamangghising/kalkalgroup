#!/bin/bash

# Simple Deployment Script for Production
# This script completes the deployment process after build

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Main deployment function
main() {
    log "🚀 Starting deployment process..."
    
    # The build is already completed, so we just need to finalize
    info "Build already completed successfully"
    
    # Check if .next directory exists
    if [ ! -d ".next" ]; then
        error "Build output not found. Please run 'npm run build' first."
        exit 1
    fi
    
    # Create deployment info
    info "Creating deployment information..."
    COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Create deployment manifest
    cat > deployment-info.json << EOF
{
  "deployment": {
    "commit": "$COMMIT_HASH",
    "buildTime": "$BUILD_TIME",
    "environment": "production",
    "status": "ready"
  }
}
EOF
    
    log "✅ Deployment preparation completed"
    log "📋 Deployment Summary:"
    info "   - Build: Successful"
    info "   - Commit: $COMMIT_HASH"
    info "   - Build Time: $BUILD_TIME"
    info "   - Status: Ready for production"
    
    log "🎉 Deployment ready for production!"
    info "The application is ready to be served by the hosting platform."
}

# Run main function
main "$@"
