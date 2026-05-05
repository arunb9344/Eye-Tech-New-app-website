import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ShieldCheck, Calendar, MapPin, Search } from 'lucide-react';

const AdminManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [isEyeTech, setIsEyeTech] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [freeVisits, setFreeVisits] = useState(2);
  
  // Full Address Edit State
  const [editLabel, setEditLabel] = useState('');
  const [editName, setEditName] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'addresses'));
      const addressesData = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));

      const usersSnap = await getDocs(collection(db, 'users'));
      const usersMap = {};
      usersSnap.forEach(doc => {
        usersMap[doc.id] = doc.data();
      });

      const fetched = addressesData.map(a => ({
        ...a,
        userName: usersMap[a.userId]?.name || 'Unknown User',
        userPhone: usersMap[a.userId]?.phoneNumber || 'N/A'
      }));
      setAddresses(fetched);
    } catch (err) {
      console.error("Error fetching addresses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleEditClick = (address) => {
    setEditingId(address.id);
    setIsEyeTech(address.isEyeTechInstalled || false);
    setFreeVisits(address.freeServiceVisitsRemaining || 2);
    setEditLabel(address.label || '');
    setEditName(address.name || '');
    setEditStreet(address.street || address.addressLine1 || '');
    setEditCity(address.city || '');
    setEditPincode(address.pincode || '');
    setEditPhone(address.phone || address.userPhone || '');
    
    if (address.freeServiceValidUntil) {
      const date = new Date(address.freeServiceValidUntil);
      setExpiryDate(date.toISOString().split('T')[0]);
    } else {
      setExpiryDate('');
    }
  };

  const handleUpdate = async (id) => {
    try {
      const updateData = {
        label: editLabel,
        name: editName,
        street: editStreet,
        addressLine1: editStreet, // For compatibility
        city: editCity,
        pincode: editPincode,
        phone: editPhone,
        isEyeTechInstalled: isEyeTech,
        freeServiceValidUntil: expiryDate ? new Date(expiryDate).getTime() : null,
        freeServiceVisitsRemaining: parseInt(freeVisits) || 0,
        maxFreeServiceVisits: parseInt(freeVisits) || 0
      };

      await updateDoc(doc(db, 'addresses', id), updateData);
      
      setEditingId(null);
      fetchAddresses();
    } catch (err) {
      console.error("Error updating address", err);
      alert("Failed to update address.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'addresses', id));
      fetchAddresses();
    } catch (err) {
      console.error("Error deleting address", err);
      alert("Failed to delete address.");
    }
  };

  const filteredAddresses = addresses.filter(a => 
    a.label?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.addressLine1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.pincode?.includes(searchTerm)
  );

  return (
    <div className="animate-fade-in">
      <h2 className="mb-2">Manage All Addresses</h2>
      <p className="mb-8">Verify installations and assign Free Service periods.</p>

      <div className="glass-panel mb-8" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search by label, street, or pincode..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', background: 'transparent', padding: 0, margin: 0, boxShadow: 'none' }}
        />
      </div>

      {loading ? (
        <p>Loading addresses...</p>
      ) : (
        <div className="flex-col gap-4">
          {filteredAddresses.map((address) => (
            <div key={address.id} className="glass-panel" style={{ padding: '24px' }}>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={20} color="var(--color-primary-light)" />
                    <div className="flex flex-col">
                      <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{address.label || 'Address'}</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{address.name}</span>
                    </div>
                    {address.isEyeTechInstalled && (
                      <span className="tag tag-success ml-2">Eye Tech Verified</span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>
                    {address.street}, {address.city} - {address.pincode}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Customer: <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{address.userName}</span> ({address.userPhone})
                  </p>
                  
                  {(address.isEyeTechInstalled || address.freeServiceValidUntil) && (
                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: address.freeServiceValidUntil > Date.now() ? 'var(--color-secondary)' : 'var(--color-accent)' }}>
                        <Calendar size={16} />
                        <span>
                          Free Service {address.freeServiceValidUntil > Date.now() ? 'Expires' : 'Expired'} on: {new Date(address.freeServiceValidUntil).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-blue-400">
                        <ShieldCheck size={16} />
                        <span>Remaining Free Visits: {address.freeServiceVisitsRemaining || 0} / {address.maxFreeServiceVisits || 0}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ minWidth: '300px' }}>
                  {editingId === address.id ? (
                    <div className="flex-col gap-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: 'var(--radius-sm)' }}>
                      <div className="grid-2x2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Label (e.g. Home)</label>
                          <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contact Person</label>
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone</label>
                          <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1" style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Street/Address</label>
                          <input type="text" value={editStreet} onChange={e => setEditStreet(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>City</label>
                          <input type="text" value={editCity} onChange={e => setEditCity(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pincode</label>
                          <input type="text" value={editPincode} onChange={e => setEditPincode(e.target.value)} />
                        </div>
                      </div>

                      <hr style={{ opacity: 0.1, margin: '12px 0' }} />

                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={isEyeTech} 
                          onChange={(e) => setIsEyeTech(e.target.checked)} 
                          id={`eyetech-${address.id}`}
                          style={{ width: 'auto' }}
                        />
                        <label htmlFor={`eyetech-${address.id}`} style={{ fontWeight: 500 }}>Eye Tech Installed?</label>
                      </div>

                      {isEyeTech && (
                        <div className="grid-2x2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Free Service Until</label>
                            <input 
                              type="date" 
                              value={expiryDate} 
                              onChange={(e) => setExpiryDate(e.target.value)} 
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Free Visits</label>
                            <input 
                              type="number" 
                              min="0"
                              value={freeVisits} 
                              onChange={(e) => setFreeVisits(e.target.value)} 
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button onClick={() => handleDelete(address.id)} className="btn btn-danger" style={{ marginRight: 'auto', padding: '8px 16px' }}>Delete</button>
                        <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ padding: '8px 24px' }}>Cancel</button>
                        <button onClick={() => handleUpdate(address.id)} className="btn btn-primary" style={{ padding: '8px 32px' }}>Save Changes</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => handleEditClick(address)} className="btn btn-outline" style={{ width: '100%' }}>
                      Edit Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminManageAddresses;
