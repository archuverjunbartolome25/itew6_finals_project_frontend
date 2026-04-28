# Frontend Deployment Guide - Vercel

This guide will help you deploy your React frontend application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install the CLI tool
3. **Git Repository**: Your code should be in a Git repository
4. **Environment Variables**: Have your production environment variables ready

## Quick Start

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Authenticate

```bash
vercel login
```

### 3. Deploy

```bash
# Using the deployment script
chmod +x deploy.sh
./deploy.sh

# Or manually
vercel --prod
```

## Configuration Files

### `vercel.json`

This is the main configuration file for your Vercel deployment. It defines:

- **Build settings**: Framework, build command, output directory
- **Environment variables**: API URLs, app configuration
- **Routing**: Single Page Application (SPA) routing
- **Regions**: Deployment regions for performance

### `.vercelignore`

Files and directories to exclude from deployment:
- Dependencies (`node_modules`)
- Build outputs (`dist`, `build`)
- Environment files (`.env.local`)
- IDE files (`.vscode`, `.idea`)

## Deployment Methods

### Method 1: Automatic (GitHub Actions)

1. **Set up Secrets** in your GitHub repository:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
   - `SLACK_WEBHOOK_URL`: Optional Slack notifications

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

The workflow will:
- Run tests and linting
- Build the application
- Deploy to Vercel production
- Send notifications

### Method 2: Manual (CLI)

1. **Prepare the application**:
   ```bash
   ./deploy.sh prepare
   ```

2. **Deploy**:
   ```bash
   ./deploy.sh deploy
   ```

3. **Health check**:
   ```bash
   ./deploy.sh health
   ```

### Method 3: Full Process

Run the complete deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Environment Setup

### Required Environment Variables

Create these in your Vercel dashboard or GitHub secrets:

#### Frontend Configuration
- `VITE_API_URL`: Backend API URL
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version

#### Vercel Configuration
- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Organization ID
- `VERCEL_PROJECT_ID`: Project ID

### Environment Files

- **`.env.example`**: Template for environment variables
- **`.env.local`**: Local development (excluded from Git)
- **`.env.production`**: Production settings

## Build Configuration

### Build Settings

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### Routing

Single Page Application (SPA) routing:
```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Performance Optimization

### Build Optimization

- **Tree shaking**: Remove unused code
- **Code splitting**: Split code into chunks
- **Asset optimization**: Compress images and assets
- **Bundle analysis**: Analyze bundle size

### Caching

- **Static assets**: Cached by Vercel Edge Network
- **API responses**: Configure caching headers
- **Service Worker**: Optional offline support

## Monitoring and Logging

### Vercel Analytics

- **Page views**: Track visitor statistics
- **Performance**: Monitor Core Web Vitals
- **Errors**: Track JavaScript errors

### Logs

View logs with:
```bash
vercel logs
```

### Real-time Monitoring

- **Build logs**: View build process
- **Function logs**: Monitor serverless functions
- **Deployment logs**: Track deployment status

## Custom Domains

### Add Custom Domain

1. In Vercel dashboard, go to "Domains"
2. Add your domain (e.g., `your-domain.com`)
3. Configure DNS records:
   ```
   CNAME    @    cname.vercel-dns.com
   CNAME    www  cname.vercel-dns.com
   ```

### SSL Certificates

- Automatic SSL certificate generation
- Certificate renewal handled automatically
- Support for wildcard certificates

## Troubleshooting

### Common Issues

#### Build Fails
```bash
# Check build logs
vercel logs

# Test build locally
npm run build
```

#### Deployment Fails
```bash
# Check deployment logs
vercel logs --deployment <deployment-id>

# Test deployment locally
vercel dev
```

#### Environment Variables Missing

1. Check Vercel dashboard environment variables
2. Verify GitHub secrets (if using CI/CD)
3. Check `.env.local` for local development

### Debug Commands

```bash
# Application info
vercel ls

# Project details
vercel project ls

# Environment variables
vercel env ls

# Deployment history
vercel ls --scope <team-id>

# Local development
vercel dev
```

## Best Practices

### Before Deployment

1. **Run tests locally**: `npm test`
2. **Check code quality**: `npm run lint`
3. **Test build**: `npm run build`
4. **Preview deployment**: `vercel`

### After Deployment

1. **Verify deployment**: Check live URL
2. **Test functionality**: Test key features
3. **Monitor performance**: Check Vercel Analytics
4. **Check logs**: Review deployment logs

### Ongoing Maintenance

1. **Regular updates**: Keep dependencies updated
2. **Monitor performance**: Check Core Web Vitals
3. **Review logs**: Check for errors daily
4. **Backup strategy**: Use Git for version control

## Security

### Environment Security

- **Secrets management**: Use Vercel environment variables
- **API keys**: Store in environment variables
- **HTTPS**: Automatic SSL certificates
- **CORS**: Configure backend CORS settings

### Build Security

- **Dependency scanning**: Check for vulnerabilities
- **Code analysis**: Use ESLint and Prettier
- **Bundle analysis**: Review bundle contents

## Cost Optimization

### Tips to Reduce Costs

1. **Optimize bundle size**: Use tree shaking and code splitting
2. **Cache assets**: Leverage Vercel Edge Network
3. **Optimize images**: Use modern image formats
4. **Monitor usage**: Track bandwidth and function usage

### Usage Limits

- **Free tier**: 100GB bandwidth, 100 function invocations
- **Pro tier**: Unlimited bandwidth, more function invocations
- **Enterprise**: Custom limits and support

## Advanced Configuration

### Custom Build Steps

Add custom build steps in `vercel.json`:
```json
{
  "buildCommand": "npm run build && npm run optimize"
}
```

### Serverless Functions

Create API routes in `api/` directory:
```javascript
// api/users.js
export default function handler(req, res) {
  res.json({ users: [] });
}
```

### Edge Functions

Deploy functions to the edge:
```javascript
// api/edge-function.js
export const config = {
  runtime: 'edge'
};

export default function handler(req) {
  return new Response('Hello from edge!');
}
```

This deployment guide should help you successfully deploy your React frontend to Vercel with confidence!
