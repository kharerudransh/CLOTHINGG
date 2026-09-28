import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';
import { Link } from 'react-router-dom';

/* ── icons ── */
const Ico = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const MailIcon    = () => <Ico d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />;
const PhoneIcon   = () => <Ico d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.09 6.09l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />;
const UserIcon    = () => <Ico d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const ShieldIcon  = () => <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const StoreIcon   = () => <Ico d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const BoxIcon     = () => <Ico d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />;
const TrendIcon   = () => <Ico d="M22 7l-8.5 8.5-5-5L1 18M16 7h6v6" />;
const MapPinIcon  = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const SPRING = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ── inject keyframes once ── */
const injectStyles = () => {
  if (document.getElementById('seller-profile-anim')) return;
  const s = document.createElement('style');
  s.id = 'seller-profile-anim';
  s.textContent = `
    @keyframes sp-fadeUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes sp-shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }
    .sp-skeleton {
      background: linear-gradient(90deg,#f0ece7 25%,#e8e2da 50%,#f0ece7 75%);
      background-size: 800px 100%;
      animation: sp-shimmer 1.4s infinite linear;
    }
  `;
  document.head.appendChild(s);
};

/* ── stat card ── */
const StatCard = ({ label, value, icon, accent = '#a07850', delay = 0, to }) => {
  const inner = (
    <div style={{
      background: '#fff', border: '1px solid #e8e2da', padding: '22px 20px',
      display: 'flex', alignItems: 'center', gap: '14px',
      animation: `sp-fadeUp 480ms ${SPRING} ${delay}ms both`,
      transition: 'box-shadow 200ms ease, border-color 200ms ease',
      cursor: to ? 'pointer' : 'default',
    }}
    onMouseEnter={e => { if (to) { e.currentTarget.style.borderColor = '#d4cdc5'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e2da'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        width: '42px', height: '42px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
        background: `${accent}18`, border: `1px solid ${accent}33`, color: accent,
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', lineHeight: 1, marginBottom: '5px', fontFamily: '"Cormorant Garamond", Georgia, serif' }}>{value}</p>
        <p style={{ fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9b8f82' }}>{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
};

/* ── info row ── */
const InfoRow = ({ icon, label, value, mono = false }) =>
  value ? (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '13px 0', borderBottom: '1px solid #f0ece7' }}>
      <span style={{ color: '#a07850', marginTop: '1px', flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b0a898', marginBottom: '3px' }}>{label}</p>
        <p style={{ fontSize: '13px', color: '#1a1a1a', fontFamily: mono ? 'monospace' : 'inherit', letterSpacing: mono ? '0.06em' : 'normal' }}>{value}</p>
      </div>
    </div>
  ) : null;

/* ── section wrapper ── */
const Section = ({ title, subtitle, action, children, delay = 0 }) => (
  <div style={{ background: '#fff', border: '1px solid #e8e2da', animation: `sp-fadeUp 480ms ${SPRING} ${delay}ms both` }}>
    <div style={{ padding: '18px 24px', borderBottom: '1px solid #e8e2da', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1a1a1a', marginBottom: '2px' }}>{title}</p>
        {subtitle && <p style={{ fontSize: '11px', color: '#9b8f82' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
    <div style={{ padding: '0 24px 8px' }}>{children}</div>
  </div>
);

/* ── quick action button ── */
const QuickAction = ({ label, sublabel, to, icon, delay = 0 }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
      border: '1px solid #e8e2da', background: '#fff', cursor: 'pointer',
      transition: 'border-color 180ms ease, background 180ms ease',
      animation: `sp-fadeUp 480ms ${SPRING} ${delay}ms both`,
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8a882'; e.currentTarget.style.background = '#fdf9f5'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e2da'; e.currentTarget.style.background = '#fff'; }}
    >
      <div style={{ width: '36px', height: '36px', background: '#f5f3f0', border: '1px solid #e0d9d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a07850', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.02em' }}>{label}</p>
        <p style={{ fontSize: '10.5px', color: '#9b8f82', marginTop: '2px' }}>{sublabel}</p>
      </div>
      <svg style={{ marginLeft: 'auto', color: '#c8bfb5' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
  </Link>
);

/* ══════════════════════════════════════════════════ */
const SellerProfile = () => {
  const { handleUserProfile } = useAuth();
  const user    = useSelector(s => s.auth?.user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    injectStyles();
    handleUserProfile().finally(() => setReady(true));
  }, []);

  const firstName = user?.firstName || '';
  const lastName  = user?.lastName  || '';
  const initials  = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '??';
  const fullName  = `${firstName} ${lastName}`.trim() || 'Seller';
  const joinDate  = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const addr = user?.address;

  /* skeleton */
  if (!user && !ready) return (
    <div style={{ padding: '32px 28px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif' }}>
      <div className="sp-skeleton" style={{ height: '130px', marginBottom: '20px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[1,2,3].map(i => <div key={i} className="sp-skeleton" style={{ height: '86px' }} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[1,2].map(i => <div key={i} className="sp-skeleton" style={{ height: '200px' }} />)}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px 28px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Montserrat, sans-serif', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── HERO ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2520 100%)',
        padding: '36px 32px', display: 'flex', alignItems: 'center', gap: '28px',
        animation: `sp-fadeUp 480ms ${SPRING} 0ms both`,
      }}>
        {/* grain overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.035,
          backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
          backgroundSize: '8px 8px', pointerEvents: 'none' }} />
        {/* amber top-bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#a07850,#c8a882,#a07850)' }} />

        {/* avatar */}
        <div style={{
          width: '78px', height: '78px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #a07850, #7a5c38)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontWeight: 500, color: '#fff', letterSpacing: '0.04em',
          border: '2px solid rgba(160,120,80,0.5)',
        }}>
          {initials}
        </div>

        {/* meta */}
        <div style={{ flex: 1, minWidth: 0, color: '#fff' }}>
          <p style={{ fontSize: '9.5px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a07850', marginBottom: '6px' }}>
            Seller Account
          </p>
          <h1 style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontSize: '30px', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: '10px' }}>
            {fullName}
          </h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 10px', fontSize: '9.5px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, background: 'rgba(160,120,80,0.25)', border: '1px solid rgba(160,120,80,0.5)', color: '#c8a882', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <StoreIcon /> Verified Seller
            </span>
            {user?.isVerified && (
              <span style={{ padding: '3px 10px', fontSize: '9.5px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldIcon /> Email Verified
              </span>
            )}
          </div>
        </div>

        {/* joined */}
        <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>
          <p style={{ fontSize: '9.5px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Selling since</p>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{joinDate}</p>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <StatCard label="Listed Products" value="—" delay={70}  accent="#a07850" to="/see-products"
          icon={<BoxIcon />}/>
        <StatCard label="Total Sales"     value="—" delay={130} accent="#7a5c38"
          icon={<TrendIcon />}/>
        <StatCard label="Store Views"     value="—" delay={190} accent="#9b8f82"
          icon={<StoreIcon />}/>
      </div>

      {/* ── INFO GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Personal Info */}
        <Section title="Account Details" subtitle="Your seller information" delay={120}>
          <InfoRow icon={<UserIcon />}   label="Full Name"      value={fullName} />
          <InfoRow icon={<MailIcon />}   label="Email Address"  value={user?.email} mono />
          <InfoRow icon={<PhoneIcon />}  label="Contact Number" value={user?.contactNo} mono />
          <div style={{ padding: '13px 0' }}>
            <p style={{ fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b0a898', marginBottom: '8px' }}>Verification Status</p>
            <span style={{
              padding: '4px 10px', fontSize: '9.5px', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, display: 'inline-block',
              background: user?.isVerified ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${user?.isVerified ? '#bbf7d0' : '#fecaca'}`,
              color: user?.isVerified ? '#16a34a' : '#dc2626',
            }}>
              {user?.isVerified ? '✓ Email Verified' : '✗ Not Verified'}
            </span>
          </div>
        </Section>

        {/* Address */}
        <Section title="Business Address" subtitle="Your shipping & contact address" delay={180}>
          {addr ? (
            <>
              <InfoRow icon={<MapPinIcon />} label="Address Line 1" value={addr.line1} />
              {addr.line2 && <InfoRow icon={<MapPinIcon />} label="Address Line 2" value={addr.line2} />}
              <InfoRow icon={<MapPinIcon />} label="City"    value={addr.city} />
              <InfoRow icon={<MapPinIcon />} label="State"   value={addr.state} />
              <InfoRow icon={<MapPinIcon />} label="Pincode" value={addr.pincode} mono />
            </>
          ) : (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <MapPinIcon />
              <p style={{ fontSize: '12px', color: '#9b8f82', marginTop: '10px', lineHeight: 1.6 }}>
                No address on file.
              </p>
            </div>
          )}
        </Section>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <Section title="Quick Actions" subtitle="Jump to your seller tools" delay={240}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '8px', paddingBottom: '8px' }}>
          <QuickAction to="/add-product"  label="List New Product"  sublabel="Add a product to your store" delay={260}
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>}
          />
          <QuickAction to="/see-products" label="View My Products"  sublabel="Manage all your listings"    delay={300}
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
          />
        </div>
      </Section>

    </div>
  );
};

export default SellerProfile;
