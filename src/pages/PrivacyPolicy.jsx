import React from 'react';
import { Shield, Lock, Eye, FileText, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="glass-panel p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <Shield className="text-blue-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black mb-1">Privacy Policy</h1>
              <p className="text-gray-400 text-sm italic">Last Updated: May 06, 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Eye size={20} className="text-blue-400" /> Introduction
              </h2>
              <p>
                At Eye Tech Securities, we respect your privacy and are committed to protecting it through our compliance with this policy. 
                This policy describes the types of information we may collect from you or that you may provide when you visit the Eye Tech Securities website or use our mobile application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock size={20} className="text-blue-400" /> Information We Collect
              </h2>
              <p className="mb-4">We collect several types of information from and about users of our App, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Information:</strong> Name, postal address, e-mail address, and telephone number.</li>
                <li><strong>Service Details:</strong> Information about your security systems, installation addresses, and service history.</li>
                <li><strong>Usage Data:</strong> Details of your visits to our App, including traffic data, location data, and logs.</li>
                <li><strong>Account Credentials:</strong> If you use Google Sign-In or other authentication methods, we collect basic profile info as permitted by those providers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-400" /> How We Use Your Information
              </h2>
              <p className="mb-4">We use information that we collect about you or that you provide to us:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our services, including booking installations and services.</li>
                <li>To notify you about changes to our services or your booking status.</li>
                <li>To process AMC (Annual Maintenance Contract) requests and generate invoices.</li>
                <li>To provide customer support and respond to your inquiries.</li>
                <li>To improve our App and provide a more personalized experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Data Security</h2>
              <p>
                We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. 
                All information you provide to us is stored on our secure servers behind firewalls (via Firebase).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">Sharing of Information</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to outside parties. 
                This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
              </p>
            </section>

            <section className="pt-8 border-t border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
              <p>To ask questions or comment about this privacy policy and our privacy practices, contact us at:</p>
              <p className="mt-2 font-bold text-blue-400">support@eyetechsecurities.in</p>
            </section>Section
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
