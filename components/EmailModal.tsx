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
            <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header Graphic */}
                <div className="bg-brand-navy p-8 text-center relative overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute top-[-20%] left-[-10%] w-32 h-32 bg-brand-yellow/10 rounded-full blur-2xl" />
                    
                    <div className="mx-auto bg-white/10 w-20 h-20 rounded-[30px] flex items-center justify-center backdrop-blur-md mb-6 border border-white/20 relative z-10">
                        <Mail className="text-brand-yellow" size={36} />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight relative z-10">Report Ready</h3>
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-widest mt-3 max-w-xs mx-auto relative z-10 opacity-80">
                        Secure your market analysis
                    </p>
                </div>

                <div className="p-10">
                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-500 animate-bounce" />
                            </div>
                            <p className="text-xl font-black text-brand-navy uppercase tracking-tight">Email Saved!</p>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Generating your report...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Destination</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/30" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-brand-yellow outline-none transition-all text-brand-navy font-bold placeholder:text-slate-300"
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
                                className="w-full bg-brand-navy hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_0_#00152B] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_#00152B] active:translate-y-[3px] active:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                            >
                                {status === 'submitting' ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Download Analysis</span>
                                    </>
                                )}
                            </button>

                            <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 mt-6">
                                <Shield size={10} className="text-brand-yellow" />
                                <span>Zero-Spam Policy • Encrypted Data</span>
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
