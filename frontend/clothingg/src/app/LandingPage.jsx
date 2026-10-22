import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ── MINIMALIST LUXURY ICONS ──
const ArrowUpRight = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
);

const DiamondIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.42 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.42 0Z" />
  </svg>
);

const SparkleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

// ── FULL-BLEED 3D ROYAL MULTI-COLOR SILK CANVAS ──
// Rich Royal Palette: Imperial Gold, Royal Amethyst/Rose, Celestial Sapphire Azure
const RoyalSilkBackgroundCanvas = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Robust width & height with fallbacks so canvas is never 0x0
    const getDims = () => ({
      width: container.clientWidth || window.innerWidth,
      height: container.clientHeight || window.innerHeight,
    });

    let { width, height } = getDims();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Explicit absolute layout on the canvas element
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // Large high-density cloth plane
    const segX = 96;
    const segY = 84;
    const geometry = new THREE.PlaneGeometry(11.5, 8.2, segX, segY);
    const pos = geometry.attributes.position;
    const basePositions = pos.array.slice();

    // High-chroma Royal Gold & Iridescent Satin Material
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xdfb06c, // Rich royal champagne gold base
      emissive: 0x2e1b12, // Warm bronze shadow in folds
      roughness: 0.22,
      metalness: 0.42,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
      reflectivity: 0.95,
      sheen: 1.0,
      sheenRoughness: 0.28,
      sheenColor: 0xffd166, // Gleaming imperial gold sheen
      iridescence: 0.85, // Vibrant royal prism shimmer
      iridescenceIOR: 1.45,
      iridescenceThicknessRange: [150, 650],
      side: THREE.DoubleSide,
    });

    const silkMesh = new THREE.Mesh(geometry, material);
    silkMesh.rotation.x = -0.36;
    silkMesh.rotation.y = 0.06;
    scene.add(silkMesh);

    // ── VIBRANT ROYAL MULTI-COLOR LIGHTING ──
    // 1. Ambient Warmth (Deep bronze-rose undertone)
    const ambientLight = new THREE.AmbientLight(0xfff0dd, 1.4);
    scene.add(ambientLight);

    // 2. Imperial Royal Gold Key Light (Gleaming from Top-Right)
    const royalGoldLight = new THREE.DirectionalLight(0xffb703, 4.5);
    royalGoldLight.position.set(7, 6, 5);
    scene.add(royalGoldLight);

    // 3. Royal Amethyst & Velvet Rose (Vibrant Left Rim)
    const royalRoseLight = new THREE.DirectionalLight(0xd81159, 3.8);
    royalRoseLight.position.set(-7, -2, 4);
    scene.add(royalRoseLight);

    // 4. Celestial Sapphire & Azure Shimmer (Bottom Deep Fill)
    const royalAzureLight = new THREE.DirectionalLight(0x0096c7, 3.4);
    royalAzureLight.position.set(3, -6, 3.5);
    scene.add(royalAzureLight);

    // 5. Opalescent Diamond Center Shimmer
    const diamondLight = new THREE.PointLight(0xffffff, 2.5, 12);
    diamondLight.position.set(0, 3, 5);
    scene.add(diamondLight);

    // ── FLOATING GILDED ROYAL STARDUST PARTICLES ──
    const dustCount = 95;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 14;
      dustPositions[i + 1] = (Math.random() - 0.5) * 9;
      dustPositions[i + 2] = (Math.random() - 0.5) * 5;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffd166,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // Dynamic mouse parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let curMouseX = 0;
    let curMouseY = 0;

    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      targetMouseX = (x - 0.5) * 2;
      targetMouseY = (y - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const dims = getDims();
      camera.aspect = dims.width / dims.height;
      camera.updateProjectionMatrix();
      renderer.setSize(dims.width, dims.height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const t = clock.getElapsedTime();

      // Smooth mouse damping
      curMouseX += (targetMouseX - curMouseX) * 0.045;
      curMouseY += (targetMouseY - curMouseY) * 0.045;

      // Realistic deep undulating silk wave calculations
      const array = pos.array;
      for (let i = 0; i < array.length; i += 3) {
        const u = basePositions[i];
        const v = basePositions[i + 1];

        // Complex cascading silk ripples
        const fold1 = Math.sin(u * 1.15 + t * 1.1) * 0.42;
        const fold2 = Math.cos(v * 1.35 + t * 0.9) * 0.32;
        const fold3 = Math.sin((u * 0.7 + v * 0.8) + t * 1.5) * 0.18;
        const mouseDisplacement = Math.exp(-((u - curMouseX * 3.8) ** 2 + (v + curMouseY * 2.8) ** 2) * 0.3) * 0.45;

        array[i + 2] = fold1 + fold2 + fold3 + mouseDisplacement;
      }
      pos.needsUpdate = true;
      geometry.computeVertexNormals();

      // Gentle royal cloth sway
      silkMesh.rotation.y = 0.06 + curMouseX * 0.12;
      silkMesh.rotation.x = -0.36 - curMouseY * 0.1;

      // Dynamic dancing royal lights (creates shifting gold, amethyst, and azure refractions)
      royalGoldLight.position.x = 7 + Math.sin(t * 0.6) * 1.5;
      royalRoseLight.position.y = -2 + Math.cos(t * 0.5) * 1.6;
      royalAzureLight.position.x = 3 + Math.cos(t * 0.7) * 1.4;

      dustParticles.rotation.y = t * 0.02;

      renderer.render(scene, camera);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('collector'); // 'collector' | 'atelier'
  const [selectedFabric, setSelectedFabric] = useState(0);

  // Haute Couture Fabrics
  const fabricSwatches = [
    { name: "Mulberry Silk Satin", origin: "Kyoto Heritage Mills", weight: "19 Momme", sheen: "Pearlescent Gold" },
    { name: "Raw Okayama Selvedge", origin: "Okayama, Japan", weight: "16.5 Oz", sheen: "Matte Deep Indigo" },
    { name: "Brushed Italian Mohair", origin: "Biella Atelier", weight: "420 GSM", sheen: "Feathery Rose Luster" },
    { name: "High-Twist Wool Gabardine", origin: "Yorkshire Loom", weight: "380 GSM", sheen: "Crisp Royal Drape" }
  ];

  // Runway Editorial Drops
  const runwayDrops = [
    {
      id: 1,
      title: "Sculpted Wool Cocoon Coat",
      atelier: "Maison Vaneau",
      price: "₹18,500",
      edition: "Edition of 25",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=900&auto=format&fit=crop",
      category: "Outerwear"
    },
    {
      id: 2,
      title: "Pleated Organza Trench Dress",
      atelier: "Sora Studios",
      price: "₹14,200",
      edition: "Runway Release",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=900&auto=format&fit=crop",
      category: "Dresses"
    },
    {
      id: 3,
      title: "Artisanal Selvedge Chore Jacket",
      atelier: "Kurogane Craft",
      price: "₹11,900",
      edition: "Batch #04",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
      category: "Artisanal Denim"
    },
    {
      id: 4,
      title: "Double-Faced Cashmere Stole",
      atelier: "L'Aura Heritage",
      price: "₹22,000",
      edition: "Bespoke Order",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop",
      category: "Accessories"
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] font-sans selection:bg-[#c8a882] selection:text-[#1a1a1a] antialiased">
      {/* ── TOP EDITORIAL HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#faf8f5]/85 border-b border-[#e8e2da] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-24 flex items-center justify-between">
          {/* Brand Mark */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-4 cursor-pointer group"
          >
            <div className="w-10 h-10 border border-[#a07850]/50 flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-500 bg-[#f5f3f0]">
              <span className="font-serif italic text-lg text-[#a07850] -rotate-45 group-hover:rotate-0 transition-transform duration-500">C</span>
            </div>
            <div>
              <span className="font-serif tracking-[0.3em] text-xl font-medium uppercase text-[#1a1a1a] block">
                Clothingg
              </span>
              <span className="text-[8px] uppercase tracking-[0.35em] text-[#a07850] -mt-0.5 block font-semibold">
                Haute Marketplace
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-10 text-[11px] font-medium uppercase tracking-[0.22em] text-[#7a7269]">
            <a href="#atelier-drops" className="hover:text-[#a07850] transition-colors duration-200">The Collection</a>
            <a href="#dual-experience" className="hover:text-[#a07850] transition-colors duration-200">Portals</a>
            <a href="#craftsmanship" className="hover:text-[#a07850] transition-colors duration-200">Materiality</a>
            <a href="#future-labs" className="hover:text-[#a07850] transition-colors duration-200 flex items-center gap-1.5">
              <span>Roadmap</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full border border-[#a07850]/40 text-[#a07850]">Labs</span>
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/login')}
              className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#7a7269] hover:text-[#1a1a1a] transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="relative px-6 py-3 border border-[#1a1a1a] bg-[#1a1a1a] hover:bg-[#a07850] hover:border-[#a07850] text-[#f5f3f0] text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-sm"
            >
              Enter Marketplace
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION: FULL-BLEED 3D ROYAL MULTI-COLOR SILK BACKGROUND ── */}
      <section className="relative min-h-screen pt-36 pb-24 flex flex-col justify-center overflow-hidden bg-[#faf8f5]">
        {/* Full-Bleed 3D Canvas (z-0: above section background, below content z-10) */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
          <RoyalSilkBackgroundCanvas />
        </div>

        {/* Soft bottom blend to transition smoothly into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#faf8f5] to-transparent z-[1] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Grand Editorial Headline & Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-8 space-y-8"
            >
              {/* Royal Protocol Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#e8e2da] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#a07850] animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#a07850] font-semibold">
                  Autonomous Multi-Vendor Fashion Protocol
                </span>
              </div>

              {/* Majestic Headline */}
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal leading-[1.05] tracking-tight text-[#1a1a1a]">
                Where Independent <br />
                <span className="italic font-light text-[#a07850] underline decoration-[#a07850]/30 decoration-1 underline-offset-8">
                  Couture Houses
                </span> <br />
                Meet Connoisseurs.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#3d3630] font-light leading-relaxed max-w-2xl bg-white/70 backdrop-blur-md p-4 rounded-xl border border-white/80 shadow-sm">
                An architectural online sanctuary connecting vetted ateliers, streetwear visionaries, and selective collectors. Featuring dedicated buyer-seller workspaces, real-time inventory management, and direct settlement rails protected by Razorpay.
              </p>

              {/* Dual Action CTAs */}
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="group flex items-center gap-3 px-9 py-4 bg-[#1a1a1a] hover:bg-[#a07850] text-[#f5f3f0] font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-lg shadow-[#1a1a1a]/15"
                >
                  <span>Acquire Rare Pieces</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="group flex items-center gap-3 px-9 py-4 border border-[#e8e2da] hover:border-[#1a1a1a] text-[#1a1a1a] font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 bg-white/85 backdrop-blur-md shadow-sm"
                >
                  <span>Launch Your Atelier</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              {/* Quality Seals */}
              <div className="pt-8 border-t border-[#e8e2da]/80 grid grid-cols-3 gap-6 max-w-xl">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#a07850] font-semibold">Ateliers</p>
                  <p className="font-serif text-xl sm:text-2xl text-[#1a1a1a] mt-0.5 font-normal">Vetted & Direct</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#a07850] font-semibold">Transactions</p>
                  <p className="font-serif text-xl sm:text-2xl text-[#1a1a1a] mt-0.5 font-normal">Razorpay Escrow</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#a07850] font-semibold">Fulfillment</p>
                  <p className="font-serif text-xl sm:text-2xl text-[#1a1a1a] mt-0.5 font-normal">Insured Express</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Floating Haute Couture Spotlight Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="lg:col-span-4 space-y-4"
            >
              {/* Featured Drop Floating Glassmorphism Showcase */}
              <div className="rounded-2xl border border-white/90 bg-white/75 backdrop-blur-xl p-6 shadow-xl shadow-black/[0.05] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#e8e2da]/70">
                  <div className="flex items-center gap-2">
                    <SparkleIcon className="w-3.5 h-3.5 text-[#a07850]" />
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#a07850] font-semibold">Current Runway Drop</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#7a7269]">Limited 1 of 25</span>
                </div>

                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#faf8f5] border border-[#e8e2da]/50 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"
                    alt="Featured Runway Drop"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#e8e2da]/80 shadow-sm">
                    <p className="text-[9px] uppercase tracking-wider text-[#a07850] font-semibold">Sora Studios</p>
                    <p className="font-serif text-sm text-[#1a1a1a] font-normal">Pleated Organza Trench</p>
                  </div>
                  <div className="absolute top-3 right-3 bg-[#1a1a1a] text-white px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold">
                    ₹14,200
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-[#7a7269]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>In Stock • Ready to Dispatch</span>
                  </span>
                  <button 
                    onClick={() => navigate('/login')}
                    className="font-semibold text-[#a07850] hover:text-[#1a1a1a] uppercase tracking-wider text-[10px]"
                  >
                    View Details →
                  </button>
                </div>
              </div>

              {/* Interactive Silk Feedback Pill */}
              <div className="p-3.5 rounded-xl border border-white/80 bg-white/60 backdrop-blur-md flex items-center justify-between shadow-sm">
                <span className="text-[10px] font-mono text-[#7a7269]">Royal Silk Wave Physics</span>
                <span className="text-[9px] uppercase font-mono text-[#a07850] font-semibold">Move Cursor To Ripple</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO & TELEMETRY BANNER ── */}
      <section className="border-y border-[#e8e2da] bg-[#f5f3f0] py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5">
              <span className="text-[9px] uppercase tracking-[0.35em] text-[#a07850] block mb-2 font-semibold">The Manifesto</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1a1a1a] leading-relaxed">
                "Fashion is an emotional monument. We eliminate sterile algorithms and corporate brokers to honor the human hand."
              </h2>
            </div>
            <div className="md:col-span-7 grid grid-cols-3 gap-6 text-center border-t md:border-t-0 md:border-l border-[#e8e2da] pt-6 md:pt-0 md:pl-10">
              <div>
                <p className="font-serif text-3xl sm:text-4xl text-[#a07850]">1,200+</p>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#7a7269] mt-1 font-medium">Verified Designers</p>
              </div>
              <div>
                <p className="font-serif text-3xl sm:text-4xl text-[#1a1a1a]">45,000+</p>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#7a7269] mt-1 font-medium">Curated Pieces</p>
              </div>
              <div>
                <p className="font-serif text-3xl sm:text-4xl text-[#a07850]">100%</p>
                <p className="text-[9px] uppercase tracking-[0.25em] text-[#7a7269] mt-1 font-medium">Direct From Atelier</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DUAL PORTAL EXPERIENCE (COLLECTOR VS ATELIER) ── */}
      <section id="dual-experience" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#a07850] font-semibold">
              The Dual Sanctuary
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1a1a1a]">
              Two Discrete Portals. One Unified House.
            </h2>
            <p className="text-xs sm:text-sm text-[#7a7269] font-light leading-relaxed">
              Whether you are an atelier sharing your collection or a collector acquiring an heirloom, Clothingg presents a dedicated environment.
            </p>

            {/* Portal Switcher Buttons */}
            <div className="inline-flex border border-[#e8e2da] p-1 bg-white mt-6 shadow-sm">
              <button
                onClick={() => setActiveTab('collector')}
                className={`px-8 py-3 text-[10px] uppercase tracking-[0.25em] font-semibold transition-all duration-300 ${
                  activeTab === 'collector'
                    ? 'bg-[#1a1a1a] text-[#f5f3f0]'
                    : 'text-[#7a7269] hover:text-[#1a1a1a]'
                }`}
              >
                The Collector (Buyer)
              </button>
              <button
                onClick={() => setActiveTab('atelier')}
                className={`px-8 py-3 text-[10px] uppercase tracking-[0.25em] font-semibold transition-all duration-300 ${
                  activeTab === 'atelier'
                    ? 'bg-[#1a1a1a] text-[#f5f3f0]'
                    : 'text-[#7a7269] hover:text-[#1a1a1a]'
                }`}
              >
                The Atelier (Seller)
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'collector' ? (
              <motion.div
                key="collector"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
              >
                <div className="lg:col-span-5 space-y-6">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#a07850] font-semibold">01 // Collector Privilege</span>
                  <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#1a1a1a]">
                    Curated Drops & Frictionless Acquisition.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7a7269] leading-relaxed font-light">
                    Browse verified pieces from artisanal workshops. Enjoy comprehensive garment dossiers with mill origin, fabric weight, and care rituals.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      "Consolidated multi-vendor cart with single-stroke checkout",
                      "Escrow payments via Razorpay for total buyer peace of mind",
                      "White-glove order dispatch with live milestone tracking",
                      "Direct messaging with independent designers for custom inquiries"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs text-[#2b2724]">
                        <span className="w-1.5 h-1.5 bg-[#a07850]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => navigate('/register')}
                      className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#a07850] font-semibold hover:text-[#1a1a1a] transition-colors"
                    >
                      <span>Enter Buyer Sanctuary</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 border border-[#e8e2da] bg-white p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#e8e2da] pb-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#7a7269]">Collector Dashboard Preview</span>
                    <span className="text-[10px] font-mono text-[#a07850] font-semibold">Encrypted Session</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-[#e8e2da] bg-[#faf8f5] space-y-2">
                      <p className="text-[9px] uppercase tracking-wider text-[#7a7269]">Acquisition In Transit</p>
                      <p className="font-serif text-lg text-[#1a1a1a]">Double-Faced Cashmere Cape</p>
                      <p className="text-[10px] font-mono text-emerald-600">● Dispatched from Biella</p>
                    </div>
                    <div className="p-4 border border-[#e8e2da] bg-[#faf8f5] space-y-2">
                      <p className="text-[9px] uppercase tracking-wider text-[#7a7269]">Saved Ateliers</p>
                      <p className="font-serif text-lg text-[#1a1a1a]">9 Independent Labels</p>
                      <p className="text-[10px] font-mono text-[#a07850]">3 Private Drops Active</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="atelier"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
              >
                <div className="lg:col-span-5 space-y-6">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#a07850] font-semibold">02 // Atelier Studio</span>
                  <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#1a1a1a]">
                    Curate Your Brand. Reach Connoisseurs Worldwide.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#7a7269] leading-relaxed font-light">
                    A suite of tailored tools crafted for independent designers. Publish high-resolution lookbooks, monitor inventory, and receive direct bank disbursements.
                  </p>

                  <div className="space-y-3 pt-2">
                    {[
                      "Dedicated atelier command center with multi-image cloud uploads",
                      "Real-time stock controls across sizing and color variants",
                      "Automated order dispatch and courier label management",
                      "Transparent financial telemetry with instant Razorpay payouts"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs text-[#2b2724]">
                        <span className="w-1.5 h-1.5 bg-[#a07850]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => navigate('/register')}
                      className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#a07850] font-semibold hover:text-[#1a1a1a] transition-colors"
                    >
                      <span>Apply For Atelier License</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 border border-[#e8e2da] bg-white p-8 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#e8e2da] pb-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#7a7269]">Atelier Studio Preview</span>
                    <span className="text-[10px] font-mono text-[#a07850] font-semibold">Verified Vendor #894</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border border-[#e8e2da] bg-[#faf8f5] space-y-1">
                      <p className="text-[8px] uppercase tracking-wider text-[#7a7269]">Season Revenue</p>
                      <p className="font-serif text-xl text-[#a07850] font-semibold">₹6,40,000</p>
                    </div>
                    <div className="p-4 border border-[#e8e2da] bg-[#faf8f5] space-y-1">
                      <p className="text-[8px] uppercase tracking-wider text-[#7a7269]">Active Drops</p>
                      <p className="font-serif text-xl text-[#1a1a1a]">38 Pieces</p>
                    </div>
                    <div className="p-4 border border-[#e8e2da] bg-[#faf8f5] space-y-1">
                      <p className="text-[8px] uppercase tracking-wider text-[#7a7269]">Dispatch Rate</p>
                      <p className="font-serif text-xl text-emerald-600">99.4%</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── RUNWAY EDITORIAL DROPS ── */}
      <section id="atelier-drops" className="py-24 bg-[#f5f3f0] border-t border-[#e8e2da]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[9px] uppercase tracking-[0.35em] text-[#a07850] font-semibold block mb-2">
                Curated Runway
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1a1a1a]">
                Featured Atelier Collections.
              </h2>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#7a7269] hover:text-[#a07850] transition-colors font-medium"
            >
              <span>Explore All Pieces</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {runwayDrops.map((drop) => (
              <div
                key={drop.id}
                className="group border border-[#e8e2da] bg-white overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-500"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#faf8f5]">
                  <img
                    src={drop.image}
                    alt={drop.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 border border-[#e8e2da]">
                    <span className="text-[9px] uppercase tracking-[0.2em] font-mono text-[#a07850] font-semibold">
                      {drop.edition}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-[#a07850] font-medium">
                      {drop.atelier}
                    </p>
                    <h3 className="font-serif text-lg text-[#1a1a1a] group-hover:text-[#a07850] transition-colors mt-1 font-normal">
                      {drop.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#e8e2da]">
                    <span className="font-serif text-lg text-[#1a1a1a] font-medium">
                      {drop.price}
                    </span>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 border border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#f5f3f0] text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300"
                    >
                      Acquire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE CRAFTSMANSHIP: FABRICS & MILLS LAB ── */}
      <section id="craftsmanship" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[9px] uppercase tracking-[0.35em] text-[#a07850] font-semibold">
                Haute Materiality
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1a1a1a]">
                Obsessive Fabric Integrity.
              </h2>
              <p className="text-xs sm:text-sm text-[#7a7269] font-light leading-relaxed">
                Garments on Clothingg undergo transparent fiber profiling. Every seller discloses weaving origins, yarn count, and structural drape.
              </p>

              {/* Swatch Selector */}
              <div className="space-y-3 pt-4">
                {fabricSwatches.map((swatch, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedFabric(idx)}
                    className={`p-4 border cursor-pointer transition-all duration-300 flex items-center justify-between ${
                      selectedFabric === idx
                        ? 'border-[#a07850] bg-white shadow-sm'
                        : 'border-[#e8e2da] bg-[#f5f3f0] hover:border-[#a07850]/50'
                    }`}
                  >
                    <div>
                      <p className="font-serif text-base text-[#1a1a1a] font-medium">{swatch.name}</p>
                      <p className="text-[9px] uppercase tracking-wider text-[#7a7269]">{swatch.origin} • {swatch.weight}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#a07850] font-semibold">{swatch.sheen}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 border border-[#e8e2da] bg-white p-8 sm:p-12 space-y-6 shadow-sm">
              <div className="aspect-[16/10] bg-[#faf8f5] border border-[#e8e2da] flex flex-col justify-center items-center text-center p-8 relative overflow-hidden">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#a07850] font-semibold mb-2">Detailed Dossier</span>
                <h3 className="font-serif text-3xl text-[#1a1a1a] mb-2">{fabricSwatches[selectedFabric].name}</h3>
                <p className="text-xs text-[#7a7269] max-w-md font-light leading-relaxed">
                  Direct from {fabricSwatches[selectedFabric].origin}. Woven with high-density fibers to achieve a natural {fabricSwatches[selectedFabric].sheen} and lasting structural silhouette.
                </p>
                <div className="mt-6 flex items-center gap-6 text-[10px] uppercase tracking-widest text-[#7a7269]">
                  <span>Weight: {fabricSwatches[selectedFabric].weight}</span>
                  <span>•</span>
                  <span>Authenticity Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUTURE INNOVATIONS RADAR (STRICTLY FRAMED AS ROADMAP) ── */}
      <section id="future-labs" className="py-24 bg-[#f5f3f0] border-y border-[#e8e2da] relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#a07850]/40 mb-3 bg-white">
                <DiamondIcon className="w-3 h-3 text-[#a07850]" />
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#a07850] font-semibold">
                  Future Roadmap • Engineering Labs
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1a1a1a]">
                The Architecture of Tomorrow.
              </h2>
            </div>
            <p className="text-[11px] text-[#7a7269] max-w-md font-light">
              * In active research and architectural development for forthcoming releases of the Clothingg protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Neural Garment Drape Simulator",
                stage: "R&D Stage",
                phase: "Protocol Phase 4",
                desc: "Real-time physics calculation of fabric tension and body movement to simulate exact garment fit on personalized silhouettes prior to order placement."
              },
              {
                title: "Atelier Demand Forecasting",
                stage: "Architecture",
                phase: "Protocol Phase 4",
                desc: "Predictive micro-trend analytics enabling independent ateliers to execute zero-waste production batches and prevent deadstock."
              },
              {
                title: "Fiber Authenticity Verifier",
                stage: "Conceptual Lab",
                phase: "Protocol Phase 5",
                desc: "High-resolution macro-optical scanning for instant verification of yarn composition, thread density, and organic certifications."
              }
            ].map((item, i) => (
              <div key={i} className="p-8 border border-[#e8e2da] bg-white space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#a07850] uppercase font-semibold">{item.phase}</span>
                  <span className="text-[#7a7269]">● {item.stage}</span>
                </div>
                <h3 className="font-serif text-2xl text-[#1a1a1a] font-normal">{item.title}</h3>
                <p className="text-xs text-[#7a7269] leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONVERTING EDITORIAL FOOTER & CTA ── */}
      <footer className="bg-[#faf8f5] py-24 text-xs text-[#7a7269]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center max-w-3xl mx-auto space-y-8 mb-20">
            <h2 className="font-serif text-4xl sm:text-6xl font-light text-[#1a1a1a] leading-tight">
              Begin Your Journey with <br />
              <span className="italic text-[#a07850]">Clothingg</span>.
            </h2>
            <p className="text-sm text-[#7a7269] font-light max-w-lg mx-auto">
              Curate your wardrobe with certified independent fashion or establish your label on our multi-vendor commerce rail.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 pt-2">
              <button
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-[#1a1a1a] hover:bg-[#a07850] text-[#f5f3f0] font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-md"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-10 py-4 border border-[#e8e2da] hover:border-[#1a1a1a] text-[#1a1a1a] font-semibold text-xs tracking-[0.2em] uppercase transition-all duration-300 bg-white"
              >
                Sign In To Portal
              </button>
            </div>
          </div>

          <div className="border-t border-[#e8e2da] pt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="font-serif tracking-[0.25em] text-base font-medium uppercase text-[#1a1a1a]">Clothingg</span>
              <span className="text-[#e8e2da]">|</span>
              <span className="text-[10px] uppercase tracking-widest text-[#7a7269]">MERN Architecture • Razorpay Secured</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[#9b8f82]">
              © {new Date().getFullYear()} Clothingg. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
