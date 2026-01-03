import React, { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle, AlertCircle, Loader2, Activity } from 'lucide-react';
import { PAYMENT_AMOUNT_KES } from '../constants';
import axios from 'axios';
import ReactDOM from 'react-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

interface PaymentCardProps {
  onSuccess: () => void;
  className?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ onSuccess, className = "", showCloseButton = false, onClose }) => {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

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
  }, [checkoutRequestId, status, onSuccess]);

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

  return (
    <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-20"
        >
          <X size={24} />
        </button>
      )}

      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-6 text-white text-center relative overflow-hidden">
        {/* Abstract Data Background */}
        <div className="absolute top-[-10%] right-[-5%] p-4 opacity-5 rotate-12 pointer-events-none">
          <Activity size={150} strokeWidth={1} />
        </div>

        {/* Live Pulse Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-400/30">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-100">Live Data Feed</span>
        </div>

        <div className="mt-6 relative z-10">
          <h2 className="text-2xl font-bold mb-2">Unlock Market Intelligence</h2>
          <p className="text-emerald-100 text-sm max-w-xs mx-auto leading-relaxed">
            We aggregate <span className="font-semibold text-white border-b border-emerald-400/50 pb-0.5">real-time signals</span> from trusted kenyan market data sources.
          </p>
        </div>
      </div>

      <div className="p-6 text-left">
        {status === 'idle' && (
          <>
            <div className="mb-6 space-y-3">
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <div className="p-1 bg-emerald-100 rounded-full mt-0.5"><CheckCircle size={12} className="text-emerald-600" /></div>
                <span><strong className="text-slate-800">Live Revenue Feeds:</strong> Real-time occupancy & nightly rates from comparable listings.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <div className="p-1 bg-emerald-100 rounded-full mt-0.5"><CheckCircle size={12} className="text-emerald-600" /></div>
                <span><strong className="text-slate-800">Investment Grade Data:</strong> Bank-ready 5-year cash flow models.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <div className="p-1 bg-emerald-100 rounded-full mt-0.5"><CheckCircle size={12} className="text-emerald-600" /></div>
                <span><strong className="text-slate-800">Smart Benchmarking:</strong> Compare your potential ROI against top performers in the area.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <div className="p-1 bg-emerald-100 rounded-full mt-0.5"><CheckCircle size={12} className="text-emerald-600" /></div>
                <span><strong className="text-slate-800">Risk Analysis:</strong> Buy vs. Rent-to-Rent deep-dive scenarios.</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-100">
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
                  inputMode="numeric"
                  pattern="[0-9]*"
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
              <p className="text-xs text-center text-slate-500 mt-4 flex items-center justify-center gap-1">
                <CheckCircle size={10} className="text-emerald-600" />
                Secure Payment processed instantly
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
  );
};

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center h-screen w-screen overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal - Wrapper with dimensions */}
      <div className="mx-4 w-full max-w-md">
        <PaymentCard
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          showCloseButton={true}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
};