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

import { db } from './firebase.js';

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
  try {
    console.log('----------- M-PESA CALLBACK RECEIVED -----------');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      console.error('Invalid callback structure:', req.body);
      return res.status(400).json({ error: 'Invalid callback structure' });
    }

    const { stkCallback } = Body;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    console.log(`Processing CheckoutRequestID: ${checkoutRequestId}, ResultCode: ${resultCode}`);

    // Find the transaction in Firestore
    const paymentsRef = db.collection('payments');
    const snapshot = await paymentsRef.where('checkoutRequestId', '==', checkoutRequestId).get();

    if (snapshot.empty) {
      console.warn(`No matching transaction found for CheckoutRequestID: ${checkoutRequestId}`);
      // Respond with success anyway to stop Safaricom from retrying
      return res.json({ result: 'success', message: 'Transaction not found but received' });
    }

    const doc = snapshot.docs[0];
    const updateData = {
      resultCode,
      resultDesc,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (resultCode === 0) {
      console.log('Payment Successful! Updating record...');
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
      console.log('Payment Failed/Cancelled. Updating record...');
      // Payment failed
      updateData.status = 'failed';
    }

    await doc.ref.update(updateData);
    console.log('Transaction updated successfully in Firestore');

    res.json({ result: 'success' });
  } catch (error) {
    console.error('CRITICAL CALLBACK ERROR:', error);
    // Respond with 500 so Safaricom knows something went wrong (or 200 to stop retries if it's a logic error)
    res.status(500).json({ error: 'Internal Server Error' });
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

// Scraper Endpoint
import { scrapeBuyRentKenya } from './services/scraperService.js';

app.post('/api/admin/scrape', async (req, res) => {
  try {
    const { type, location, maxPages } = req.body;
    console.log('Triggering scrape:', { type, location, maxPages });
    const result = await scrapeBuyRentKenya(type, location, maxPages);
    res.json(result);
  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  }
});

// Simple in-memory cache
const marketDataCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Market Data Endpoint
app.get('/api/market-data', async (req, res) => {
  try {
    const { type, location, bedrooms } = req.query;
    
    if (!type || !location) {
      return res.status(400).json({ error: 'Missing type or location query parameters' });
    }

    console.log(`Fetching market data for ${location} (${type}) - Beds: ${bedrooms || 'Any'}`);

    // Check Cache
    const cacheKey = `${type}-${location}-${bedrooms || 'any'}`;
    const cachedEntry = marketDataCache[cacheKey];

    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_DURATION)) {
        console.log('Serving from cache');
        return res.json(cachedEntry.data);
    }

    const listingsRef = db.collection('market_listings');
    let query = listingsRef
      .where('type', '==', type)
      .where('locationQuery', '==', location.toLowerCase());

    if (bedrooms !== undefined && bedrooms !== null && bedrooms !== '') {
        query = query.where('bedrooms', '==', parseInt(bedrooms));
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.json({ 
        averagePrice: 0, 
        minPrice: 0, 
        maxPrice: 0, 
        sampleSize: 0
      });
    }

    let total = 0;
    let min = Infinity;
    let max = -Infinity;
    let count = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.price) {
        total += data.price;
        if (data.price < min) min = data.price;
        if (data.price > max) max = data.price;
        count++;
      }
    });

    const averagePrice = count > 0 ? Math.round(total / count) : 0;
    
    const result = {
      averagePrice,
      minPrice: count > 0 ? min : 0,
      maxPrice: count > 0 ? max : 0,
      sampleSize: count,
      location,
      type
    };

    // Save to Cache
    marketDataCache[cacheKey] = {
        timestamp: Date.now(),
        data: result
    };
    
    res.json(result);
    
  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Only listen if running directly (not imported)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
