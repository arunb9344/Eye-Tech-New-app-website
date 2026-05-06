import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ShieldCheck, Wrench, Hammer, MapPin, Phone, Mail, ChevronRight, Star, Clock, Zap } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: 'Expert Installation',
      description: 'Professional setup of CCTV, Biometrics, and advanced security systems for homes and businesses.',
      icon: <Hammer className="text-blue-400" size={32} />,
      color: 'blue'
    },
    {
      title: 'Smart Maintenance',
      description: 'Comprehensive AMC packages with trackable visits to keep your security running 24/7.',
      icon: <Wrench className="text-secondary" size={32} />,
      color: 'cyan'
    },
    {
      title: 'System Health Check',
      description: 'Regular diagnostics and troubleshooting to prevent security gaps before they happen.',
      icon: <ShieldCheck className="text-green-400" size={32} />,
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel !rounded-none border-t-0 border-x-0 bg-opacity-70 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-white/20 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black tracking-tight">EYE TECH SECURITIES</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-gray-400">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-primary !py-2 !px-6 text-sm"
          >
            Access Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
            <Shield size={14} /> Next-Gen Security Solutions
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in">
            Securing Your Vision, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Protecting Your World.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in">
            Premium security system installation and automated maintenance services. From smart CCTV to biometric access, we provide the tech that keeps you safe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <button onClick={() => navigate('/login')} className="btn btn-primary py-4 px-10 text-lg w-full sm:w-auto">
              Get Started <ChevronRight size={20} />
            </button>
            <Link to="/contact" className="btn btn-outline py-4 px-10 text-lg w-full sm:w-auto">
              Request Callback
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Our Core Solutions</h2>
            <p className="text-gray-400">Industry leading security services tailored for your specific needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="glass-panel p-8 group hover:border-blue-500/50 transition-all">
                <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-400 mb-6">{service.description}</p>
                <div className="text-sm font-bold text-blue-400 flex items-center gap-2 cursor-pointer">
                  Learn More <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="glass-panel p-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-white mb-2">500+</div>
              <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Installations</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">99%</div>
              <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Client Success</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">24/7</div>
              <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Support</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">15+</div>
              <div className="text-gray-500 text-xs font-bold uppercase tracking-widest">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black mb-8">Why Choose Eye Tech Securities?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-2 bg-blue-500/20 rounded-lg h-fit"><Clock className="text-blue-400" size={24} /></div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Fast Response Time</h4>
                  <p className="text-gray-400">Our technicians are available across the city to resolve issues within 24 hours.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-2 bg-purple-500/20 rounded-lg h-fit"><Zap className="text-purple-400" size={24} /></div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Advanced Technology</h4>
                  <p className="text-gray-400">We only use the latest AI-powered cameras and cloud-connected security tech.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-2 bg-green-500/20 rounded-lg h-fit"><Star className="text-green-400" size={24} /></div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Certified Quality</h4>
                  <p className="text-gray-400">All installations are performed by certified engineers with rigorous quality checks.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
             <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
             <div className="glass-panel p-4 relative aspect-video flex items-center justify-center">
               <Shield size={120} className="text-white/10" />
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-black italic">EYE TECH</span>
                  <span className="text-sm tracking-[0.5em] text-gray-500 uppercase">Securities</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg border border-white/20 overflow-hidden">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-lg font-black">EYE TECH SECURITIES</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                A leading provider of integrated security systems and maintenance solutions, dedicated to keeping your environment safe and smart.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-400">Quick Links</h4>
              <ul className="space-y-4 text-gray-500">
                <li><a href="#services" className="hover:text-blue-400">Services</a></li>
                <li><a href="#about" className="hover:text-blue-400">About Us</a></li>
                <li><Link to="/contact" className="hover:text-blue-400">Contact Us</Link></li>
                <li><Link to="/login" className="hover:text-blue-400">Client Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-400">Legal</h4>
              <ul className="space-y-4 text-gray-500">
                <li><Link to="/privacy" className="hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-400">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Eye Tech Securities. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
