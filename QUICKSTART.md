# Quick Start Guide

## For Testing (Without Real M-PESA)

If you just want to test the calculator without setting up M-PESA:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the frontend only:**
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

**Note:** The payment modal will show but won't actually process payments without the backend configured.

---

## For Full M-PESA Integration

### Step 1: Firebase Setup (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database:
   - Click "Firestore Database" → "Create Database"
   - Start in test mode
4. Get your web app config:
   - Click the gear icon → Project Settings
   - Scroll to "Your apps" → Click the web icon (</>)
   - Register your app and copy the config
5. Generate service account:
   - Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file

### Step 2: M-PESA Daraja Setup (10 minutes)

1. Go to [Daraja Portal](https://developer.safaricom.co.ke/)
2. Sign up/Login
3. Create a new app:
   - Click "My Apps" → "Create New App"
   - Select "Lipa Na M-PESA Online"
   - Note your Consumer Key and Consumer Secret
4. Get your passkey:
   - Go to your app details
   - Find "Lipa Na M-PESA Online Passkey"
   - Copy it (for sandbox, it's usually provided)

### Step 3: Configure Environment Variables

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

2. **Edit `.env` with your Firebase config:**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_API_BASE_URL=http://localhost:3001
   ```

3. **Edit `server/.env` with your credentials:**
   ```env
   # From Firebase service account JSON
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"

   # From Daraja Portal
   MPESA_ENV=sandbox
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_PASSKEY=your_passkey
   MPESA_SHORTCODE=174379
   
   # Will update this in next step
   MPESA_CALLBACK_URL=https://temp.ngrok.io/api/mpesa/callback
   
   PORT=3001
   ```

### Step 4: Setup ngrok for Callbacks

1. **Install ngrok:**
   ```bash
   brew install ngrok
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 3001
   ```

3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Update `server/.env`:**
   ```env
   MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback
   ```

### Step 5: Run the Application

1. **Start both frontend and backend:**
   ```bash
   npm run dev:all
   ```

2. **Verify the server is running:**
   - Open http://localhost:3001/api/health
   - You should see: `{"status":"ok","message":"Server is running"}`

3. **Open the app:**
   - Navigate to http://localhost:5173
   - Use the calculator
   - Click "Unlock Full Report"
   - Enter your M-PESA number (for sandbox: 254708374149)
   - Complete the payment

---

## Testing with Sandbox

For M-PESA sandbox testing:
- **Phone:** 254708374149 (or other test numbers from Daraja)
- **PIN:** 1234
- **Amount:** Any amount (e.g., 99 KES)

---

## Troubleshooting

### Server won't start
- Check that all environment variables in `server/.env` are set
- Verify Firebase credentials are correct
- Check the console for error messages

### "Invalid Access Token"
- Verify MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET
- Make sure you're using sandbox credentials for sandbox environment

### "Invalid CallBackURL"
- Ensure ngrok is running
- Verify the URL in server/.env matches your ngrok URL
- URL must be HTTPS

### Payment not completing
- Check server logs for callback data
- Verify ngrok is still running
- Check Firestore for the payment document

---

## Production Checklist

Before deploying to production:

- [ ] Deploy backend to a service with HTTPS (Railway, Render, Heroku)
- [ ] Update `MPESA_ENV` to `production`
- [ ] Use production M-PESA credentials
- [ ] Update `MPESA_CALLBACK_URL` to production backend URL
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Update `VITE_API_BASE_URL` to production backend URL
- [ ] Update CORS settings in backend for production domain
- [ ] Set proper Firestore security rules
- [ ] Test end-to-end payment flow

---

## Support

For issues or questions:
- Check the main [README.md](README.md) for detailed documentation
- Review M-PESA Daraja API docs: https://developer.safaricom.co.ke/docs
- Check Firebase docs: https://firebase.google.com/docs
