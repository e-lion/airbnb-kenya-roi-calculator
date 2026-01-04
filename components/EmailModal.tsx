import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle, X, Shield } from 'lucide-react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import { API_BASE_URL } from '../constants'; // Ensure this matches where you define it, or lift to prop/context if needed

const ENV_API_URL = import.meta.env.VITE_API_BASE_URL || '';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userPhone?: string | null;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSuccess, userPhone }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) return;

        setStatus('submitting');
        setErrorMsg('');

        try {
            // If we have a phone number, save the email to the backend
            if (userPhone) {
                await axios.post(`${ENV_API_URL}/api/save-email`, {
                    phoneNumber: userPhone,
                    email: email
                });
            }

            // Success sequence
            setStatus('success');
            localStorage.setItem('userEmail', email); // Persist locally so we don't ask again

            setTimeout(() => {
                onSuccess(); // Trigger export
                onClose();   // Close modal
            }, 1000);

        } catch (error) {
            console.error("Failed to save email", error);
            // Even if backend fails, we should probably let them export? 
            // User requested "Save that infomation in the firestore against the paid user number"
            // If it fails, maybe we just let them proceed but warn?
            // For now, let's treat it as a soft failure: save locally and proceed after short delay or retry.
            // Let's force retry for valid data collection, but allow skip if persistent error?
            // Decided: Show error but maybe allow a "Skip" if it keeps failing? 
            // For simplicity in V1: Show error.
            setStatus('error');
            setErrorMsg('Could not save email. Please try again.');
        }
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Card */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header Graphic */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-center">
                    <div className="mx-auto bg-white/10 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md mb-4 border border-white/20">
                        <Mail className="text-emerald-400" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Your Report is Ready</h3>
                    <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                        Enter your email to receive your comprehensive PDF report and market updates.
                    </p>
                </div>

                <div className="p-8">
                    {status === 'success' ? (
                        <div className="text-center py-6">
                            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
                            <p className="text-lg font-semibold text-slate-800">Email Saved!</p>
                            <p className="text-slate-500 text-sm">Downloading report...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {status === 'error' && (
                                <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{errorMsg}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                            >
                                {status === 'submitting' ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Download Report</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1.5 mt-4">
                                <Shield size={10} />
                                <span>We respect your privacy. No spam, ever.</span>
                            </p>
                        </form>
                    )}
                </div>

                {/* Close button (optional, if they want to cancel export) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>,
        document.body
    );
};
