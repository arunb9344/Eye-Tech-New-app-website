import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../../firebase/config';
import { Users, Trash2, AlertTriangle, X, ShieldOff } from 'lucide-react';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'Customer'));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const confirmDelete = (customer) => {
    setCustomerToDelete(customer);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    setDeletingId(customerToDelete.id);
    const userId = customerToDelete.id;
    
    try {
      // 1. Delete Addresses
      const addressesQ = query(collection(db, 'addresses'), where('userId', '==', userId));
      const addressesSnap = await getDocs(addressesQ);
      for (const addressDoc of addressesSnap.docs) {
        await deleteDoc(doc(db, 'addresses', addressDoc.id));
      }

      // 2. Delete Pending Bookings
      const bookingsQ = query(collection(db, 'bookings'), where('userId', '==', userId), where('status', '==', 'Pending'));
      const bookingsSnap = await getDocs(bookingsQ);
      for (const bookingDoc of bookingsSnap.docs) {
        await deleteDoc(doc(db, 'bookings', bookingDoc.id));
      }

      // 3. Delete Pending AMCs
      const amcsQ = query(collection(db, 'purchased_amcs'), where('userId', '==', userId), where('status', '==', 'Pending'));
      const amcsSnap = await getDocs(amcsQ);
      for (const amcDoc of amcsSnap.docs) {
        await deleteDoc(doc(db, 'purchased_amcs', amcDoc.id));
      }

      // 4. Delete Firestore user document
      await deleteDoc(doc(db, 'users', userId));

      // 5. Delete Firebase Authentication account via Cloud Function
      try {
        const functions = getFunctions(undefined, 'asia-south1');
        const deleteAuthUser = httpsCallable(functions, 'deleteUserAccount');
        await deleteAuthUser({ uid: userId });
      } catch (authErr) {
        // Log but don't block — Firestore data is already cleaned up
        console.warn('Auth deletion note:', authErr.message);
      }

      // Refresh UI
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer", error);
      alert("Failed to delete customer.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px' }}>
      <div className="flex items-center gap-3 mb-8">
        <Users size={28} color="var(--color-primary-light)" />
        <div>
          <h2 style={{ margin: 0 }}>Manage Customers</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>View and remove customers from the system.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No customers found.</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {customers.map(customer => (
            <div key={customer.id} className="glass-panel flex justify-between items-center" style={{ padding: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>{customer.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {customer.email} {customer.phone ? `| ${customer.phone}` : ''}
                </p>
              </div>
              <button 
                onClick={() => confirmDelete(customer)}
                className="btn btn-danger" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                disabled={deletingId === customer.id}
              >
                {deletingId === customer.id ? 'Deleting...' : <><Trash2 size={18} /> Delete</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ margin: 0, color: '#ff7675', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={24} /> Confirm Deletion
              </h3>
              <button onClick={() => setCustomerToDelete(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <p className="mb-4">Are you sure you want to delete the customer <strong>{customerToDelete.name}</strong>?</p>
            
            <div style={{ background: 'rgba(255, 118, 117, 0.1)', borderLeft: '4px solid #ff7675', padding: '16px', borderRadius: '4px', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>This will permanently cascade delete:</p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li>All of their registered Addresses</li>
                <li>All of their Pending Bookings</li>
                <li>All of their Pending AMC requests</li>
                <li>Their Customer Profile from the database</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <ShieldOff size={14} color="#ff7675" /> <strong>Their Firebase login account (Google / Email / Phone)</strong>
                </li>
              </ul>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                * Completed bookings and approved AMCs are retained for records. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setCustomerToDelete(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleDelete} className="btn btn-danger" style={{ flex: 1 }}>
                Yes, Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
