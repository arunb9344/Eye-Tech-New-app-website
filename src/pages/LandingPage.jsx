import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ShieldCheck, Wrench, Hammer, MapPin, Phone, Mail, ChevronRight, Star, CheckCircle, Users, Activity, Lock } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const sectionStyle = {
    padding: '80px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#1e293b', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '10px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'between', alignItems: 'center', fontSize: '12px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={14} color="#60a5fa" /> +91 98765 43210</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} color="#60a5fa" /> contact@eyetechsecurities.in</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} color="#60a5fa" /> Bangalore, India</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <nav style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(10px)', 
        borderBottom: '1px solid #e2e8f0',
        padding: '15px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
            <img src="/logo.png" alt="Logo" style={{ height: '48px', width: '48px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em' }}>EYE TECH</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Securities</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <a href="#services" style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Services</a>
            <a href="#about" style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Why Us</a>
            <Link to="/contact" style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Support</Link>
          </div>

          <button 
            onClick={() => navigate('/login')}
            style={{ 
              backgroundColor: '#2563eb', 
              color: '#ffffff', 
              fontWeight: 700, 
              padding: '10px 24px', 
              borderRadius: '8px', 
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              textTransform: 'uppercase',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
            Client Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ backgroundColor: '#f8fafc', padding: '100px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '6px 12px', 
              borderRadius: '9999px', 
              backgroundColor: '#dbeafe', 
              border: '1px solid #bfdbfe', 
              color: '#1e40af', 
              fontSize: '10px', 
              fontWeight: 900, 
              textTransform: 'uppercase', 
              marginBottom: '24px' 
            }}>
              <Shield size={14} /> Certified Security Solutions
            </div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, color: '#0f172a', marginBottom: '32px', lineHeight: 1.1 }}>
              Advanced <span style={{ color: '#2563eb' }}>Protection</span> for Your Assets.
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#475569', marginBottom: '40px', lineHeight: 1.6 }}>
              Eye Tech Securities provides end-to-end security system installations, professional maintenance, and AI-driven monitoring for high-value properties.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => navigate('/login')} style={{ 
                backgroundColor: '#0f172a', 
                color: '#ffffff', 
                fontWeight: 900, 
                padding: '16px 40px', 
                borderRadius: '12px', 
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px'
              }}>
                Get Started Now <ChevronRight size={20} />
              </button>
              <Link to="/contact" style={{ 
                color: '#0f172a', 
                fontWeight: 700, 
                padding: '16px 40px', 
                borderRadius: '12px', 
                border: '2px solid #e2e8f0',
                textDecoration: 'none',
                textAlign: 'center',
                fontSize: '16px'
              }}>
                Request a Quote
              </Link>
            </div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '8px solid #ffffff' }}>
              <img 
                src="/hero-banner.png" 
                alt="Security Hero" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" style={{ padding: '100px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: '16px' }}>Our Expertise</h2>
            <h3 style={{ fontSize: '36px', fontWeight: 900, color: '#0f172a' }}>Comprehensive Security Integration</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div style={{ padding: '40px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
              <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '16px', width: 'fit-content' }}>
                <Hammer size={32} />
              </div>
              <h4 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>CCTV & Surveillance</h4>
              <p style={{ color: '#475569', lineHeight: 1.6 }}>High-definition surveillance systems with mobile integration and cloud storage solutions.</p>
            </div>

            <div style={{ padding: '40px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
              <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '16px', width: 'fit-content' }}>
                <Wrench size={32} />
              </div>
              <h4 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Annual Maintenance</h4>
              <p style={{ color: '#475569', lineHeight: 1.6 }}>Systematic AMC plans including regular health checks, breakdown visits, and replacement coverage.</p>
            </div>

            <div style={{ padding: '40px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
              <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '16px', width: 'fit-content' }}>
                <Users size={32} />
              </div>
              <h4 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>Access Control</h4>
              <p style={{ color: '#475569', lineHeight: 1.6 }}>Manage entry points with biometric, RFID, and face-recognition technology for offices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '80px 20px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px', marginBottom: '80px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <img src="/logo.png" alt="Logo" style={{ height: '40px', width: '40px', filter: 'brightness(2)' }} />
                <span style={{ fontSize: '20px', fontWeight: 900 }}>EYE TECH</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
                Leading the way in intelligent security solutions. We combine advanced hardware with professional maintenance.
              </p>
            </div>

            <div>
              <h5 style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#64748b', marginBottom: '32px' }}>Company</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li><Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Contact Us</Link></li>
                <li><Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link></li>
                <li><Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '40px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: 700 }}>
            &copy; {new Date().getFullYear()} Eye Tech Securities. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
