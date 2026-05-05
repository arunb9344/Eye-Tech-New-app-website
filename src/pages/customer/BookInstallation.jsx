import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MapPin, Info, ArrowRight, CheckCircle, Plus, Hammer } from 'lucide-react';

const BookInstallation = () => {
  const { currentUser, userData } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [numCameras, setNumCameras] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'addresses'), where('userId', '==', currentUser.uid));
        const snapshot = await getDocs(q);
        const fetchedAddrs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAddresses(fetchedAddrs);
        if (fetchedAddrs.length > 0) setSelectedAddressId(fetchedAddrs[0].id);
      } catch (err) {
        console.error("Error fetching addresses", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddressId || !numCameras || !description || !selectedAddress) return;
    
    setSubmitting(true);
    try {
      const bookingData = {
        type: 'Installation',
        userId: currentUser.uid || '',
        userName: userData?.name || currentUser.displayName || 'Customer',
        userPhone: selectedAddress.phone || currentUser.phoneNumber || '',
        addressId: selectedAddressId,
        addressName: selectedAddress.label || selectedAddress.name || 'Address',
        fullAddress: `${selectedAddress.addressLine1 || selectedAddress.street || ''}, ${selectedAddress.addressLine2 || ''}, ${selectedAddress.city || ''}, ${selectedAddress.state || ''} - ${selectedAddress.pincode || ''}`.replace(/, ,/g, ','),
        pincode: selectedAddress.pincode || '',
        numberOfCameras: parseInt(numCameras) || 0,
        description: description || '',
        status: 'Pending',
        chargeType: 'Chargeable',
        isEyeTechInstalled: !!selectedAddress.isEyeTechInstalled,
        bookingDate: Date.now(),
        // Add defaults for other model fields
        completionDescription: '',
        amountCharged: 0,
        freeServicePeriod: 'No-Free Service',
        freeServiceVisits: 0,
        adminNotes: '',
        completionNotes: '',
        gstNumber: '',
        invoiceNumber: ''
      };
      
      await addDoc(collection(db, 'bookings'), bookingData);
      setSuccess(true);
    } catch (err) {
      console.error("Error creating installation booking:", err);
      alert(`Failed to book installation: ${err.message || 'Please try again'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center" style={{ minHeight: '70vh' }}>
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', maxWidth: '500px', borderTop: '4px solid #ff7675' }}>
          <div className="mb-6 flex justify-center">
            <div style={{ background: 'rgba(255, 118, 117, 0.1)', padding: '20px', borderRadius: '50%' }}>
              <CheckCircle size={64} color="#ff7675" />
            </div>
          </div>
          <h2 className="mb-4">Installation Booked!</h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your request for <strong>{numCameras} cameras</strong> at <strong>{selectedAddress?.label || selectedAddress?.name}</strong> has been submitted. 
            Our admin team will review and contact you shortly.
          </p>
          <button onClick={() => window.location.href = '/customer/dashboard'} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="mb-8">
        <h2 className="mb-2">Book Installation</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Request a professional CCTV installation for your premises.</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
            <p>Loading addresses...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Installation Address</label>
                <a href="/customer/addresses" className="flex items-center gap-1" style={{ fontSize: '0.85rem', color: 'var(--color-primary-light)', fontWeight: 500 }}>
                  <Plus size={14} /> Add New Address
                </a>
              </div>
              <select 
                value={selectedAddressId} 
                onChange={(e) => setSelectedAddressId(e.target.value)}
                required
                className="premium-select"
                style={{ width: '100%' }}
              >
                {addresses.length === 0 ? (
                  <option disabled>No addresses found</option>
                ) : (
                  addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label || 'Address'} - {addr.name} ({addr.addressLine1 || addr.street})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Number of Cameras</label>
              <input 
                type="number" 
                min="1" 
                placeholder="How many cameras do you need?"
                value={numCameras}
                onChange={(e) => setNumCameras(e.target.value)}
                required
                style={{ padding: '14px', fontSize: '1rem' }}
              />
            </div>

            <div className="flex flex-col gap-3">
              <label style={{ fontWeight: 600, fontSize: '0.95rem' }}>Installation Notes</label>
              <textarea 
                rows="5" 
                placeholder="Provide any additional details about the installation site or requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ padding: '16px', fontSize: '1rem' }}
              ></textarea>
            </div>

            <div style={{ 
              background: 'rgba(255, 118, 117, 0.05)', 
              border: '1px solid rgba(255, 118, 117, 0.2)', 
              padding: '20px', 
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <Hammer size={20} color="#ff7675" />
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Note: Installation costs will be estimated by the admin after reviewing your request.
              </p>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting || !selectedAddressId || !numCameras || !description}
              style={{ 
                padding: '16px', 
                fontSize: '1.1rem', 
                fontWeight: 700,
                marginTop: '8px',
                background: numCameras ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.1)'
              }}
            >
              {submitting ? 'Processing...' : 'Submit Installation Request'}
              {!submitting && <ArrowRight size={20} className="ml-2" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookInstallation;
