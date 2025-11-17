#!/bin/bash

# 🚀 Next.js cPanel Deployment Script
# This script prepares your Next.js app for cPanel deployment

echo "🚀 Preparing Next.js app for cPanel deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from your project root.${NC}"
    exit 1
fi

# Create deployment directory
DEPLOY_DIR="cpanel-deploy"
echo -e "${YELLOW}📁 Creating deployment directory: ${DEPLOY_DIR}${NC}"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

# Build the application
echo -e "${YELLOW}🔨 Building the application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Please fix the errors and try again.${NC}"
    exit 1
fi

# Copy necessary files
echo -e "${YELLOW}📋 Copying files to deployment directory...${NC}"

# Copy source files
cp -r app $DEPLOY_DIR/
cp -r components $DEPLOY_DIR/
cp -r lib $DEPLOY_DIR/
cp -r hooks $DEPLOY_DIR/
cp -r types $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/

# Copy configuration files
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp next.config.js $DEPLOY_DIR/
cp server.js $DEPLOY_DIR/
cp tsconfig.json $DEPLOY_DIR/
cp tailwind.config.ts $DEPLOY_DIR/
cp postcss.config.js $DEPLOY_DIR/
cp components.json $DEPLOY_DIR/

# Copy .next build directory
cp -r .next $DEPLOY_DIR/

# Create .htaccess for additional server configuration
cat > $DEPLOY_DIR/.htaccess << 'EOF'
# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
EOF

# Create environment template
cat > $DEPLOY_DIR/.env.example << 'EOF'
# Production Environment Variables
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://vejoh.org
PORT=3000
EOF

# Create deployment instructions
cat > $DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.txt << 'EOF'
🚀 cPanel Deployment Instructions

1. ZIP this entire folder
2. Upload to cPanel File Manager
3. Extract in your domain's public_html folder
4. In cPanel, go to "Setup Node.js App"
5. Create new application with these settings:
   - Node.js Version: 18.x or 20.x
   - Application Mode: Production
   - Application Root: /public_html/your-app-folder
   - Application URL: your-domain.com
   - Application Startup File: server.js
6. Click "Run NPM Install"
7. Set environment variables in cPanel
8. Click "Restart App"

Required Environment Variables:
- NODE_ENV=production
- NEXT_PUBLIC_API_URL=https://vejoh.org
- PORT=3000 (or your assigned port)

Troubleshooting:
- Check Node.js version compatibility
- Ensure all dependencies are installed
- Verify environment variables are set
- Check application logs in cPanel
EOF

# Create ZIP file
echo -e "${YELLOW}📦 Creating deployment ZIP file...${NC}"
cd $DEPLOY_DIR
zip -r ../nextjs-cpanel-deploy.zip . -x "*.DS_Store" "*.git*" "node_modules/*"
cd ..

# Clean up
rm -rf $DEPLOY_DIR

echo -e "${GREEN}✅ Deployment package created successfully!${NC}"
echo -e "${GREEN}📦 File: nextjs-cpanel-deploy.zip${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Upload nextjs-cpanel-deploy.zip to your cPanel"
echo "2. Extract it in your domain's folder"
echo "3. Follow the DEPLOYMENT_INSTRUCTIONS.txt file"
echo -e "${GREEN}🎉 Ready for deployment!${NC}"
