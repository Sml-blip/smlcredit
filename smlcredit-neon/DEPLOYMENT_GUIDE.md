# SmlCredit Neon Migration - Deployment Guide

## Overview

Your SmlCredit app has been migrated from localStorage to **Neon PostgreSQL** with **Netlify Functions** for serverless backend operations. This guide will walk you through the deployment process.

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React/HTML)   │
└────────┬────────┘
         │ API Calls
         ▼
┌─────────────────────────────────────┐
│   Netlify Functions (Serverless)    │
│  - /suppliers                       │
│  - /clients                         │
│  - /transactions                    │
└────────┬────────────────────────────┘
         │ SQL Queries
         ▼
┌─────────────────┐
│  Neon Database  │
│  (PostgreSQL)   │
└─────────────────┘
```

## Step 1: Set Up Neon Database

### 1.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

### 1.2 Get Connection String
1. In Neon dashboard, go to your project
2. Copy the connection string (looks like: `postgresql://user:password@host/dbname`)
3. Save it safely - you'll need it in Step 3

### 1.3 Create Database Tables
1. In Neon, open the SQL editor
2. Copy the entire contents of `schema.sql`
3. Paste and execute in the SQL editor
4. Verify all tables are created

## Step 2: Prepare Your Project

### 2.1 Install Dependencies
```bash
npm install
# or
yarn install
```

### 2.2 Create .env File
1. Copy `.env.example` to `.env`
2. Add your Neon connection string:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_NuDlHBFP3K2L@ep-lucky-cell-aeuo47hk-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
3. Keep the ADMIN_PIN (or change it to something secure)

## Step 3: Deploy to Netlify

### 3.1 Connect GitHub Repository
1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SmlCredit with Neon"
   git remote add origin https://github.com/yourusername/smlcredit-neon.git
   git push -u origin main
   ```

2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your GitHub repository
5. Click "Deploy site"

### 3.2 Configure Environment Variables
1. In Netlify dashboard, go to **Site settings** → **Build & deploy** → **Environment**
2. Add these environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `ADMIN_PIN`: Your admin PIN (default: 1234)

3. Trigger a new deploy:
   - Go to **Deploys** → **Trigger deploy** → **Deploy site**

### 3.3 Verify Deployment
1. Wait for the deploy to complete
2. Visit your Netlify URL (e.g., `https://your-site.netlify.app`)
3. Log in with your PIN
4. Try adding a supplier/client to test the database connection

## Step 4: Migrate Existing Data (Optional)

If you have existing data in localStorage from the old version:

### 4.1 Export Old Data
1. Open the old SmlCredit app
2. Go to Settings (⚙️)
3. Click "Download Backup"
4. Save the JSON file

### 4.2 Import to New Database
1. Open the new SmlCredit app
2. Go to Settings (⚙️)
3. Click "Upload Backup File"
4. Select the JSON file you downloaded
5. Confirm the import

**Note**: The import feature is coming soon. For now, you can manually recreate your data or contact support.

## Troubleshooting

### "Invalid PIN" Error
- Check that your ADMIN_PIN environment variable matches the PIN you're entering
- Make sure the DATABASE_URL is correct in Netlify environment variables
- Redeploy after changing environment variables

### "Connection refused" Error
- Verify your Neon database is running
- Check the DATABASE_URL is correct
- Ensure your Neon project allows connections from Netlify's IP range (it should by default)

### "Table does not exist" Error
- Make sure you ran the `schema.sql` script in your Neon database
- Verify the tables were created by checking the Neon dashboard

### Slow Performance
- Neon free tier may have rate limits
- Consider upgrading to a paid plan if you have high usage
- Check Netlify function logs for errors

## Security Notes

### 🔐 Admin PIN
- The PIN is sent in the `Authorization` header with each API request
- It's validated on the server side before any database operations
- **Important**: Change the default PIN (1234) in production
- Use a strong, random PIN

### 🔒 Database Security
- All connections to Neon use SSL/TLS encryption
- The connection string should be kept secret (stored in Netlify environment variables)
- Never commit `.env` files to GitHub

### 📊 Data Privacy
- All data is stored in your Neon database
- Netlify Functions run in isolation
- No data is stored on Netlify servers

## File Structure

```
smlcredit-neon/
├── public/                    # Static files
│   ├── index.html
│   ├── public.html
│   ├── app.js                 # Updated with API calls
│   └── styles.css
├── netlify/
│   └── functions/             # Serverless functions
│       ├── db.js              # Database connection
│       ├── auth.js            # Authentication
│       ├── suppliers.js       # Suppliers API
│       ├── clients.js         # Clients API
│       └── transactions.js    # Transactions API
├── schema.sql                 # Database schema
├── package.json
├── netlify.toml               # Netlify configuration
├── .env.example
└── DEPLOYMENT_GUIDE.md        # This file
```

## API Endpoints

All endpoints require the `Authorization: Bearer PIN` header.

### Suppliers
- `GET /.netlify/functions/suppliers` - Get all suppliers
- `POST /.netlify/functions/suppliers` - Create supplier
- `PUT /.netlify/functions/suppliers/:id` - Update supplier
- `DELETE /.netlify/functions/suppliers/:id` - Delete supplier

### Clients
- `GET /.netlify/functions/clients` - Get all clients
- `POST /.netlify/functions/clients` - Create client
- `PUT /.netlify/functions/clients/:id` - Update client
- `DELETE /.netlify/functions/clients/:id` - Delete client

### Transactions
- `POST /.netlify/functions/transactions/supplier/:id` - Add supplier transaction
- `POST /.netlify/functions/transactions/client/:id` - Add client transaction

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Netlify function logs in the dashboard
3. Check Neon database logs
4. Contact Netlify or Neon support

## Next Steps

1. ✅ Set up Neon database
2. ✅ Deploy to Netlify
3. ✅ Test the application
4. ✅ Migrate existing data (if needed)
5. ✅ Share the link with your team
6. ✅ Monitor performance and usage

Enjoy your new cloud-based SmlCredit! 🚀
