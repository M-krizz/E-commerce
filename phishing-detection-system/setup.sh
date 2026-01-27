#!/bin/bash

echo "🚀 Phishing Detection System - Backend Setup"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: You need to edit .env.local with your Supabase credentials!"
    echo "   1. Create a Supabase project at https://supabase.com"
    echo "   2. Get your project URL and API keys"
    echo "   3. Update .env.local with these values"
    echo ""
    read -p "Press Enter when you've updated .env.local..."
fi

# Generate JWT secret if needed
if grep -q "your-jwt-secret-key" .env.local; then
    echo "🔐 Generating JWT secret..."
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Replace JWT_SECRET in .env.local
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.local
    else
        # Linux
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.local
    fi
    
    echo "✅ JWT secret generated and saved to .env.local"
fi

echo ""
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure you've updated .env.local with your Supabase credentials"
echo "   2. Run the SQL in supabase-schema.sql in your Supabase SQL Editor"
echo "   3. Run 'npm run dev' to start the development server"
echo "   4. Visit http://localhost:3000"
echo ""
echo "📖 For detailed setup instructions, see BACKEND_SETUP.md"
echo ""
