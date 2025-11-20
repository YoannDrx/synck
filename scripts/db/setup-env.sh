#!/bin/bash
# Setup environment files with Neon branch connection strings
# Usage: ./scripts/db/setup-env.sh

echo "🔧 Setting up environment files for dev and prod..."
echo ""

# Check if neonctl is installed
if ! command -v neonctl &> /dev/null; then
    echo "❌ neonctl is not installed"
    echo "   Install it with: npm install -g neonctl"
    echo "   Then authenticate: neonctl auth"
    exit 1
fi

# Get dev branch connection strings
echo "📡 Fetching dev branch connection strings..."
DEV_POOLED=$(neonctl connection-string dev --pooled 2>/dev/null)
DEV_DIRECT=$(neonctl connection-string dev --direct 2>/dev/null)

if [ -z "$DEV_POOLED" ] || [ -z "$DEV_DIRECT" ]; then
    echo "⚠️  Could not fetch dev branch URLs"
    echo "   Make sure the 'dev' branch exists in Neon"
    echo "   You can create it with: neonctl branches create --name dev"
    echo ""
else
    # Update .env.development
    sed -i '' "s|DATABASE_URL=\".*\"|DATABASE_URL=\"$DEV_POOLED\"|" .env.development
    sed -i '' "s|DIRECT_URL=\".*\"|DIRECT_URL=\"$DEV_DIRECT\"|" .env.development
    echo "✅ Updated .env.development with dev branch URLs"
fi

# Get main/prod branch connection strings
echo "📡 Fetching main branch connection strings..."
PROD_POOLED=$(neonctl connection-string main --pooled 2>/dev/null)
PROD_DIRECT=$(neonctl connection-string main --direct 2>/dev/null)

if [ -z "$PROD_POOLED" ] || [ -z "$PROD_DIRECT" ]; then
    echo "⚠️  Could not fetch main branch URLs"
    echo "   Trying 'prod' branch..."
    PROD_POOLED=$(neonctl connection-string prod --pooled 2>/dev/null)
    PROD_DIRECT=$(neonctl connection-string prod --direct 2>/dev/null)
fi

if [ -z "$PROD_POOLED" ] || [ -z "$PROD_DIRECT" ]; then
    echo "⚠️  Could not fetch main/prod branch URLs"
    echo "   Make sure the 'main' or 'prod' branch exists in Neon"
    echo ""
else
    # Update .env.production
    sed -i '' "s|DATABASE_URL=\".*\"|DATABASE_URL=\"$PROD_POOLED\"|" .env.production
    sed -i '' "s|DIRECT_URL=\".*\"|DIRECT_URL=\"$PROD_DIRECT\"|" .env.production
    echo "✅ Updated .env.production with main branch URLs"
fi

echo ""
echo "📝 Don't forget to add your other environment variables:"
echo "   - RESEND_API_KEY"
echo "   - BLOB_READ_WRITE_TOKEN"
echo ""
echo "✅ Setup complete!"
