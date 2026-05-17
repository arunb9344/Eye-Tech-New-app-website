import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you'd send this to Firebase or an email service
    alert("Thank you for contacting us! We will get back to you shortly.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-transparent text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <h1 className="text-4xl font-black mb-4">Get in Touch</h1>
            <p className="text-gray-400 mb-8">Have questions about our security systems or need support? Our team is here to help.</p>

            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Phone className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Call Us</p>
                  <p className="text-lg font-bold">+91 99628 35944</p>
                  <p className="text-sm text-gray-500">Mon-Sat, 9am-7pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Mail className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Email Us</p>
                  <p className="text-lg font-bold">support@eyetechsecurities.in</p>
                  <p className="text-sm text-gray-500">We reply within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <MapPin className="text-green-400" size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Visit Us</p>
                  <p className="text-lg font-bold">Eye Tech Securities</p>
                  <p className="text-sm text-gray-500">Door No:01, Shop No:02 Ground Floor, 15th St,<br />Nehru Colony, Nanganallur, Chennai – 600061</p>
                  <p className="text-xs text-gray-600 mt-1">DIGIPIN: 4T3-22P-3KK2</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Clock className="text-yellow-400" size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Support Hours</p>
                  <p className="text-lg font-bold">24/7 Technical Support</p>
                  <p className="text-sm text-gray-500">For existing AMC customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass-panel p-8 sm:p-10 h-full">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MessageSquare className="text-blue-400" /> Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase">Subject</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="How can we help?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase">Message</label>
                  <textarea 
                    required 
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Describe your requirement or issue..."
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full py-4 flex items-center justify-center gap-2 font-bold text-lg"
                >
                  <Send size={20} /> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
