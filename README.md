# Airbnb Kenya ROI Calculator

A comprehensive ROI calculator for Airbnb properties in Kenya with M-PESA payment integration.

## Features

- Calculate ROI for properties in Nairobi, Mombasa, and Kisumu
- Compare Buy vs. Rent-to-Rent (Arbitrage) models
- Furnishing cost estimates (Budget, Mid-Range, Premium)
- M-PESA STK Push payment integration
- Firebase/Firestore for transaction storage
- Unlock premium features with payment

## Prerequisites

- Node.js (v16 or higher)
- Firebase project
- M-PESA Daraja API credentials (Sandbox or Production)
- ngrok or similar tool for local M-PESA callback testing

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Create a web app and get your Firebase config
4. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

### 3. M-PESA Daraja API Setup

1. Register at [Daraja Portal](https://developer.safaricom.co.ke/)
2. Create an app to get Consumer Key and Consumer Secret
3. For sandbox testing, use shortcode: `174379`
4. Get your Lipa Na M-PESA Online Passkey from the portal

### 4. Environment Variables

#### Frontend (.env)

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:3001
```

#### Backend (server/.env)

Create a `server/.env` file:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"

MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback

PORT=3001
```

### 5. Setup M-PESA Callback URL (Local Development)

For local testing, you need a public URL for M-PESA callbacks:

```bash
# Install ngrok
brew install ngrok

# Start ngrok on port 3001
ngrok http 3001
```

Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`) and update `MPESA_CALLBACK_URL` in `server/.env`:

```env
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
```

### 6. Firestore Security Rules

Set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /payments/{paymentId} {
      allow read, write: if true; // Adjust based on your security needs
    }
  }
}
```

## Running the Application

### Development Mode (Both Frontend & Backend)

```bash
npm run dev:all
```

This runs both the Vite dev server (port 5173) and the Express backend (port 3001).

### Run Separately

**Frontend only:**
```bash
npm run dev
```

**Backend only:**
```bash
npm run server
```

## Testing M-PESA Payment

1. Start the application with `npm run dev:all`
2. Ensure ngrok is running and the callback URL is updated
3. Click "Unlock Full Report" in the app
4. Enter a Safaricom phone number (for sandbox, use test numbers)
5. You'll receive an STK Push prompt on your phone
6. Enter your M-PESA PIN
7. The app will poll for payment status and unlock when successful

### Sandbox Test Numbers

For M-PESA sandbox testing, use:
- Phone: `254708374149` (or other test numbers from Daraja)
- PIN: `1234` (sandbox default)

## Project Structure

```
kenyanhustle/
├── components/          # React components
│   ├── PaymentModal.tsx # M-PESA payment modal
│   ├── CalculatorStepper.tsx
│   └── ResultsDashboard.tsx
├── services/           # Business logic
│   └── calculatorService.ts
├── server/             # Express backend
│   ├── index.js        # M-PESA integration & Firebase
│   └── .env.example
├── firebase.config.ts  # Firebase client config
├── App.tsx            # Main app component
└── package.json
```

## API Endpoints

### POST /api/mpesa/stkpush
Initiates M-PESA STK Push payment

**Request:**
```json
{
  "phoneNumber": "254712345678",
  "amount": 99
}
```

**Response:**
```json
{
  "success": true,
  "checkoutRequestId": "ws_CO_...",
  "merchantRequestId": "...",
  "message": "Success. Request accepted for processing"
}
```

### GET /api/mpesa/status/:checkoutRequestId
Check payment status

**Response:**
```json
{
  "status": "completed",
  "resultCode": 0,
  "mpesaReceiptNumber": "ABC123",
  "amount": 99,
  "phoneNumber": "254712345678"
}
```

### POST /api/mpesa/callback
M-PESA callback endpoint (called by Safaricom)

## Troubleshooting

### "Invalid Access Token" Error
- Verify your Consumer Key and Secret are correct
- Check if you're using the right environment (sandbox vs production)

### "Bad Request - Invalid CallBackURL"
- Ensure ngrok is running
- Verify the callback URL in `.env` matches your ngrok URL
- URL must be HTTPS

### Payment Not Completing
- Check server logs for callback data
- Verify Firestore rules allow writes
- Ensure polling is working in the frontend

## Production Deployment

1. Deploy backend to a service with a public HTTPS URL (e.g., Railway, Render, Heroku)
2. Update `MPESA_CALLBACK_URL` to your production backend URL
3. Switch `MPESA_ENV` to `production` and use production credentials
4. Deploy frontend to Vercel/Netlify and update `VITE_API_BASE_URL`
5. Update CORS settings in the backend for your production domain

## License

MIT
