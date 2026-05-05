import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AddressModal = ({ isOpen, onClose, onAddressSaved, initialData = null }) => {
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

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label || '');
      setName(initialData.name || '');
      setPhone(initialData.phone || '');
      setAddressLine1(initialData.addressLine1 || initialData.street || '');
      setAddressLine2(initialData.addressLine2 || '');
      setCity(initialData.city || '');
      setState(initialData.state || '');
      setPincode(initialData.pincode || '');
      setGstNumber(initialData.gstNumber || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

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
        updatedAt: new Date().toISOString()
      };

      if (initialData?.id) {
        // Update existing
        await updateDoc(doc(db, 'addresses', initialData.id), addressData);
        onAddressSaved({ id: initialData.id, ...addressData });
      } else {
        // Create new
        addressData.isEyeTechInstalled = false;
        addressData.freeServiceVisitsRemaining = 0;
        addressData.maxFreeServiceVisits = 0;
        addressData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'addresses'), addressData);
        onAddressSaved({ id: docRef.id, ...addressData });
      }
      
      onClose();
      resetForm();
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Failed to save address.");
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
          <h3 style={{ margin: 0 }}>{initialData ? 'Edit Address' : 'Add New Address'}</h3>
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
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full Name" />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Contact Number" />
          </div>
          <div className="flex flex-col gap-1" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Street Address (Line 1)</label>
            <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Apartment/Suite (Line 2 - Optional)</label>
            <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>City</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>State</label>
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pincode</label>
            <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GST Number (Optional)</label>
            <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', marginTop: '12px' }} disabled={submitting}>
            {submitting ? 'Saving...' : initialData ? 'Update Address' : 'Save Address'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
