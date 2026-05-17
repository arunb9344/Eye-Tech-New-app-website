import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ChevronLeft, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const cardStyle = {
    backgroundColor: '#f8fafc',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    padding: '28px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  };

  const iconBoxStyle = (bg, color) => ({
    padding: '14px',
    backgroundColor: bg,
    color: color,
    borderRadius: '14px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px'
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#1e293b', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Top Bar */}
      <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '10px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', fontSize: '12px', gap: '24px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={13} color="#60a5fa" /> +91 99628 35944</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={13} color="#60a5fa" /> support@eyetechsecurities.in</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}><MapPin size={13} color="#60a5fa" /> Nanganallur, Chennai</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '15px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Logo" style={{ height: '44px', width: '44px', objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em' }}>EYE TECH</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Securities</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link to="/" style={{ fontSize: '14px', fontWeight: 700, color: '#475569', textDecoration: 'none' }}>Home</Link>
            <Link to="/contact" style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>Contact</Link>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 700,
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontSize: '14px'
            }}
          >
            Client Login
          </button>
        </div>
      </nav>

      {/* Hero Banner */}
      <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '60px 20px 50px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 14px', borderRadius: '9999px',
            backgroundColor: '#dbeafe', border: '1px solid #bfdbfe',
            color: '#1e40af', fontSize: '11px', fontWeight: 900,
            textTransform: 'uppercase', marginBottom: '20px'
          }}>
            <Shield size={13} /> Get In Touch
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>
            Contact <span style={{ color: '#2563eb' }}>Eye Tech Securities</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '560px', lineHeight: 1.7 }}>
            Have questions about our security systems or need support? Our team is ready to help you 24/7.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'start' }}>

          {/* Left – Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={cardStyle}>
              <div style={iconBoxStyle('#dbeafe', '#2563eb')}><Phone size={22} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Call Us</p>
                <a href="tel:+919962835944" style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', textDecoration: 'none', display: 'block' }}>+91 99628 35944</a>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Mon–Sat, 9am–7pm IST</p>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={iconBoxStyle('#ede9fe', '#7c3aed')}><Mail size={22} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Email Us</p>
                <a href="mailto:support@eyetechsecurities.in" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', textDecoration: 'none', display: 'block' }}>support@eyetechsecurities.in</a>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>We reply within 24 hours</p>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={iconBoxStyle('#dcfce7', '#16a34a')}><MapPin size={22} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Visit Us</p>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Eye Tech Securities</p>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                  Door No:01, Shop No:02 Ground Floor,<br />
                  15th St, Nehru Colony, Nanganallur,<br />
                  Chennai, Tamil Nadu – 600061
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>📍 DIGIPIN: 4T3-22P-3KK2</p>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={iconBoxStyle('#fef9c3', '#ca8a04')}><Clock size={22} /></div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Support Hours</p>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>24/7 Technical Support</p>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>For existing AMC customers</p>
              </div>
            </div>
          </div>

          {/* Right – Contact Form */}
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={24} color="#2563eb" /> Send us a Message
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Fill in the details and we'll get back to you shortly.</p>

            {submitted && (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#15803d', fontWeight: 700, fontSize: '14px' }}>
                ✅ Thank you! We'll get back to you within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Your Name</label>
                  <input
                    type="text" required style={inputStyle}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email" required style={inputStyle}
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel" style={inputStyle}
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label style={labelStyle}>Subject</label>
                <input
                  type="text" required style={inputStyle}
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label style={labelStyle}>Message</label>
                <textarea
                  required rows={5}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                  placeholder="Describe your requirement or issue..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#2563eb', color: '#ffffff',
                  fontWeight: 800, fontSize: '15px',
                  padding: '14px 32px', borderRadius: '12px',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                  transition: 'opacity 0.2s'
                }}
              >
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '40px 20px', marginTop: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '36px', filter: 'brightness(2)' }} />
            <span style={{ fontWeight: 900, fontSize: '16px' }}>EYE TECH Securities</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
            <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
          <p style={{ color: '#64748b', fontSize: '12px' }}>© {new Date().getFullYear()} Eye Tech Securities. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
