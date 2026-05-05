import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { X } from 'lucide-react';

const AddressFormModal = ({ isOpen, onClose, onAddressSaved, editingAddress = null }) => {
  const { currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [label, setLabel] = useState(editingAddress?.label || '');
  const [name, setName] = useState(editingAddress?.name || '');
  const [phone, setPhone] = useState(editingAddress?.phone || '');
  const [addressLine1, setAddressLine1] = useState(editingAddress?.addressLine1 || editingAddress?.street || '');
  const [addressLine2, setAddressLine2] = useState(editingAddress?.addressLine2 || '');
  const [city, setCity] = useState(editingAddress?.city || '');
  const [state, setState] = useState(editingAddress?.state || '');
  const [pincode, setPincode] = useState(editingAddress?.pincode || '');
  const [gstNumber, setGstNumber] = useState(editingAddress?.gstNumber || '');

  if (!isOpen) return null;

  const handleSaveAddress = async (e) => {
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
        isEyeTechInstalled: editingAddress ? editingAddress.isEyeTechInstalled : false,
        updatedAt: new Date().toISOString()
      };

      if (editingAddress?.id) {
        await updateDoc(doc(db, 'addresses', editingAddress.id), addressData);
        onAddressSaved(editingAddress.id);
      } else {
        addressData.createdAt = new Date().toISOString();
        addressData.freeServiceVisitsRemaining = 0;
        addressData.maxFreeServiceVisits = 0;
        const docRef = await addDoc(collection(db, 'addresses'), addressData);
        onAddressSaved(docRef.id);
      }
      onClose();
    } catch (err) {
      console.error("Error saving address", err);
      alert("Failed to save address.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{ 
        width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
        padding: '32px', position: 'relative' 
      }}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ margin: 0 }}>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: '8px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSaveAddress} className="grid-2x2 gap-4">
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Address Label (e.g. Home, Office)</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} required placeholder="My Home" />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact Person Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full Name" />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone Number</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Contact number" />
          </div>
          <div className="flex flex-col gap-1" style={{ gridColumn: 'span 1' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pincode</label>
            <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
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
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>City / District</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>State</label>
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1" style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GST Number (Optional)</label>
            <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="For business invoices" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', marginTop: '12px', padding: '16px' }} disabled={submitting}>
            {submitting ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;
