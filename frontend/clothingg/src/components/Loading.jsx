import React, { useEffect, useRef } from 'react';

/* ─── keyframe injection (runs once) ─── */
const STYLE_ID = 'clothingg-loader-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes cl-bar {
      0%, 100% { transform: scaleY(0.25); opacity: 0.3; }
      50%       { transform: scaleY(1);    opacity: 1;   }
    }
    @keyframes cl-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0);   }
    }
    @keyframes cl-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes cl-pulse-ring {
      0%   { transform: scale(0.85); opacity: 0.6; }
      50%  { transform: scale(1.08); opacity: 0.15; }
      100% { transform: scale(0.85); opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
}

const BAR_COUNT  = 5;
const BAR_DELAY  = 0.12; // seconds between each bar

const Loading = () => {
  useEffect(() => { injectStyles(); }, []);

  return (
    <div
      style={{
        display        : 'flex',
        flexDirection  : 'column',
        alignItems     : 'center',
        justifyContent : 'center',
        gap            : '28px',
        animation      : 'cl-fade-in 400ms cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      {/* ── pulsing ring behind bars ── */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position     : 'absolute',
            width        : '64px',
            height       : '64px',
            borderRadius : '50%',
            border       : '1px solid rgba(160,120,80,0.25)',
            animation    : 'cl-pulse-ring 2s ease-in-out infinite',
          }}
        />

        {/* ── staggered bars ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '36px' }}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <span
              key={i}
              style={{
                display        : 'block',
                width          : '3px',
                height         : '100%',
                borderRadius   : '2px',
                background     : i === Math.floor(BAR_COUNT / 2) ? '#a07850' : '#1a1a1a',
                transformOrigin: 'center',
                animation      : `cl-bar 1s ease-in-out infinite`,
                animationDelay : `${i * BAR_DELAY}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ── shimmer wordmark ── */}
      <p
        style={{
          fontFamily  : 'Montserrat, sans-serif',
          fontSize    : '11px',
          fontWeight  : 700,
          letterSpacing: '0.38em',
          textTransform: 'uppercase',
          background  : 'linear-gradient(90deg, #9b8f82 0%, #1a1a1a 40%, #a07850 60%, #9b8f82 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor : 'transparent',
          backgroundClip: 'text',
          animation   : 'cl-shimmer 2.2s linear infinite',
          userSelect  : 'none',
        }}
      >
        CLOTHINGG
      </p>
    </div>
  );
};

export default Loading;