import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Shield, Mail, Lock, Smartphone } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleRedirect = async (user) => {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().role === 'Admin') {
      navigate('/admin/dashboard');
    } else {
      // If doesn't exist, create customer profile
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          name: user.displayName || '',
          role: 'Customer',
          createdAt: new Date().toISOString()
        });
      }
      navigate('/customer/dashboard');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleRoleRedirect(result.user);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleRoleRedirect(result.user);
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div className="flex flex-col items-center mb-8 gap-4">
          <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-primary-light)' }}>
            <img src="/logo.png" alt="Eye Tech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ margin: 0 }}>Eye Tech Securities</h2>
          <p style={{ margin: 0, textAlign: 'center' }}>Secure Access Portal</p>
        </div>

        {error && (
          <div className="tag tag-danger mb-4" style={{ display: 'block', padding: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 mb-6">
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required 
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
        </div>

        <div className="flex flex-col gap-4">
          <button onClick={handleGoogleLogin} type="button" className="btn btn-outline flex items-center justify-center gap-2" disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.71 17.6V20.36H19.28C21.36 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.36L15.71 17.6C14.73 18.26 13.47 18.66 12 18.66C9.16 18.66 6.75 16.74 5.88 14.16H2.21V17.01C4.01 20.59 7.71 23 12 23Z" fill="#34A853"/>
              <path d="M5.88 14.16C5.66 13.5 5.53 12.77 5.53 12C5.53 11.23 5.66 10.5 5.88 9.84V6.99H2.21C1.47 8.46 1.04 10.18 1.04 12C1.04 13.82 1.47 15.54 2.21 17.01L5.88 14.16Z" fill="#FBBC05"/>
              <path d="M12 5.34C13.62 5.34 15.07 5.9 16.21 6.98L19.35 3.84C17.45 2.07 14.97 1 12 1C7.71 1 4.01 3.41 2.21 6.99L5.88 9.84C6.75 7.26 9.16 5.34 12 5.34Z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button type="button" className="btn btn-outline flex items-center justify-center gap-2" disabled={loading}>
            <Smartphone size={20} />
            Phone Number
          </button>
        </div>

      </div>

      <div className="absolute bottom-8 flex justify-center gap-6 text-sm text-gray-500 w-full px-4">
        <button onClick={() => navigate('/privacy')} className="hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer">Privacy Policy</button>
        <button onClick={() => navigate('/terms')} className="hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer">Terms of Service</button>
        <button onClick={() => navigate('/contact')} className="hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer">Contact Us</button>
      </div>
    </div>
  );
};

export default Login;
