import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ShieldCheck, Wrench, Hammer, MapPin, Phone, Mail, ChevronRight, Star, CheckCircle, Users, Activity, Lock } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Top Bar */}
      <div className="bg-[#0f172a] text-white py-2 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-medium tracking-wide">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Phone size={14} className="text-blue-400" /> +91 98765 43210</span>
            <span className="flex items-center gap-2"><Mail size={14} className="text-blue-400" /> contact@eyetechsecurities.in</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-400" /> Bangalore, India</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <nav className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <img src="/logo.png" alt="Eye Tech Logo" className="h-12 w-12 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black text-slate-900 tracking-tight">EYE TECH</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em]">Securities</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#services" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">Services</a>
            <a href="#about" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">Why Us</a>
            <Link to="/contact" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider">Support</Link>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all text-sm uppercase tracking-wider"
            >
              Client Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-slate-50 overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Shield size={14} /> Certified Security Solutions
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.1]">
              Advanced <span className="text-blue-600">Protection</span> for Your Assets.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Eye Tech Securities provides end-to-end security system installations, professional maintenance, and AI-driven monitoring for high-value properties.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-black py-4 px-10 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl">
                Get Started Now <ChevronRight size={20} />
              </button>
              <Link to="/contact" className="w-full sm:w-auto text-slate-900 font-bold py-4 px-10 border-2 border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-center">
                Request a Quote
              </Link>
            </div>
            
            <div className="mt-12 pt-12 border-t border-slate-200 flex flex-wrap justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-2 font-bold text-slate-500"><Lock size={18} /> Hikvision</div>
              <div className="flex items-center gap-2 font-bold text-slate-500"><ShieldCheck size={18} /> Dahua</div>
              <div className="flex items-center gap-2 font-bold text-slate-500"><Activity size={18} /> CP Plus</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-10 bg-blue-500/10 blur-[100px] rounded-full"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="/security_hero_banner_1778038799605.png" 
                alt="Security Technology" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center gap-4">
                <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                <div className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Monitoring 24/7</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Our Expertise</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Comprehensive Security Integration Services</h3>
            </div>
            <p className="text-slate-500 max-w-sm mb-1">We don't just install cameras; we build intelligent security ecosystems that protect what matters most.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="group p-10 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl transition-all duration-500">
              <div className="mb-8 p-5 bg-blue-100 text-blue-600 rounded-2xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Hammer size={32} />
              </div>
              <h4 className="text-2xl font-black mb-4">CCTV & Surveillance</h4>
              <p className="text-slate-600 mb-8 leading-relaxed">High-definition IP and analog surveillance systems with mobile integration and cloud storage solutions.</p>
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-2 text-sm font-bold text-slate-500"><CheckCircle size={16} className="text-blue-500" /> AI Motion Detection</li>
                <li className="flex items-center gap-2 text-sm font-bold text-slate-500"><CheckCircle size={16} className="text-blue-500" /> Night Vision Integration</li>
                <li className="flex items-center gap-2 text-sm font-bold text-slate-500"><CheckCircle size={16} className="text-blue-500" /> 24/7 Mobile Access</li>
              </ul>
            </div>

            <div className="group p-10 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl transition-all duration-500">
              <div className="mb-8 p-5 bg-blue-100 text-blue-600 rounded-2xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Wrench size={32} />
              </div>
              <h4 className="text-2xl font-black mb-4">Annual Maintenance</h4>
              <p className="text-slate-600 mb-8 leading-relaxed">Systematic AMC plans including regular health checks, breakdown visits, and replacement coverage.</p>
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-2 text-sm font-bold text-slate-500"><CheckCircle size={16} className="text-blue-500" /> Preventive Maintenance</li>
                <li className="flex items-center gap-2 text-sm font-bold text-slate-500"><CheckCircle size={16} className="text-blue-500" /> On-Site Technical Visits</li>
                <li className="flex items-center gap-2 text-sm font-bold text-slate-500"><CheckCircle size={16} className="text-blue-500" /> Priority Support Line</li>
              </ul>
            </div>

            <div className="group p-10 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl transition-all duration-500">
              <div className="mb-8 p-5 bg-blue-100 text-blue-600 rounded-2xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Users size={32} />
              </div>
              <h4 className="text-2xl font-black mb-4">Access Control</h4>
              <p className="text-slate-600 mb-8 leading-relaxed">Manage entry points with biometric, RFID, and face-recognition technology for offices and campuses.</p>
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-2 text-sm font-bold text-slate-500"><CheckCircle size={16} className="text-blue-500" /> Biometric Authentication</li>
                <li className="flex items-center gap-2 text-sm font-bold text-slate-500"><CheckCircle size={16} className="text-blue-500" /> Time & Attendance</li>
                <li className="flex items-center gap-2 text-sm font-bold text-slate-500"><CheckCircle size={16} className="text-blue-500" /> Smart Door Integration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-blue-600/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Ready to upgrade your security infrastructure?</h2>
            <p className="text-blue-100 text-lg mb-12 opacity-90">Join 500+ satisfied clients who trust Eye Tech Securities for their daily protection and peace of mind.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto bg-white text-blue-600 font-black py-4 px-12 rounded-2xl hover:scale-105 transition-transform shadow-xl">
                Enter Client Portal
              </button>
              <Link to="/contact" className="w-full sm:w-auto text-white font-black py-4 px-12 border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <img src="/logo.png" alt="Logo" className="h-10 w-10 brightness-200" />
                <span className="text-xl font-black tracking-tight">EYE TECH</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Leading the way in intelligent security solutions. We combine advanced hardware with professional maintenance for ultimate protection.
              </p>
              <div className="flex gap-4">
                <div className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"><Phone size={18} /></div>
                <div className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"><Mail size={18} /></div>
                <div className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"><MapPin size={18} /></div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Services</h5>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">CCTV Installation</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Biometric Access</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">AMC Maintenance</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Security Audit</li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Company</h5>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">About Eye Tech</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Our Projects</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Support Center</li>
                <li><Link to="/contact" className="hover:text-blue-400 no-underline transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Legal & Privacy</h5>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li><Link to="/privacy" className="hover:text-blue-400 no-underline transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-400 no-underline transition-colors">Terms of Service</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 no-underline transition-colors">Admin Login</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} Eye Tech Securities. All rights reserved.</p>
            <div className="flex gap-8">
              <span>ISO 9001:2015 Certified</span>
              <span>Made with Excellence</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
