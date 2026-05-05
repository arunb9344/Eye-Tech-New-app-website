import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MapPin, Plus, Trash2, ShieldCheck, Edit2 } from 'lucide-react';
import AddressFormModal from '../../components/AddressFormModal';

const ManageAddresses = () => {
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

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

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
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
        <button onClick={handleAddNew} className="btn btn-primary">
          <Plus size={18} /> Add New Address
        </button>
      </div>

      <AddressFormModal 
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onAddressSaved={() => fetchAddresses()}
        editingAddress={editingAddress}
      />

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
