import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TextEffect } from '@/components/core/text-effect';
import { InfiniteSlider } from '@/components/core/infinite-slider';
import { ScrollReveal } from '@/components/core/scroll-reveal';

/* ── feature card data ── */
const features = [
  {
    num: '01',
    title: 'Effortless Listings',
    desc: 'Upload your pieces in minutes. Our guided form handles images, sizing, fabric, and pricing — so your products look magazine-worthy from day one.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
    cta: { label: 'List a product', to: '/add-product' },
  },
  {
    num: '02',
    title: 'Curated Visibility',
    desc: 'Your products appear in front of buyers who appreciate quality. Our editorial curation places refined pieces in a context that commands attention.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    cta: { label: 'See your products', to: '/see-products' },
  },
  {
    num: '03',
    title: 'Real-time Inventory',
    desc: 'Track every listing, monitor stock levels and manage your entire catalogue from a single, elegant dashboard designed for clarity.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    cta: { label: 'View inventory', to: '/see-products' },
  },
  {
    num: '04',
    title: 'Trusted by Buyers',
    desc: 'Every seller on Clothingg is verified. Buyers shop with confidence, knowing they are accessing authentic, quality-assured pieces from curated sellers.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    cta: null,
  },
];

const stats = [
  { value: '10K+', label: 'Active Buyers' },
  { value: '98%',  label: 'Seller Satisfaction' },
  { value: '3 min', label: 'Avg. Listing Time' },
  { value: '0%',   label: 'Listing Fees' },
];

/* ── card component with scroll reveal & hover state ── */
const FeatureCard = ({ feature, delay = 0 }) => {
  const [hover, setHover] = useState(false);
  return (
    <ScrollReveal delay={delay} y={32} style={{ height: '100%', display: 'flex' }}>
      <div
        style={{
          width: '100%',
          background  : hover ? '#1a1a1a' : '#ffffff',
          border      : `1px solid ${hover ? '#1a1a1a' : '#e8e2da'}`,
          padding     : '36px 32px',
          display     : 'flex',
          flexDirection: 'column',
          gap         : '18px',
          cursor      : 'default',
          transition  : 'background 300ms ease, border-color 300ms ease',
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* number */}
        <span style={{ fontSize: '10px', letterSpacing: '0.22em', color: hover ? '#c8a882' : '#9b8f82', fontWeight: 600, textTransform: 'uppercase' }}>
          {feature.num}
        </span>

        {/* icon */}
        <div style={{
          width: '52px', height: '52px',
          background: hover ? 'rgba(200,168,130,0.15)' : '#f5f3f0',
          border: `1px solid ${hover ? '#c8a882' : '#e8e2da'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: hover ? '#c8a882' : '#9b8f82',
          transition: 'background 300ms ease, border-color 300ms ease, color 300ms ease',
          flexShrink: 0,
        }}>
          {feature.icon}
        </div>

        {/* title */}
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '22px', fontWeight: 500,
          color: hover ? '#ffffff' : '#1a1a1a',
          margin: 0, lineHeight: 1.25,
          transition: 'color 300ms ease',
        }}>
          {feature.title}
        </h3>

        {/* desc */}
        <p style={{
          fontSize: '12.5px', color: hover ? '#b0a898' : '#7a7269',
          lineHeight: 1.85, margin: 0, flex: 1,
          transition: 'color 300ms ease',
        }}>
          {feature.desc}
        </p>

        {/* cta */}
        {feature.cta && (
          <Link
            to={feature.cta.to}
            style={{
              fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: hover ? '#c8a882' : '#1a1a1a',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'color 300ms ease',
            }}
          >
            {feature.cta.label}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        )}
      </div>
    </ScrollReveal>
  );
};

/* ══════════════════════════════════════════ */
const SelllerHomePage = () => {
  const user = useSelector((s) => s.auth?.user);
  const firstName = user?.firstName || 'there';

  return (
    <main style={{ fontFamily: 'Montserrat, sans-serif', background: '#f5f3f0', minHeight: 'calc(100vh - 56px)' }}>

      {/* ══ HERO ══ */}
      <section style={{
        background: '#1a1a1a',
        padding: 'clamp(64px, 10vw, 120px) clamp(20px, 6vw, 80px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* subtle gold grain overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(160,120,80,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* welcome headline — per-char blur */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(38px, 6vw, 72px)',
          fontWeight: 400,
          color: '#ffffff',
          lineHeight: 1.12,
          margin: '0 auto 24px',
          maxWidth: '760px',
        }}>
          <TextEffect per="char" preset="blur" delay={0.25} as="span">
            {`Welcome back, ${firstName}.`}
          </TextEffect>
        </h1>

        {/* subtitle — per-word fade */}
        <p style={{
          fontSize: 'clamp(13px, 1.5vw, 15px)',
          color: '#f0ece6',
          lineHeight: 1.85,
          maxWidth: '520px',
          margin: '0 auto 44px',
        }}>
          <TextEffect per="word" preset="fade" delay={0.8} as="span">
            Everything you need to list, manage and sell your collection is right here. Clothingg puts your pieces in front of buyers who truly value refined style.
          </TextEffect>
        </p>

        {/* CTAs */}
        <ScrollReveal delay={0.4} y={20}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/add-product" style={{
              padding: '15px 36px',
              background: '#c8a882', color: '#1a1a1a',
              fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'background 250ms ease, transform 250ms ease',
              display: 'inline-block',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#a07850'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#c8a882'; }}
            >
              + List a Product
            </Link>
            <Link to="/see-products" style={{
              padding: '15px 36px',
              background: 'transparent', color: '#c8a882',
              fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
              textDecoration: 'none',
              border: '1px solid #c8a882',
              transition: 'background 250ms ease, color 250ms ease',
              display: 'inline-block',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,168,130,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              View My Products
            </Link>
          </div>
        </ScrollReveal>

        {/* ── fashion model photo strip ── */}
        <ScrollReveal delay={0.5} y={30}>
          <div style={{ marginTop: '60px', position: 'relative', zIndex: 2 }}>

            {/* progressive blur — left edge */}
            <div style={{
              position: 'absolute', top: 0, left: 0,
              width: '160px', height: '100%', zIndex: 2, pointerEvents: 'none',
              background: 'linear-gradient(to right, #1a1a1a 0%, transparent 100%)',
            }} />

            {/* progressive blur — right edge */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: '160px', height: '100%', zIndex: 2, pointerEvents: 'none',
              background: 'linear-gradient(to left, #1a1a1a 0%, transparent 100%)',
            }} />

            <InfiniteSlider speed={60} speedOnHover={20} gap={24}>
              {[
                { src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=420&fit=crop', alt: 'Model in white outfit' },
                { src: 'https://images.unsplash.com/photo-1587367336516-887f58881b13?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', alt: 'Fashion editorial' },
                { src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=420&fit=crop', alt: 'Runway look' },
                { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=420&fit=crop', alt: 'Model in elegant dress' },
                { src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=420&fit=crop', alt: 'Fashion portrait' },
                { src: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=420&fit=crop', alt: 'Street fashion' },
                { src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=420&fit=crop', alt: 'Luxury shopping' },
                { src: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=300&h=420&fit=crop', alt: 'Model editorial' },
              ].map(({ src, alt }) => (
                <img
                  key={src}
                  src={src}
                  alt={alt}
                  style={{
                    width: '280px',
                    height: '400px',
                    objectFit: 'cover',
                    flexShrink: 0,
                    filter: 'brightness(0.88) contrast(1.05)',
                    transition: 'filter 300ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1) contrast(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(0.88) contrast(1.05)'}
                />
              ))}
            </InfiniteSlider>
          </div>
        </ScrollReveal>

      </section>


      {/* ══ STATS BAR ══ */}
      <section style={{
        background: '#ffffff',
        borderBottom: '1px solid #e8e2da',
        padding: '0 clamp(20px, 6vw, 80px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      }}>
        {stats.map((s, i) => (
          <ScrollReveal key={s.label} delay={i * 0.1} y={24} style={{ height: '100%' }}>
            <div style={{
              padding: '32px 20px',
              textAlign: 'center',
              borderRight: i < stats.length - 1 ? '1px solid #e8e2da' : 'none',
            }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 500, color: '#1a1a1a', margin: '0 0 6px' }}>
                {s.value}
              </p>
              <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9b8f82', margin: 0 }}>
                {s.label}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(20px, 6vw, 80px)' }}>
        {/* section header */}
        <ScrollReveal delay={0.1} y={28}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b8f82', marginBottom: '12px' }}>
              Built for Sellers
            </p>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(30px, 4vw, 48px)',
              fontWeight: 400, color: '#1a1a1a',
              margin: '0 auto 16px', maxWidth: '540px', lineHeight: 1.2,
            }}>
              Sell more. Stress less.<br />
              <em style={{ color: '#a07850', fontStyle: 'italic' }}>Look exceptional doing it.</em>
            </h2>
            <p style={{ fontSize: '13px', color: '#7a7269', maxWidth: '440px', margin: '0 auto', lineHeight: 1.8 }}>
              Clothingg gives independent sellers the tools of a luxury house —
              without the complexity.
            </p>
          </div>
        </ScrollReveal>

        {/* feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1px',
          background: '#e8e2da',
          border: '1px solid #e8e2da',
        }}>
          {features.map((f, i) => (
            <FeatureCard key={f.num} feature={f} delay={i * 0.12} />
          ))}
        </div>
      </section>

      {/* ══ PROCESS STRIP ══ */}
      <section style={{
        background: '#ffffff',
        borderTop: '1px solid #e8e2da',
        borderBottom: '1px solid #e8e2da',
        padding: 'clamp(48px, 6vw, 80px) clamp(20px, 6vw, 80px)',
      }}>
        <ScrollReveal delay={0.1} y={20}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9b8f82' }}>
              How it works
            </p>
          </div>
        </ScrollReveal>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '32px',
          maxWidth: '860px', margin: '0 auto',
        }}>
          {[
            { step: '1', title: 'Create Your Account', desc: 'Register as a seller — it takes under 2 minutes.' },
            { step: '2', title: 'List Your Pieces',    desc: 'Add photos, description, size and price.' },
            { step: '3', title: 'Reach Buyers',        desc: 'Your items appear in curated collections.' },
            { step: '4', title: 'Grow Your Store',     desc: 'Manage orders and build your brand.' },
          ].map((p, i) => (
            <ScrollReveal key={p.step} delay={i * 0.12} y={24}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '44px', height: '44px',
                  borderRadius: '50%',
                  background: '#1a1a1a', color: '#c8a882',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700,
                  margin: '0 auto 16px',
                }}>
                  {p.step}
                </div>
                <h4 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 500, color: '#1a1a1a', margin: '0 0 8px' }}>
                  {p.title}
                </h4>
                <p style={{ fontSize: '11.5px', color: '#9b8f82', lineHeight: 1.75, margin: 0 }}>
                  {p.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ══ CTA BANNER ══ */}
      <section style={{
        background: '#1a1a1a',
        padding: 'clamp(48px, 7vw, 90px) clamp(20px, 6vw, 80px)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(160,120,80,0.15) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <ScrollReveal delay={0.1} y={30}>
          <p style={{ fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c8a882', marginBottom: '16px' }}>
            Ready to grow?
          </p>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 400, color: '#ffffff',
            margin: '0 auto 32px', maxWidth: '500px', lineHeight: 1.2,
          }}>
            Your next sale is one listing away.
          </h2>
          <Link to="/add-product" style={{
            display: 'inline-block',
            padding: '16px 44px',
            background: '#c8a882', color: '#1a1a1a',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'background 250ms ease, letter-spacing 250ms ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#a07850'; e.currentTarget.style.letterSpacing = '0.28em'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#c8a882'; e.currentTarget.style.letterSpacing = '0.22em'; }}
          >
            + Add Your First Product
          </Link>
        </ScrollReveal>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e8e2da', padding: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#b0a898', margin: 0 }}>
          © {new Date().getFullYear()} CLOTHINGG · ALL RIGHTS RESERVED
        </p>
      </footer>
    </main>
  );
};

export default SelllerHomePage;