import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';

/* ── tiny icons ── */
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const MailIcon   = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />;
const PhoneIcon  = () => <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.09 6.09l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />;
const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const BadgeIcon  = () => <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const UserIcon   = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const ShieldIcon = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;

const SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ── stat card ── */
const StatCard = ({ label, value, icon, delay = 0 }) => (
  <div style={{
    background: '#fff', border: '1px solid #e8e2da', padding: '20px 22px',
    display: 'flex', alignItems: 'center', gap: '14px',
    animation: `fadeUp 500ms ${SPRING} ${delay}ms both`,
  }}>
    <div style={{
      width: '40px', height: '40px', background: '#f5f3f0',
      border: '1px solid #e0d9d0', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0, color: '#a07850',
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1, marginBottom: '4px' }}>{value}</p>
      <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9b8f82' }}>{label}</p>
    </div>
  </div>
);

/* ── info row ── */
const InfoRow = ({ icon, label, value, mono = false }) => (
  value ? (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '13px 0', borderBottom: '1px solid #f0ece7' }}>
      <span style={{ color: '#a07850', marginTop: '1px', flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b0a898', marginBottom: '3px' }}>{label}</p>
        <p style={{ fontSize: '13px', color: '#1a1a1a', fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '0.06em' : 'inherit' }}>{value}</p>
      </div>
    </div>
  ) : null
);

/* ── section card ── */
const Section = ({ title, subtitle, children, delay = 0 }) => (
  <div style={{
    background: '#fff', border: '1px solid #e8e2da',
    animation: `fadeUp 500ms ${SPRING} ${delay}ms both`,
  }}>
    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e8e2da' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '2px' }}>{title}</p>
      {subtitle && <p style={{ fontSize: '11px', color: '#9b8f82' }}>{subtitle}</p>}
    </div>
    <div style={{ padding: '0 24px 6px' }}>{children}</div>
  </div>
);

/* ══════════════════════════════════════════════════ */
const UserProfile = () => {
  const { handleUserProfile } = useAuth();
  const user = useSelector(s => s.auth?.user);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const load = async () => {
      await handleUserProfile();
      setFetched(true);
    };
    load();
    // inject keyframes once
    if (!document.getElementById('profile-anim')) {
      const s = document.createElement('style');
      s.id = 'profile-anim';
      s.textContent = `
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0ece7 25%, #e8e2da 50%, #f0ece7 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 2px;
        }
      `;
      document.head.appendChild(s);
    }
  }, []);

  const firstName  = user?.firstName || '';
  const lastName   = user?.lastName  || '';
  const initials   = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  const fullName   = `${firstName} ${lastName}`.trim() || 'Member';
  const isSeller   = user?.role === 'Seller';
  const joinDate   = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const addr = user?.address;
  const addressStr = addr
    ? [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')
    : null;

  /* ── skeleton while loading ── */
  if (!user && !fetched) {
    return (
      <div style={{ padding: '32px 28px', maxWidth: '860px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
        <div className="skeleton" style={{ height: '120px', marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '80px' }} />)}
        </div>
        <div className="skeleton" style={{ height: '200px' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: '860px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>

      {/* ── HERO CARD ── */}
      <div style={{
        background: '#1a1a1a', color: '#fff', padding: '36px 32px',
        display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '20px',
        position: 'relative', overflow: 'hidden',
        animation: `fadeUp 500ms ${SPRING} 0ms both`,
      }}>
        {/* subtle texture */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '8px 8px', pointerEvents: 'none' }} />

        {/* avatar */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #a07850, #c8a882)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 500, color: '#fff', letterSpacing: '0.04em',
          border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0,
        }}>
          {initials}
        </div>

        {/* name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a07850', marginBottom: '6px' }}>
            Member Profile
          </p>
          <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '28px', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: '8px' }}>
            {fullName}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px', fontSize: '9.5px', letterSpacing: '0.18em',
              textTransform: 'uppercase', fontWeight: 600,
              background: isSeller ? 'rgba(160,120,80,0.25)' : 'rgba(255,255,255,0.12)',
              border: `1px solid ${isSeller ? '#a07850' : 'rgba(255,255,255,0.2)'}`,
              color: isSeller ? '#c8a882' : 'rgba(255,255,255,0.7)',
            }}>
              {isSeller ? <BadgeIcon /> : <UserIcon />}
              {user?.role || 'Buyer'}
            </span>
            {user?.isVerified && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', fontSize: '9.5px', letterSpacing: '0.18em',
                textTransform: 'uppercase', fontWeight: 600,
                background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399',
              }}>
                <ShieldIcon /> Verified
              </span>
            )}
          </div>
        </div>

        {/* joined */}
        <div style={{ textAlign: 'right', flexShrink: 0, opacity: 0.6 }}>
          <p style={{ fontSize: '9.5px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Member since</p>
          <p style={{ fontSize: '12px', fontWeight: 500 }}>{joinDate}</p>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Orders" value="0" delay={80}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
        />
        <StatCard label="Wishlist" value="0" delay={140}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>}
        />
        <StatCard label="Reviews" value="0" delay={200}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
      </div>

      {/* ── INFO GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Personal Info */}
        <Section title="Personal Information" subtitle="Your account details" delay={120}>
          <InfoRow icon={<UserIcon />}  label="Full Name"     value={fullName} />
          <InfoRow icon={<MailIcon />}  label="Email"         value={user?.email} mono />
          <InfoRow icon={<PhoneIcon />} label="Contact"       value={user?.contactNo} mono />
          <div style={{ padding: '12px 0' }}>
            <p style={{ fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b0a898', marginBottom: '8px' }}>Account Status</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '4px 10px', fontSize: '9.5px', letterSpacing: '0.12em',
                textTransform: 'uppercase', fontWeight: 600,
                background: user?.isVerified ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${user?.isVerified ? '#bbf7d0' : '#fecaca'}`,
                color: user?.isVerified ? '#16a34a' : '#dc2626',
              }}>
                {user?.isVerified ? '✓ Email Verified' : '✗ Not Verified'}
              </span>
            </div>
          </div>
        </Section>

        {/* Delivery Address */}
        <Section title="Delivery Address" subtitle="Where your orders ship" delay={180}>
          {addr ? (
            <>
              <InfoRow icon={<MapPinIcon />} label="Address Line 1" value={addr.line1} />
              {addr.line2 && <InfoRow icon={<MapPinIcon />} label="Address Line 2" value={addr.line2} />}
              <InfoRow icon={<MapPinIcon />} label="City"    value={addr.city} />
              <InfoRow icon={<MapPinIcon />} label="State"   value={addr.state} />
              <InfoRow icon={<MapPinIcon />} label="Pincode" value={addr.pincode} mono />
            </>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <MapPinIcon />
              <p style={{ fontSize: '12px', color: '#9b8f82', marginTop: '10px', lineHeight: 1.6 }}>
                No delivery address on file.<br />
                <span style={{ fontSize: '10.5px', color: '#b0a898' }}>Register with an address to enable order delivery.</span>
              </p>
            </div>
          )}
        </Section>

      </div>

      {/* ── FULL ADDRESS BANNER (if available) ── */}
      {addressStr && (
        <div style={{
          marginTop: '16px', padding: '16px 20px',
          background: '#faf9f7', border: '1px solid #e8e2da',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: `fadeUp 500ms ${SPRING} 260ms both`,
        }}>
          <span style={{ color: '#a07850', flexShrink: 0 }}><MapPinIcon /></span>
          <div>
            <p style={{ fontSize: '9.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b0a898', marginBottom: '3px' }}>Full Delivery Address</p>
            <p style={{ fontSize: '12.5px', color: '#1a1a1a', lineHeight: 1.5 }}>{addressStr}</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;
