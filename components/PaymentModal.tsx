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
          // We can't easily get the phone number here unless we store it from the initiate request
          // or if the status endpoint returns it. The status endpoint DOES return it.
          if (response.data.phoneNumber) {
            localStorage.setItem('userPhone', response.data.phoneNumber.toString());
          }

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

  const [receiptNumber, setReceiptNumber] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleVerify = async () => {
    if (receiptNumber.length < 5) return;

    setVerifyLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/mpesa/verify-transaction`, {
        mpesaReceiptNumber: receiptNumber.toUpperCase().trim(),
      });

      if (response.data.success) {
        setStatus('success');
        // Store payment success in localStorage
        localStorage.setItem('roiCalculatorUnlocked', 'true');
        if (response.data.phoneNumber) {
          localStorage.setItem('userPhone', response.data.phoneNumber);
        }
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setErrorMessage('Invalid receipt number or transaction not found.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setErrorMessage(error.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setErrorMessage('');
    setCheckoutRequestId(null);
  };

  return (
    <div className={`bg-white rounded-[40px] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors z-20"
        >
          <X size={20} />
        </button>
      )}

      <div className="bg-brand-navy p-10 text-white text-center relative overflow-hidden">
        {/* Abstract Data Background */}
        <div className="absolute top-[-10%] right-[-5%] p-4 opacity-5 rotate-12 pointer-events-none">
          <Activity size={150} strokeWidth={1} />
        </div>

        {/* Live Pulse Indicator */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          <div className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-yellow"></span>
          </div>
          <span className="text-[9px] uppercase tracking-widest font-black text-white/80">Live Intelligence</span>
        </div>

        <div className="mt-8 relative z-10">
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Unlock Market IQ</h2>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed opacity-80">
            Gain <span className="text-brand-yellow">Real-Time Insight</span> from verified listings
          </p>
        </div>
      </div>

      <div className="p-10 text-left">
        {status === 'idle' && (
          <>
            <div className={`transition-all duration-300 ${verifyLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="mb-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-brand-yellow/10 rounded-lg shrink-0 mt-0.5"><CheckCircle size={14} className="text-brand-navy" /></div>
                  <div className="text-xs leading-relaxed text-slate-500"><strong className="text-brand-navy font-black uppercase tracking-tight">Live Revenue Feeds:</strong> Real-time occupancy & nightly rates from comparable listings.</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-brand-yellow/10 rounded-lg shrink-0 mt-0.5"><CheckCircle size={14} className="text-brand-navy" /></div>
                  <div className="text-xs leading-relaxed text-slate-500"><strong className="text-brand-navy font-black uppercase tracking-tight">Investment Grade:</strong> Bank-ready 5-year cash flow projections.</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-brand-yellow/10 rounded-lg shrink-0 mt-0.5"><CheckCircle size={14} className="text-brand-navy" /></div>
                  <div className="text-xs leading-relaxed text-slate-500"><strong className="text-brand-navy font-black uppercase tracking-tight">Risk Analysis:</strong> Deep-dive scenarios for Buy vs. Rental Arbitrage.</div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 pt-6 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Investment</span>
                <span className="text-2xl font-black text-brand-navy tracking-tight">KES {PAYMENT_AMOUNT_KES}</span>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    M-PESA Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/30 font-black">+254</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="7XX XXX XXX"
                      className="w-full pl-16 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-yellow outline-none transition text-brand-navy font-bold placeholder:text-slate-300"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={phone.length < 9}
                  className="w-full bg-brand-yellow hover:bg-yellow-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-brand-navy font-black py-4 rounded-2xl shadow-[0_4px_0_0_#DAB02A] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#DAB02A] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                  <Smartphone size={18} />
                  Initiate Secure Pay
                </button>

                <div className="text-center pt-2">
                  <button
                    onClick={() => setStatus('verify' as any)}
                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-navy transition-colors"
                  >
                    I already paid? <span className="text-brand-navy">Restore Access</span>
                  </button>
                </div>

                <p className="text-xs text-center text-slate-500 mt-2 flex items-center justify-center gap-1">
                  <CheckCircle size={10} className="text-emerald-600" />
                  Secure Payment processed instantly
                </p>
              </div>
            </div>
          </>
        )}

        {/* VERIFY MODE */}
        {(status as any) === 'verify' && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Restore Purchase</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Enter your M-Pesa transaction code</p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 border border-red-100">
                <AlertCircle size={14} />
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Receipt Number
              </label>
              <input
                type="text"
                placeholder="e.g. QKB23..."
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-yellow outline-none transition text-brand-navy font-bold uppercase placeholder:text-slate-300"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={receiptNumber.length < 5 || verifyLoading}
              className="w-full bg-brand-navy hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-[0_4px_0_0_#00152B] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#00152B] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {verifyLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
              {verifyLoading ? 'Verifying...' : 'Restore Access'}
            </button>

            <button
              onClick={() => {
                setStatus('idle');
                setErrorMessage('');
              }}
              className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 hover:text-brand-navy transition-colors"
            >
              Cancel, go back
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-brand-yellow/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="animate-spin text-brand-navy h-16 w-16 relative z-10" />
            </div>
            <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Check your phone</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4 leading-relaxed">
              We've sent a prompt to <span className="text-brand-navy">+254{phone}</span> <br />Enter your M-Pesa PIN to unlock.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Access Granted!</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Unlocking your analysis report...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-brand-navy uppercase tracking-tight">Payment Issue</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 max-w-[200px] mx-auto leading-relaxed">{errorMessage}</p>
            <button
              onClick={handleRetry}
              className="mt-8 bg-brand-navy hover:bg-slate-800 text-white font-black px-8 py-3 rounded-2xl shadow-[0_4px_0_0_#00152B] transition-all uppercase tracking-widest text-[10px]"
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