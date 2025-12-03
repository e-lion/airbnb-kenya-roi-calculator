import express from 'express';
import cors from 'cors';
import axios from 'axios';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the server directory
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = admin.firestore();

// M-PESA Configuration
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL;
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'; // 'sandbox' or 'production'

const MPESA_BASE_URL = MPESA_ENV === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

// Get M-PESA Access Token
async function getMpesaToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  
  try {
    const response = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-PESA token:', error.response?.data || error.message);
    throw error;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: MPESA_ENV,
    timestamp: new Date().toISOString()
  });
});

// Initiate STK Push
app.post('/api/mpesa/stkpush', async (req, res) => {
  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: 'Phone number and amount are required' });
  }

  try {
    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    const stkPushData = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: 'AirbnbKenyaROI',
      TransactionDesc: 'ROI Calculator Unlock',
    };

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      stkPushData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Store transaction in Firestore
    const transactionRef = db.collection('payments').doc();
    await transactionRef.set({
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      phoneNumber: formattedPhone,
      amount: amount,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      checkoutRequestId: response.data.CheckoutRequestID,
      merchantRequestId: response.data.MerchantRequestID,
      message: response.data.CustomerMessage,
    });
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to initiate payment',
      details: error.response?.data || error.message,
    });
  }
});

// M-PESA Callback
app.post('/api/mpesa/callback', async (req, res) => {
  console.log('M-PESA Callback received:', JSON.stringify(req.body, null, 2));

  try {
    const { Body } = req.body;
    const { stkCallback } = Body;

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    // Find the transaction in Firestore
    const paymentsRef = db.collection('payments');
    const snapshot = await paymentsRef.where('checkoutRequestId', '==', checkoutRequestId).get();

    if (snapshot.empty) {
      console.log('No matching transaction found');
      return res.json({ success: true });
    }

    const doc = snapshot.docs[0];
    const updateData = {
      resultCode,
      resultDesc,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (resultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const transactionDate = callbackMetadata.find(item => item.Name === 'TransactionDate')?.Value;
      const phoneNumber = callbackMetadata.find(item => item.Name === 'PhoneNumber')?.Value;

      updateData.status = 'completed';
      updateData.mpesaReceiptNumber = mpesaReceiptNumber;
      updateData.transactionDate = transactionDate;
      updateData.phoneNumber = phoneNumber;
    } else {
      // Payment failed
      updateData.status = 'failed';
    }

    await doc.ref.update(updateData);
    console.log('Transaction updated successfully');

    res.json({ success: true });
  } catch (error) {
    console.error('Callback processing error:', error);
    res.status(500).json({ error: 'Failed to process callback' });
  }
});

// Check payment status
app.get('/api/mpesa/status/:checkoutRequestId', async (req, res) => {
  const { checkoutRequestId } = req.params;

  try {
    const paymentsRef = db.collection('payments');
    const snapshot = await paymentsRef.where('checkoutRequestId', '==', checkoutRequestId).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    res.json({
      status: data.status,
      resultCode: data.resultCode,
      resultDesc: data.resultDesc,
      mpesaReceiptNumber: data.mpesaReceiptNumber,
      amount: data.amount,
      phoneNumber: data.phoneNumber,
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

const PORT = process.env.PORT || 3001;

// Only listen if running directly (not imported)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
