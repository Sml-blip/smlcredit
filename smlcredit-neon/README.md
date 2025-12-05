# SmlCredit - Cloud-Based Debt Management System

**Professional debt tracking for suppliers and clients, now with cloud database and serverless backend.**

## Features

✨ **Cloud Database** - Data synced across all devices  
🔐 **Secure** - PIN-protected admin access  
📱 **Mobile Friendly** - Works on any device  
⚡ **Fast** - Serverless functions for instant operations  
💰 **Free** - Neon + Netlify free tiers  
📊 **Detailed History** - Track all transactions  
🔗 **Shareable Links** - Send debt status to clients  

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Netlify Functions (Node.js)
- **Database**: Neon PostgreSQL
- **Hosting**: Netlify
- **Authentication**: PIN-based

## Quick Start

### Prerequisites
- GitHub account
- Neon account (free at [neon.tech](https://neon.tech))
- Netlify account (free at [netlify.com](https://netlify.com))

### 1. Set Up Database
```bash
# 1. Create Neon project at neon.tech
# 2. Copy connection string
# 3. Run schema.sql in Neon SQL editor
```

### 2. Deploy
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Netlify
# - New site from Git
# - Select this repository
# - Add environment variables:
#   DATABASE_URL=your_neon_connection_string
#   ADMIN_PIN=1234

# 3. Deploy!
```

### 3. Use
- Visit your Netlify URL
- Log in with PIN (default: 1234)
- Start tracking debts!

## Project Structure

```
smlcredit-neon/
├── public/                    # Frontend files
│   ├── index.html            # Main app
│   ├── public.html           # Share page
│   ├── app.js                # App logic (updated for API)
│   └── styles.css            # Styling
├── netlify/functions/        # Backend (serverless)
│   ├── suppliers.js          # Supplier CRUD
│   ├── clients.js            # Client CRUD
│   ├── transactions.js       # Transaction operations
│   ├── db.js                 # Database utilities
│   └── auth.js               # Authentication
├── schema.sql                # Database schema
├── netlify.toml              # Netlify config
├── package.json              # Dependencies
└── DEPLOYMENT_GUIDE.md       # Detailed setup guide
```

## API Endpoints

All endpoints require `Authorization: Bearer PIN` header.

### Suppliers
- `GET /suppliers` - List all suppliers
- `POST /suppliers` - Create supplier
- `PUT /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Delete supplier

### Clients
- `GET /clients` - List all clients
- `POST /clients` - Create client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

### Transactions
- `POST /transactions/supplier/:id` - Add supplier transaction
- `POST /transactions/client/:id` - Add client transaction

## Environment Variables

```env
# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Admin PIN for authentication
ADMIN_PIN=1234
```

## Security

- 🔐 PIN authentication on all API endpoints
- 🔒 SSL/TLS encrypted database connections
- 🛡️ Environment variables stored securely in Netlify
- 📊 No sensitive data in frontend code

## Troubleshooting

### "Invalid PIN"
Check that `ADMIN_PIN` environment variable matches your PIN in Netlify.

### "Connection refused"
Verify `DATABASE_URL` is correct and Neon database is running.

### "Table does not exist"
Run `schema.sql` in Neon SQL editor.

### Slow performance
- Check Netlify function logs
- Verify Neon database status
- Consider upgrading from free tier

## Migration from Old Version

If you're upgrading from the localStorage version:

1. Export backup from old app (Settings → Download Backup)
2. Import in new app (Settings → Upload Backup)
3. All data will be synced to Neon database

## Support

- **Documentation**: See `DEPLOYMENT_GUIDE.md`
- **Quick Start**: See `QUICKSTART.md`
- **Neon Docs**: https://neon.tech/docs
- **Netlify Docs**: https://docs.netlify.com

## License

MIT - Feel free to use and modify

## Changelog

### v2.0.0 (Current)
- ✅ Migrated to Neon PostgreSQL
- ✅ Added Netlify Functions backend
- ✅ Multi-device sync
- ✅ Cloud database
- ✅ Improved security

### v1.0.0 (Legacy)
- localStorage-based
- Single device
- No backend

---

**Ready to get started?** Follow the [Quick Start Guide](./QUICKSTART.md)
