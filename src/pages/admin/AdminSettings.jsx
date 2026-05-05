import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Settings, Save, AlertTriangle } from 'lucide-react';

const AdminSettings = () => {
  const [pricing, setPricing] = useState({
    eyeTechServicePrice: 300,
    nonEyeTechServicePrice: 500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const docRef = doc(db, 'app_config', 'pricing');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPricing(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching pricing", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'app_config', 'pricing'), pricing);
      setMessage('Pricing settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Error saving pricing", err);
      setMessage('Failed to save pricing.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px' }}>
      <div className="flex items-center gap-3 mb-8">
        <Settings size={28} color="var(--color-secondary)" />
        <h2 style={{ margin: 0 }}>System Settings</h2>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 className="mb-6">Service Pricing</h3>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Set the standard visit charges for different installation types. These prices will be shown to customers during the booking process.
        </p>

        {loading ? (
          <p>Loading settings...</p>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label style={{ fontWeight: 500 }}>Eye Tech Installed Address (₹)</label>
              <input 
                type="number" 
                value={pricing.eyeTechServicePrice} 
                onChange={(e) => setPricing({...pricing, eyeTechServicePrice: parseFloat(e.target.value)})}
                placeholder="e.g. 300"
                required
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Discounted rate for customers who bought systems from you.</span>
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontWeight: 500 }}>Non-Eye Tech Installed Address (₹)</label>
              <input 
                type="number" 
                value={pricing.nonEyeTechServicePrice} 
                onChange={(e) => setPricing({...pricing, nonEyeTechServicePrice: parseFloat(e.target.value)})}
                placeholder="e.g. 500"
                required
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Standard rate for servicing systems installed by others.</span>
            </div>

            <div className="flex items-center gap-3 mt-4" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--color-secondary)' }}>
              <AlertTriangle size={20} color="var(--color-secondary)" />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Note: These rates apply to standard service visits. Complex repairs may still be billed differently.
              </p>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
              {message && <span style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>{message}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
