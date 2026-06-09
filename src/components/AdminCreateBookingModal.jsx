import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { X, Search, MapPin, Wrench, Hammer, CheckCircle, Zap, ShieldCheck, Info } from 'lucide-react';

// ─── tiny helper ───────────────────────────────────────────────────────────────
const PRODUCTS = ['CCTV Camera', 'Video Door Phone', 'Intrusion Alarm', 'Biometric & Access Control'];
const ISSUES = {
  'CCTV Camera': ['Beep Sound', 'No PlayBack', 'No Video', 'Flickering', 'No Mobile View (Offline)', 'Others'],
  default: ['Others'],
};
const getIssues = (product) => ISSUES[product] || ISSUES.default;

// ─── component ─────────────────────────────────────────────────────────────────
export default function AdminCreateBookingModal({ isOpen, onClose, onBookingCreated }) {
  // ── step ──
  const [step, setStep] = useState(1); // 1=customer, 2=address, 3=type+details

  // ── data ──
  const [customers, setCustomers]       = useState([]);
  const [addresses,  setAddresses]      = useState([]);
  const [amcs,       setAmcs]           = useState([]);
  const [pricing,    setPricing]        = useState({ eyeTechServicePrice: 300, nonEyeTechServicePrice: 500 });

  // ── selections ──
  const [customerSearch, setCustomerSearch] = useState('');
  const [customer,   setCustomer]   = useState(null); // full object
  const [address,    setAddress]    = useState(null); // full object
  const [bookingType, setBookingType] = useState('Service');
  const [product,    setProduct]    = useState('');
  const [issue,      setIssue]      = useState('');
  const [numCameras, setNumCameras] = useState('');
  const [notes,      setNotes]      = useState('');

  // ── ui ──
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [submitting,       setSubmitting]       = useState(false);
  const [error,            setError]            = useState('');

  // ── init / reset ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    resetAll();
    loadCustomers();
    loadPricing();
  }, [isOpen]);

  function resetAll() {
    setStep(1);
    setCustomerSearch('');
    setCustomer(null);
    setAddresses([]);
    setAddress(null);
    setAmcs([]);
    setBookingType('Service');
    setProduct('');
    setIssue('');
    setNumCameras('');
    setNotes('');
    setError('');
  }

  // ── loaders ──────────────────────────────────────────────────────────────────
  async function loadPricing() {
    try {
      const snap = await getDoc(doc(db, 'app_config', 'pricing'));
      if (snap.exists()) setPricing(snap.data());
    } catch (e) { console.error('pricing load', e); }
  }

  async function loadCustomers() {
    setLoadingCustomers(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'Customer')));
      setCustomers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    } catch (e) { console.error('customers load', e); }
    finally { setLoadingCustomers(false); }
  }

  async function loadAddresses(userId) {
    setLoadingAddresses(true);
    setAddresses([]);
    setAddress(null);
    setAmcs([]);
    try {
      const [addrSnap, amcSnap] = await Promise.all([
        getDocs(query(collection(db, 'addresses'),      where('userId', '==', userId))),
        getDocs(query(collection(db, 'purchased_amcs'), where('userId', '==', userId))),
      ]);
      const addrs = addrSnap.docs.map(d => ({ ...d.data(), id: d.id }));
      console.log('Loaded addresses:', addrs.map(a => ({ id: a.id, label: a.label })));
      setAddresses(addrs);
      setAmcs(amcSnap.docs.map(d => ({ ...d.data(), id: d.id })));
    } catch (e) { console.error('addresses load', e); }
    finally { setLoadingAddresses(false); }
  }

  // ── derived ──────────────────────────────────────────────────────────────────
  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase();
    return (c.name || '').toLowerCase().includes(q)
      || (c.phone || '').includes(q)
      || (c.phoneNumber || '').includes(q)
      || (c.email || '').toLowerCase().includes(q);
  });

  const isFreeServiceValid = address
    && address.freeServiceValidUntil
    && new Date(address.freeServiceValidUntil).getTime() > Date.now()
    && (address.freeServiceVisitsRemaining || 0) > 0;

  const applicableAmc = address
    ? amcs.find(a => a.addressId === address.id && a.status === 'Approved' && (a.breakdownVisitsLeft || 0) > 0 && (!a.validityUpto || a.validityUpto > Date.now()))
    : null;

  const chargeType = bookingType === 'Installation' ? 'Chargeable'
    : !address           ? 'Chargeable'
    : isFreeServiceValid ? 'Free Service'
    : applicableAmc      ? 'AMC:Breakdown'
    : 'Chargeable';

  const servicePrice = address?.isEyeTechInstalled ? pricing.eyeTechServicePrice : pricing.nonEyeTechServicePrice;

  // ── handlers ─────────────────────────────────────────────────────────────────
  function selectCustomer(c) {
    setCustomer(c);
    setStep(2);
    loadAddresses(c.id);
  }

  function selectAddress(addr) {
    console.log('Selected address:', addr.id, addr.label);
    setAddress(addr);
    setStep(3);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!customer || !address) { setError('Customer and address are required.'); return; }
    if (bookingType === 'Service' && (!product || !issue)) { setError('Please select product and issue.'); return; }
    if (bookingType === 'Installation' && !numCameras) { setError('Please enter number of cameras.'); return; }

    setSubmitting(true);
    try {
      const fullAddress = [
        address.addressLine1 || address.street,
        address.addressLine2,
        address.city,
        address.state,
        address.pincode,
      ].filter(Boolean).join(', ');

      const base = {
        type: bookingType,
        userId:       customer.id,
        userName:     customer.name || 'Customer',
        userPhone:    address.phone || customer.phone || customer.phoneNumber || '',
        addressId:    address.id,
        addressName:  address.label || address.name || 'Address',
        fullAddress,
        pincode:           address.pincode || '',
        status:            'Pending',
        chargeType,
        isEyeTechInstalled: !!address.isEyeTechInstalled,
        bookingDate:  Date.now(),
        createdAt:    Date.now(),
        completionDescription: '',
        amountCharged: 0,
        freeServicePeriod: 'No-Free Service',
        freeServiceVisits: 0,
        adminNotes: '',
        completionNotes: '',
        gstNumber: '',
        invoiceNumber: '',
      };

      if (bookingType === 'Service') {
        Object.assign(base, {
          product,
          issue,
          description: notes ? `Product: ${product}\nIssue: ${issue}\nNotes: ${notes}` : `Product: ${product}\nIssue: ${issue}`,
          servicePrice: servicePrice || 0,
          amcId: applicableAmc?.id || null,
        });
      } else {
        Object.assign(base, {
          numberOfCameras: parseInt(numCameras) || 0,
          description: notes || '',
          servicePrice: 0,
        });
      }

      await addDoc(collection(db, 'bookings'), base);

      // Notifications
      await Promise.all([
        addDoc(collection(db, 'notification_signals'), {
          title: `Admin Booked ${bookingType}`,
          body: `New ${bookingType} booking for ${base.userName} at ${base.addressName}`,
          recipientRole: 'Admin',
          status: 'pending',
          type: 'new_booking',
          createdAt: Date.now(),
        }),
        addDoc(collection(db, 'notification_signals'), {
          title: 'Booking Created',
          body: `Admin created a ${bookingType} booking for you at ${base.addressName}.`,
          recipientId: customer.id,
          status: 'pending',
          type: 'booking_created',
          createdAt: Date.now(),
        }),
      ]);

      onBookingCreated();
      onClose();
    } catch (err) {
      console.error('submit', err);
      setError('Failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '28px', padding: '32px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--gradient-primary)', padding: '10px', borderRadius: '12px' }}>
              <Wrench size={22} color="white" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Create New Booking</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex' }}>
            <X size={22} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {['Customer', 'Address', 'Details'].map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done   = step > n;
            return (
              <div key={n} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: '4px', borderRadius: '2px',
                  background: done || active ? 'var(--color-primary-light)' : 'rgba(255,255,255,0.1)',
                  marginBottom: '6px',
                }} />
                <span style={{ fontSize: '0.75rem', color: active ? 'var(--color-primary-light)' : done ? '#aaa' : 'var(--text-muted)' }}>
                  {n}. {label}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: '#e74c3c', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── STEP 1: Customer ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Select Customer</h3>
            <div style={{ position: 'relative' }}>
              <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name, phone or email…"
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '44px', width: '100%' }}
                autoFocus
              />
            </div>

            {loadingCustomers ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Loading customers…</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', overflowY: 'auto' }}>
                {filteredCustomers.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No customers found</p>
                ) : filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCustomer(c)}
                    style={{
                      textAlign: 'left', padding: '14px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'white', cursor: 'pointer',
                      transition: 'all 0.2s',
                      width: '100%',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,92,231,0.15)'; e.currentTarget.style.borderColor = 'rgba(108,92,231,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{c.name || 'Unnamed'}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {c.phone || c.phoneNumber || 'No phone'} {c.email ? `· ${c.email}` : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Address ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--color-primary-light)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
                ← Back
              </button>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                Select Address for <span style={{ color: 'var(--color-primary-light)' }}>{customer?.name}</span>
              </h3>
            </div>

            {loadingAddresses ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>Loading addresses…</p>
            ) : addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <MapPin size={32} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
                <p style={{ color: '#e74c3c', margin: 0 }}>No addresses found for this customer.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => selectAddress(addr)}
                    style={{
                      textAlign: 'left', width: '100%', cursor: 'pointer',
                      padding: '16px', borderRadius: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,92,231,0.2)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <MapPin size={18} style={{ color: 'var(--color-primary-light)', marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{addr.label || addr.name || 'Address'}</p>
                        <p style={{ margin: '3px 0 0', fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {[addr.addressLine1 || addr.street, addr.addressLine2, addr.city, addr.pincode].filter(Boolean).join(', ')}
                        </p>
                        {addr.isEyeTechInstalled && (
                          <span style={{ fontSize: '0.72rem', color: '#2ecc71', background: 'rgba(46,204,113,0.12)', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', marginTop: '6px' }}>
                            ✓ Eye Tech Installed
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Details ── */}
        {step === 3 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Summary chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setStep(1)} style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '20px', background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.4)', color: 'var(--color-primary-light)', cursor: 'pointer' }}>
                👤 {customer?.name}
              </button>
              <button type="button" onClick={() => setStep(2)} style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '20px', background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.4)', color: 'var(--color-primary-light)', cursor: 'pointer' }}>
                📍 {address?.label || 'Address'}
              </button>
            </div>

            {/* Booking type */}
            <div>
              <label style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '10px' }}>Booking Type</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Service', 'Installation'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBookingType(t)}
                    style={{
                      flex: 1, padding: '14px', borderRadius: '14px', cursor: 'pointer',
                      border: bookingType === t ? '2px solid var(--color-primary-light)' : '2px solid rgba(255,255,255,0.08)',
                      background: bookingType === t ? 'rgba(108,92,231,0.15)' : 'rgba(255,255,255,0.03)',
                      color: bookingType === t ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {t === 'Service' ? <Wrench size={22} /> : <Hammer size={22} />}
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Service details */}
            {bookingType === 'Service' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Charge info */}
                <div style={{
                  padding: '14px 16px', borderRadius: '12px',
                  background: chargeType.includes('Free') ? 'rgba(46,204,113,0.08)' : chargeType.includes('AMC') ? 'rgba(52,152,219,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${chargeType.includes('Free') ? 'rgba(46,204,113,0.25)' : chargeType.includes('AMC') ? 'rgba(52,152,219,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {chargeType.includes('Free') ? <Zap size={17} color="#2ecc71" /> : chargeType.includes('AMC') ? <ShieldCheck size={17} color="#3498db" /> : <Info size={17} />}
                    <span style={{ fontWeight: 700, color: chargeType.includes('Free') ? '#2ecc71' : chargeType.includes('AMC') ? '#3498db' : 'inherit' }}>
                      {chargeType}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                    {isFreeServiceValid
                      ? `Free visits left: ${address.freeServiceVisitsRemaining}`
                      : applicableAmc
                      ? `Covered by ${applicableAmc.packageName}`
                      : `Min. visiting charges: ₹${servicePrice}`}
                  </p>
                </div>

                {/* Product */}
                <select
                  value={product}
                  onChange={e => { setProduct(e.target.value); setIssue(''); }}
                  required
                  className="premium-select"
                  style={{ width: '100%' }}
                >
                  <option value="">-- Select Product --</option>
                  {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                {/* Issue */}
                {product && (
                  <select
                    value={issue}
                    onChange={e => setIssue(e.target.value)}
                    required
                    className="premium-select"
                    style={{ width: '100%' }}
                  >
                    <option value="">-- Select Issue --</option>
                    {getIssues(product).map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                )}
              </div>
            )}

            {/* Installation details */}
            {bookingType === 'Installation' && (
              <input
                type="number"
                min="1"
                placeholder="Number of cameras"
                value={numCameras}
                onChange={e => setNumCameras(e.target.value)}
                required
                className="input-field"
                style={{ width: '100%' }}
              />
            )}

            {/* Notes */}
            <textarea
              rows={3}
              placeholder={bookingType === 'Service' ? 'Additional notes (optional)…' : 'Installation description (optional)…'}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-field"
              style={{ width: '100%', resize: 'vertical' }}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '16px', fontSize: '1rem', fontWeight: 700, borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              {submitting ? 'Creating…' : (<><CheckCircle size={20} /> Create Booking</>)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
