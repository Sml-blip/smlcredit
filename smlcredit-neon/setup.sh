#!/bin/bash

# SmlCredit Setup Script
# This script helps set up the project for local development

echo "🚀 SmlCredit Setup Script"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create a .env file with your Neon connection string:"
echo "   cp .env.example .env"
echo "   # Edit .env and add your DATABASE_URL"
echo ""
echo "2. Run the database schema setup:"
echo "   # Copy schema.sql contents to Neon SQL editor"
echo ""
echo "3. Start local development:"
echo "   npm run dev"
echo ""
echo "4. Visit http://localhost:8888"
echo ""
echo "For more details, see DEPLOYMENT_GUIDE.md"
