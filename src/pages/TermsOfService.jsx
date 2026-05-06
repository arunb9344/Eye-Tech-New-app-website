import React from 'react';
import { Scale, FileCheck, AlertCircle, ChevronLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="glass-panel p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-500/20 rounded-2xl">
              <Scale className="text-purple-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black mb-1">Terms of Service</h1>
              <p className="text-gray-400 text-sm italic">Effective Date: May 06, 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Info size={20} className="text-purple-400" /> 1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using the Eye Tech Securities portal, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileCheck size={20} className="text-purple-400" /> 2. Services Description
              </h2>
              <p>
                Eye Tech Securities provides security system installation, maintenance (AMC), and repair services. 
                All service bookings are subject to availability and confirmation by our administrative team.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-purple-400" /> 3. User Obligations
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Users must provide accurate and complete information when booking services or purchasing AMC packages.</li>
                <li>Users are responsible for maintaining the confidentiality of their account credentials.</li>
                <li>Users agree to provide access to their premises for scheduled service and installation visits.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Payments and Invoicing</h2>
              <p>
                Payments for services and AMC packages are due as specified at the time of purchase or booking completion. 
                Invoices are generated electronically and can be downloaded from the portal. 
                All prices are subject to applicable taxes (GST).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Annual Maintenance Contracts (AMC)</h2>
              <p>
                AMC packages are valid for the period specified in the package description. 
                "Breakdown Visits" and "Maintenance Visits" are trackable through the portal. 
                AMC coverage is specific to the registered address and equipment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. Limitation of Liability</h2>
              <p>
                Eye Tech Securities shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services. 
                Our liability for any direct damages shall be limited to the amount paid by you for the specific service in question.
              </p>
            </section>

            <section className="pt-8 border-t border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Governing Law</h2>
              <p>These terms shall be governed by and construed in accordance with the laws of India.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
