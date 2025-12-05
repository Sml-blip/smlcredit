# Quick Start Guide - SmlCredit with Neon

## 5-Minute Setup

### Step 1: Create Neon Database (2 minutes)
1. Go to [neon.tech](https://neon.tech) → Sign up
2. Create a new project
3. Copy your connection string from the dashboard
4. In Neon SQL editor, paste and run the contents of `schema.sql`

### Step 2: Deploy to Netlify (2 minutes)
1. Push this code to GitHub
2. Go to [netlify.com](https://netlify.com) → "New site from Git"
3. Select your GitHub repo
4. Add environment variables in Netlify:
   - `DATABASE_URL`: Your Neon connection string
   - `ADMIN_PIN`: 1234 (or your PIN)
5. Deploy!

### Step 3: Test (1 minute)
1. Visit your Netlify URL
2. Log in with PIN: `1234`
3. Add a test supplier/client
4. Check if data appears (it should!)

## Your Neon Connection String

You provided this connection string:
```
postgresql://neondb_owner:npg_NuDlHBFP3K2L@ep-lucky-cell-aeuo47hk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Use this exact string in Netlify environment variables as `DATABASE_URL`**

## What Changed from Old Version?

| Feature | Old (localStorage) | New (Neon) |
|---------|-------------------|-----------|
| **Data Storage** | Browser only | Cloud database |
| **Multi-device** | ❌ No | ✅ Yes |
| **Backup** | Manual JSON | Automatic |
| **Sharing** | Embedded in URL | Database query |
| **Hosting** | Static files | Netlify Functions |
| **Cost** | Free | Free (Neon + Netlify) |

## Environment Variables for Netlify

In Netlify dashboard → Site settings → Build & deploy → Environment:

```
DATABASE_URL=postgresql://neondb_owner:npg_NuDlHBFP3K2L@ep-lucky-cell-aeuo47hk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
ADMIN_PIN=1234
```

## File Structure

```
netlify/functions/     ← Backend (serverless)
  ├── suppliers.js     ← Supplier operations
  ├── clients.js       ← Client operations
  ├── transactions.js  ← Transaction operations
  ├── db.js            ← Database connection
  └── auth.js          ← PIN authentication

public/                ← Frontend (static)
  ├── index.html       ← Main app
  ├── app.js           ← Updated for API
  ├── styles.css
  └── public.html      ← Share page

schema.sql             ← Database tables
netlify.toml           ← Netlify config
package.json           ← Dependencies
```

## Common Issues

### "Invalid PIN"
→ Check DATABASE_URL and ADMIN_PIN in Netlify environment variables

### "Connection refused"
→ Verify Neon database is running and connection string is correct

### "Table does not exist"
→ Run schema.sql in Neon SQL editor

### Data not saving
→ Check Netlify function logs for errors

## Next Steps

1. Deploy to Netlify
2. Test with sample data
3. Migrate old data (if you have any)
4. Share with your team
5. Monitor usage

## Support

- **Neon Issues**: https://neon.tech/docs
- **Netlify Issues**: https://netlify.com/support
- **App Issues**: Check function logs in Netlify dashboard

---

**Ready to deploy?** Follow the full guide in `DEPLOYMENT_GUIDE.md`
