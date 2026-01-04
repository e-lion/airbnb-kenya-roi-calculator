import React from 'react';
import { Shield, Lock, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-500 hover:text-emerald-600 mb-8 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Go Back
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 px-8 py-10 sm:px-12 sm:py-12 relative overflow-hidden">
                        {/* Background accents similar to landing page */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30">
                            <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/30 rounded-full blur-[100px]" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 text-emerald-400 mb-4">
                                <Shield className="w-8 h-8" />
                                <span className="font-bold tracking-wide uppercase text-sm">Legal & Privacy</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                                Privacy Policy
                            </h1>
                            <p className="text-slate-400 text-lg max-w-2xl">
                                We value your trust. This policy outlines how we collect, protect, and use your personal data.
                            </p>
                        </div>
                    </div>

                    <div className="px-8 py-10 sm:px-12 sm:py-12 space-y-10 text-slate-700 leading-relaxed">

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-emerald-600" />
                                1. Introduction
                            </h2>
                            <p>
                                Welcome to Airbnb Kenya ROI Calculator ("we," "our," or "us"). We are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner. This policy applies to all users of our web application.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Lock className="w-6 h-6 text-emerald-600" />
                                2. Information We Collect
                            </h2>
                            <p className="mb-4">
                                We collect minimal information necessary to provide our services, specifically:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Phone Numbers:</strong> Collected solely for the purpose of processing M-PESA payments and verifying transactions. We do not use this for marketing unless explicitly verified.
                                </li>
                                <li>
                                    <strong>Email Addresses:</strong> Optional collection during the report export process to deliver your PDF ROI reports and provide relevant storage of your purchase history.
                                </li>
                                <li>
                                    <strong>Property Data:</strong> We calculate data based on the inputs you provide (e.g., location, furnishing type). This data is processed anonymously to generate your report.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                3. How We Use Your Data
                            </h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Service Delivery:</strong> To generate and unlock the full detailed bnb calulator analysis reports.</li>
                                <li><strong>Payment Verification:</strong> To confirm successful M-PESA transactions.</li>
                                <li><strong>Account Recovery:</strong> To allow you to verify previous purchases and restore access to premium features.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                4. Data Storage & Security
                            </h2>
                            <p>
                                Your data is stored securely using an industry-standard cloud infrastructure provider. We implement appropriate technical measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                5. Third-Party Services
                            </h2>
                            <p>
                                We utilize Safaricom's for payment processing. Financial data entered during the payment process is handled directly by Safaricom's secure systems; we do not store your MPESA PIN.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                6. Contact Us
                            </h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at info@kenyahustle.com
                            </p>
                        </section>

                        <div className="pt-8 border-t border-slate-100 text-sm text-slate-400">
                            Last Updated: January 2026
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
