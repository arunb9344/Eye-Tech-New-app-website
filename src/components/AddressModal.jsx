import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AddressModal = ({ isOpen, onClose, onAddressAdded }) => {
  const { currentUser } = useAuth();
  const [label, setLabel] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const addressData = {
        userId: currentUser.uid,
        label,
        name,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        gstNumber,
        isEyeTechInstalled: false,
        freeServiceVisitsRemaining: 0,
        maxFreeServiceVisits: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'addresses'), addressData);
      onAddressAdded({ id: docRef.id, ...addressData });
      onClose();
      resetForm();
    } catch (err) {
      console.error("Error adding address:", err);
      alert("Failed to add address.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setLabel(''); setName(''); setPhone(''); setAddressLine1(''); setAddressLine2('');
    setCity(''); setState(''); setPincode(''); setGstNumber('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content animate-fade-in" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 style={{ margin: 0 }}>Add New Address</h3>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '8px', borderColor: 'transparent' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid-2x2 gap-4">
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Label (e.g. Home)</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} required placeholder="My Home" />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full Name" />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Contact Number" />
          </div>
          <div className="flex flex-col gap-1" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Street Address</label>
            <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pincode</label>
            <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', marginTop: '12px' }} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save & Select Address'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
