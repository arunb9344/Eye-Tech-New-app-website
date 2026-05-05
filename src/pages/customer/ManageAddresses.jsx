import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MapPin, Plus, Trash2, ShieldCheck, X, Edit2 } from 'lucide-react';

const ManageAddresses = () => {
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
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

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'addresses'), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      setAddresses(fetched);
    } catch (err) {
      console.error("Error fetching addresses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchAddresses();
  }, [currentUser]);

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
        isEyeTechInstalled: editingId ? addresses.find(a => a.id === editingId)?.isEyeTechInstalled : false,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'addresses', editingId), addressData);
      } else {
        addressData.createdAt = new Date().toISOString();
        addressData.freeServiceVisitsRemaining = 0;
        addressData.maxFreeServiceVisits = 0;
        await addDoc(collection(db, 'addresses'), addressData);
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchAddresses();
    } catch (err) {
      console.error("Error saving address", err);
      alert("Failed to save address.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setLabel(''); setName(''); setPhone(''); setAddressLine1(''); setAddressLine2('');
    setCity(''); setState(''); setPincode(''); setGstNumber('');
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setLabel(address.label || '');
    setName(address.name || '');
    setPhone(address.phone || '');
    setAddressLine1(address.addressLine1 || address.street || '');
    setAddressLine2(address.addressLine2 || '');
    setCity(address.city || '');
    setState(address.state || '');
    setPincode(address.pincode || '');
    setGstNumber(address.gstNumber || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteDoc(doc(db, 'addresses', id));
        fetchAddresses();
      } catch (err) {
        console.error("Error deleting address", err);
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="mb-2">Manage Addresses</h2>
          <p className="mb-0">Add and manage your installation locations.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus size={18} /> Add New Address
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel animate-fade-in mb-8" style={{ padding: '24px' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ margin: 0 }}>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
            <button onClick={() => setShowForm(false)} className="btn btn-outline" style={{ padding: '8px' }}>
              <X size={18} />
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
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Contact for this location" />
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
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pincode</label>
              <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GST Number (Optional)</label>
              <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="For business invoices" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', marginTop: '12px' }} disabled={submitting}>
              {submitting ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <MapPin size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
          <h3>No Addresses Yet</h3>
          <p>Add your first address to start booking services.</p>
        </div>
      ) : (
        <div className="grid-2x2">
          {addresses.map((address) => (
            <div key={address.id} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
              <div className="flex gap-2" style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <button 
                  onClick={() => handleEdit(address)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  title="Edit Address"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(address.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  title="Delete Address"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} color="var(--color-primary-light)" />
                <div className="flex flex-col">
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{address.label || 'Address'}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{address.name}</span>
                </div>
              </div>
              
              <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {address.phone && <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{address.phone}</div>}
                {address.addressLine1 || address.street}<br />
                {address.addressLine2 && <>{address.addressLine2}<br /></>}
                {address.city}, {address.state} - {address.pincode}
                {address.gstNumber && <div style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.8 }}>GST: {address.gstNumber}</div>}
              </p>

              {address.isEyeTechInstalled ? (
                <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: 'var(--glass-border)' }}>
                  <ShieldCheck size={18} color="var(--color-secondary)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)' }}>Verified Eye Tech Installation</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: 'var(--glass-border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Standard Address (Non-Eye Tech)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAddresses;
