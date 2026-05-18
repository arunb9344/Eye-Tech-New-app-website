import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    let unsubSnapshot = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      // Unsubscribe from old snapshot
      if (unsubSnapshot) { unsubSnapshot(); unsubSnapshot = null; }

      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);

          // Real-time listener so profile completion updates instantly
          unsubSnapshot = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setUserData(data);
              // Profile is incomplete if name or phone is missing
              const incomplete = !data.name || !data.phone || data.name.trim() === '';
              setProfileIncomplete(incomplete);
            } else {
              // New user — profile definitely incomplete
              setUserData({ role: 'Customer', email: user.email, name: user.displayName || '' });
              setProfileIncomplete(true);
            }
            setLoading(false);
          });
        } catch (err) {
          console.error('Error fetching user data', err);
          setUserData({ role: 'Customer' });
          setProfileIncomplete(false);
          setLoading(false);
        }
      } else {
        setUserData(null);
        setProfileIncomplete(false);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading, profileIncomplete }}>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary, #0f172a)' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
