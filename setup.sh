#!/bin/bash

echo "🚀 Setting up Airbnb Kenya ROI Calculator..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env - Please update with your Firebase credentials"
else
    echo "⚠️  .env already exists, skipping..."
fi

# Check if server/.env exists
if [ ! -f server/.env ]; then
    echo "📝 Creating server/.env file from template..."
    cp server/.env.example server/.env
    echo "✅ Created server/.env - Please update with your M-PESA and Firebase credentials"
else
    echo "⚠️  server/.env already exists, skipping..."
fi

echo ""
echo "📋 Next steps:"
echo "1. Update .env with your Firebase configuration"
echo "2. Update server/.env with your M-PESA and Firebase Admin credentials"
echo "3. Run 'npm install' to install dependencies"
echo "4. Start ngrok: 'ngrok http 3001'"
echo "5. Update MPESA_CALLBACK_URL in server/.env with your ngrok URL"
echo "6. Run 'npm run dev:all' to start both frontend and backend"
echo ""
echo "📖 See README.md for detailed setup instructions"
