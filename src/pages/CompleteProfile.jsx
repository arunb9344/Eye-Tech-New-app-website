import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, CheckCircle, Shield } from 'lucide-react';

const CompleteProfile = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill from whatever we already know
  useEffect(() => {
    if (currentUser) {
      setName(userData?.name || currentUser.displayName || '');
      setEmail(userData?.email || currentUser.email || '');
      setPhone(userData?.phone || currentUser.phoneNumber || '');
    }
  }, [currentUser, userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Full name is required.'); return; }
    if (!phone.trim() || phone.length < 10) { setError('Please enter a valid phone number.'); return; }

    setLoading(true);
    setError('');

    try {
      // Update Firebase Auth display name
      await updateProfile(auth.currentUser, { displayName: name.trim() });

      // Write to Firestore — merge so we don't overwrite role/etc.
      await setDoc(doc(db, 'users', currentUser.uid), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        profileComplete: true,
        updatedAt: serverTimestamp(),
        // Only set these if the doc is brand new
        role: userData?.role || 'Customer',
        createdAt: userData?.createdAt || serverTimestamp(),
      }, { merge: true });

      // Navigate based on role
      if (userData?.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 16px 13px 44px',
    borderRadius: '12px',
    border: '1.5px solid rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#ffffff',
    fontSize: '15px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const iconWrap = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#60a5fa',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '28px',
        padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {/* Avatar circle */}
          <div style={{
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 0 8px rgba(37,99,235,0.12)',
          }}>
            <User size={36} color="#ffffff" />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px', borderRadius: '9999px',
            background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)',
            color: '#60a5fa', fontSize: '11px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: '14px',
          }}>
            <Shield size={12} /> Almost There!
          </div>

          <h1 style={{ color: '#ffffff', fontSize: '26px', fontWeight: 900, margin: '0 0 8px' }}>
            Complete Your Profile
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Please provide your details to activate your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px', padding: '12px 16px',
            color: '#fca5a5', fontSize: '14px', marginBottom: '20px', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={iconWrap}><User size={17} /></span>
              <input
                type="text"
                required
                placeholder="e.g. Arun Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={iconWrap}><Mail size={17} /></span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ ...inputStyle, opacity: currentUser?.email ? 0.7 : 1 }}
                readOnly={!!currentUser?.email}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
            {currentUser?.email && (
              <p style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>Email is pre-filled from your login</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Phone Number *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={iconWrap}><Phone size={17} /></span>
              <input
                type="tel"
                required
                placeholder="+91 99628 35944"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              background: loading
                ? 'rgba(37,99,235,0.5)'
                : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '15px',
              padding: '15px',
              borderRadius: '14px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(37,99,235,0.35)',
              transition: 'all 0.2s',
              width: '100%',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={18} /> Finish Setup
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '24px', lineHeight: 1.5 }}>
          Your information is secure and only used to manage your bookings with Eye Tech Securities.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #475569; }
      `}</style>
    </div>
  );
};

export default CompleteProfile;
