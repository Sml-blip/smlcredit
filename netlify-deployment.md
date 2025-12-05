# Netlify Deployment Configuration

## Build Settings

When connecting your GitHub repository to Netlify, use these settings:

### Basic Settings
- **Repository**: Your GitHub repository URL
- **Branch to deploy**: main (or your default branch)
- **Build command**: `echo 'Static site - no build needed'`
- **Publish directory**: `public`
- **Functions directory**: `netlify/functions`

### Environment Variables

Add these in **Site settings → Build & deploy → Environment**:

```
DATABASE_URL=postgresql://neondb_owner:npg_NuDlHBFP3K2L@ep-lucky-cell-aeuo47hk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

ADMIN_PIN=1234
```

## Netlify Configuration File

The `netlify.toml` file is already configured with:

```toml
[build]
  command = "echo 'Static site - no build needed'"
  publish = "public"
  functions = "netlify/functions"

[dev]
  command = "netlify dev"
  port = 8888

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

## Deployment Steps

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "SmlCredit with Neon PostgreSQL"
git remote add origin https://github.com/yourusername/smlcredit-neon.git
git push -u origin main
```

### Step 2: Connect to Netlify
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "New site from Git"
3. Select GitHub and authorize
4. Choose your repository
5. Click "Deploy site"

### Step 3: Add Environment Variables
1. Go to **Site settings**
2. Click **Build & deploy**
3. Click **Environment**
4. Click **Edit variables**
5. Add `DATABASE_URL` and `ADMIN_PIN`
6. Save

### Step 4: Trigger Deploy
1. Go to **Deploys**
2. Click **Trigger deploy**
3. Select **Deploy site**
4. Wait for deployment to complete

### Step 5: Test
1. Visit your Netlify URL (e.g., https://your-site.netlify.app)
2. Log in with PIN: 1234
3. Try adding a supplier/client
4. Verify data is saved

## Function Logs

To debug Netlify Functions:

1. Go to **Functions** in Netlify dashboard
2. Click on a function name
3. View logs in real-time
4. Check for errors

## Performance Monitoring

### Monitor Function Performance
- **Netlify Analytics**: Built-in performance metrics
- **Function Invocations**: Track API calls
- **Execution Time**: See function response times

### Monitor Database Performance
- **Neon Dashboard**: Query performance
- **Connection Pool**: Monitor active connections
- **Query Analytics**: Identify slow queries

## Troubleshooting

### Deploy Fails
- Check build logs in Netlify dashboard
- Verify all files are committed to Git
- Check for syntax errors in JavaScript

### Functions Return 500 Error
- Check function logs in Netlify dashboard
- Verify DATABASE_URL environment variable
- Check Neon database connectivity

### Slow Response Times
- Check function execution time in logs
- Verify database query performance
- Consider upgrading Neon plan if needed

## Scaling

### For Higher Traffic
1. **Upgrade Neon Plan**: Free tier has rate limits
2. **Enable Caching**: Add caching headers to responses
3. **Optimize Queries**: Add database indexes
4. **Monitor Usage**: Track API calls and database load

### Production Checklist
- [ ] Change ADMIN_PIN to a strong value
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain
- [ ] Enable HTTPS (automatic with Netlify)
- [ ] Set up backups for database
- [ ] Document API endpoints
- [ ] Test all features thoroughly

## Custom Domain

1. Go to **Site settings → Domain management**
2. Click **Add custom domain**
3. Enter your domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take 24-48 hours)

## SSL/TLS Certificate

Netlify automatically provides free SSL/TLS certificates for all sites, including custom domains.

## Rollback

If something goes wrong:
1. Go to **Deploys**
2. Find the previous working deploy
3. Click **Restore**
4. Confirm rollback

## Continuous Deployment

Every push to your GitHub repository automatically triggers a new deploy:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Netlify automatically deploys!
```

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
