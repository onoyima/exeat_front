# 🚀 Deploying to cPanel

## Quick Deployment (Automated)

### Option 1: Use the Deployment Script
```bash
# Run the automated deployment script
./deploy.sh
```

This will:
- Build your application
- Create a deployment package
- Generate `nextjs-cpanel-deploy.zip`
- Include all necessary files and instructions

---

## Manual Deployment

### Step 1: Build for Production
```bash
npm run build
```

### Step 2: Prepare Files for Upload
Create a ZIP file containing these files/folders:
- All source files (except `node_modules`)
- `package.json`
- `package-lock.json`
- `next.config.js`
- `server.js`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `public/` folder
- `components/` folder
- `app/` folder
- `lib/` folder
- `hooks/` folder
- `types/` folder
- `.next/` folder (generated after build)

### Step 3: Upload to cPanel
1. Upload your entire project (excluding `node_modules`)
2. In cPanel, go to **Setup Node.js App**
3. Create new application:
   - **Node.js Version**: 18.x or 20.x
   - **Application Mode**: Production
   - **Application Root**: `/public_html/your-app`
   - **Application URL**: Your domain
   - **Application Startup File**: `server.js`
4. Click **Run NPM Install**
5. Click **Restart App**

---

## Environment Variables

Make sure to set these in your cPanel or hosting environment:

```env
NEXT_PUBLIC_API_URL=https://vejoh.org
NODE_ENV=production
```

## Troubleshooting

### Common Issues:
1. **404 on refresh**: Add the `.htaccess` file for client-side routing
2. **API routes not working**: Use static export method or ensure Node.js support
3. **Build errors**: Check for TypeScript errors with `npm run lint`
4. **Slow loading**: Enable compression in `.htaccess`

### File Structure After Deployment:
```
public_html/
├── index.html
├── _next/
├── static/
├── .htaccess
└── [other static files]
```

## Pre-deployment Checklist:
- [ ] Run `npm run build` successfully
- [ ] Test locally with `npm run start`
- [ ] Check all environment variables
- [ ] Verify API endpoints are accessible
- [ ] Test responsive design
- [ ] Check all routes work correctly
