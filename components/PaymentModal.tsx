import React, { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PAYMENT_AMOUNT_KES } from '../constants';
import axios from 'axios';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhone('');
      setStatus('idle');
      setErrorMessage('');
      setCheckoutRequestId(null);
    }
  }, [isOpen]);

  // Poll for payment status
  useEffect(() => {
    if (!checkoutRequestId || status !== 'processing') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/mpesa/status/${checkoutRequestId}`);
        const { status: paymentStatus, resultCode } = response.data;

        if (paymentStatus === 'completed' && resultCode === 0) {
          setStatus('success');
          clearInterval(pollInterval);

          // Store payment success in localStorage
          localStorage.setItem('roiCalculatorUnlocked', 'true');

          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        } else if (paymentStatus === 'failed') {
          setStatus('error');
          setErrorMessage(response.data.resultDesc || 'Payment failed. Please try again.');
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (status === 'processing') {
        setStatus('error');
        setErrorMessage('Payment timeout. Please try again.');
      }
    }, 120000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [checkoutRequestId, status, onSuccess, onClose]);

  const handlePay = async () => {
    if (phone.length < 9) return;

    setStatus('processing');
    setErrorMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/mpesa/stkpush`, {
        phoneNumber: phone,
        amount: PAYMENT_AMOUNT_KES,
      });

      if (response.data.success) {
        setCheckoutRequestId(response.data.checkoutRequestId);
      } else {
        setStatus('error');
        setErrorMessage('Failed to initiate payment. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setStatus('error');
      setErrorMessage(error.response?.data?.details || 'Failed to initiate payment. Please try again.');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setErrorMessage('');
    setCheckoutRequestId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={24} />
        </button>

        <div className="bg-emerald-600 p-6 text-white text-center">
          <h2 className="text-xl font-bold">Unlock Full Report</h2>
          <p className="text-emerald-100 mt-2 text-sm">
            Get detailed ROI analysis, PDF export, and sensitivity tools.
          </p>
        </div>

        <div className="p-6">
          {status === 'idle' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-600 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-slate-900">KES {PAYMENT_AMOUNT_KES}</span>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  M-PESA Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-medium">+254</span>
                  <input
                    type="tel"
                    placeholder="7XX XXX XXX"
                    className="w-full pl-16 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <button
                  onClick={handlePay}
                  disabled={phone.length < 9}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  <Smartphone size={20} />
                  Pay with M-PESA
                </button>
                <p className="text-xs text-center text-slate-500 mt-4">
                  Secured by Safaricom Daraja API
                </p>
              </div>
            </>
          )}

          {status === 'processing' && (
            <div className="text-center py-8">
              <div className="relative inline-block mb-4">
                <Loader2 className="animate-spin text-emerald-600 h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Check your phone</h3>
              <p className="text-slate-500 mt-2">
                We've sent an M-PESA prompt to <span className="font-mono text-slate-700">+254{phone}</span>. <br />Enter your PIN to complete.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">Payment Successful!</h3>
              <p className="text-slate-500 mt-2">Unlocking your report...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800">Payment Failed</h3>
              <p className="text-slate-500 mt-2">{errorMessage}</p>
              <button
                onClick={handleRetry}
                className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};