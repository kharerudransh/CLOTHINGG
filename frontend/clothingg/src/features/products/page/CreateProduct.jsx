import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { ScrollReveal } from '@/components/core/scroll-reveal';
import toast from 'react-hot-toast';

const MAX_IMAGES = 7;
const MAX_FILE_SIZE_MB = 5;

const CreateProduct = () => {
  const navigate = useNavigate();
  const { handleCreateProduct } = useProduct();
  const loading = useSelector((state) => state.product?.loading || false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('INR');
  const [images, setImages] = useState([]); // Array of { id, file, preview }
  const [isDragOver, setIsDragOver] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const fileInputRef = useRef(null);

  // ── Image Handling ──
  const processFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    if (fileArray.length === 0) return;

    if (images.length + fileArray.length > MAX_IMAGES) {
      toast.error(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const validFiles = [];
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not an image file.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
        continue;
      }
      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);
      setFieldErrors((prev) => ({ ...prev, images: null }));
    }
  };

  const handleFileInputChange = (e) => {
    processFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (idToRemove) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === idToRemove);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((img) => img.id !== idToRemove);
    });
  };

  // ── Validation ──
  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Product title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!priceAmount || Number(priceAmount) <= 0) errors.priceAmount = 'Enter a valid price amount';
    if (images.length === 0) errors.images = 'At least one product image is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Form Submission ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please complete all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('priceAmount', priceAmount);
    formData.append('priceCurrency', priceCurrency);

    images.forEach((imgObj) => {
      formData.append('images', imgObj.file);
    });

    const result = await handleCreateProduct(formData);
    if (result) {
      toast.success('Product created successfully!');
      // Clean up object URLs
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      navigate('/see-products');
    }
  };

  // Price Display Helper
  const formattedPreviewPrice = () => {
    if (!priceAmount || isNaN(priceAmount)) return null;
    const symbol = priceCurrency === 'INR' ? '₹' : '$';
    return `${symbol} ${Number(priceAmount).toLocaleString(priceCurrency === 'INR' ? 'en-IN' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f5f3f0] py-8 sm:py-12 px-4 sm:px-6 lg:px-12 font-[Montserrat] text-[#1a1a1a]">
      <div className="max-w-6xl mx-auto">

        {/* ── Top Bar / Navigation ── */}
        <ScrollReveal delay={0.05} y={15}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-[#e8e2da]">
            <div>
              <Link
                to="/seller-home"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#9b8f82] hover:text-[#1a1a1a] transition-colors uppercase mb-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="font-[Cormorant_Garamond] text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#1a1a1a]">
                New Collection Piece
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffffff] border border-[#e8e2da] text-[11px] font-semibold tracking-wider text-[#a07850] uppercase shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#c8a882] animate-pulse" />
                Draft Mode
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Main Layout: 2 Columns on Desktop ── */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ════ LEFT COLUMN: Product Details ════ */}
          <div className="lg:col-span-7 space-y-8">

            {/* 1. Title Input Card */}
            <ScrollReveal delay={0.1} y={20}>
              <div className="bg-[#ffffff] border border-[#e8e2da] p-6 sm:p-8 rounded-none shadow-xs hover:border-[#c8a882] transition-colors duration-300">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="product-title" className="block text-xs font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">
                    Product Title <span className="text-[#a07850]">*</span>
                  </label>
                  <span className="text-[10px] tracking-wider text-[#9b8f82]">
                    {title.length}/100
                  </span>
                </div>
                <input
                  id="product-title"
                  type="text"
                  maxLength={100}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: null }));
                  }}
                  placeholder="e.g. Silk Cache-Cœur Blazer in Champagne"
                  className={`w-full bg-[#f9f8f6] border ${
                    fieldErrors.title ? 'border-red-500' : 'border-[#e8e2da]'
                  } px-4 py-3.5 font-[Cormorant_Garamond] text-xl sm:text-2xl text-[#1a1a1a] placeholder:text-[#b0a898] focus:outline-hidden focus:border-[#a07850] focus:bg-[#ffffff] transition-all duration-200`}
                />
                {fieldErrors.title && (
                  <p className="mt-2 text-xs text-red-600 font-medium">{fieldErrors.title}</p>
                )}
                <p className="mt-2 text-[11.5px] text-[#7a7269] leading-relaxed">
                  Use descriptive, elegant names including fabric or style signature.
                </p>
              </div>
            </ScrollReveal>

            {/* 2. Price & Currency Card */}
            <ScrollReveal delay={0.15} y={20}>
              <div className="bg-[#ffffff] border border-[#e8e2da] p-6 sm:p-8 rounded-none shadow-xs hover:border-[#c8a882] transition-colors duration-300">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">
                    Valuation & Pricing <span className="text-[#a07850]">*</span>
                  </label>
                  {formattedPreviewPrice() && (
                    <span className="text-xs font-semibold text-[#a07850] bg-[#f5f3f0] px-3 py-1 border border-[#e8e2da]">
                      {formattedPreviewPrice()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Currency Selector */}
                  <div className="sm:col-span-5">
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#9b8f82] mb-2">
                      Currency
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-[#f5f3f0] border border-[#e8e2da]">
                      <button
                        type="button"
                        onClick={() => setPriceCurrency('INR')}
                        className={`py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          priceCurrency === 'INR'
                            ? 'bg-[#1a1a1a] text-[#c8a882] shadow-sm'
                            : 'text-[#7a7269] hover:text-[#1a1a1a]'
                        }`}
                      >
                        ₹ INR
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceCurrency('USD')}
                        className={`py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                          priceCurrency === 'USD'
                            ? 'bg-[#1a1a1a] text-[#c8a882] shadow-sm'
                            : 'text-[#7a7269] hover:text-[#1a1a1a]'
                        }`}
                      >
                        $ USD
                      </button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="sm:col-span-7">
                    <label htmlFor="price-amount" className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#9b8f82] mb-2">
                      Amount ({priceCurrency})
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-[Cormorant_Garamond] text-xl text-[#9b8f82] font-semibold">
                        {priceCurrency === 'INR' ? '₹' : '$'}
                      </span>
                      <input
                        id="price-amount"
                        type="number"
                        min="0"
                        step="any"
                        value={priceAmount}
                        onChange={(e) => {
                          setPriceAmount(e.target.value);
                          if (fieldErrors.priceAmount) setFieldErrors((p) => ({ ...p, priceAmount: null }));
                        }}
                        placeholder="0.00"
                        className={`w-full bg-[#f9f8f6] border ${
                          fieldErrors.priceAmount ? 'border-red-500' : 'border-[#e8e2da]'
                        } pl-10 pr-4 py-3 font-[Montserrat] text-lg font-semibold text-[#1a1a1a] placeholder:text-[#b0a898] focus:outline-hidden focus:border-[#a07850] focus:bg-[#ffffff] transition-all duration-200`}
                      />
                    </div>
                    {fieldErrors.priceAmount && (
                      <p className="mt-2 text-xs text-red-600 font-medium">{fieldErrors.priceAmount}</p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 3. Description Card */}
            <ScrollReveal delay={0.2} y={20}>
              <div className="bg-[#ffffff] border border-[#e8e2da] p-6 sm:p-8 rounded-none shadow-xs hover:border-[#c8a882] transition-colors duration-300">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="product-description" className="block text-xs font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">
                    Description & Details <span className="text-[#a07850]">*</span>
                  </label>
                  <span className="text-[10px] tracking-wider text-[#9b8f82]">
                    {description.length} chars
                  </span>
                </div>
                <textarea
                  id="product-description"
                  rows={6}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: null }));
                  }}
                  placeholder="Detail the silhouette, fabric composition (e.g. 100% Italian Mulberry Silk), sizing guidance, care instructions, and craftsmanship..."
                  className={`w-full bg-[#f9f8f6] border ${
                    fieldErrors.description ? 'border-red-500' : 'border-[#e8e2da]'
                  } px-4 py-3.5 text-xs sm:text-sm text-[#1a1a1a] leading-relaxed placeholder:text-[#b0a898] focus:outline-hidden focus:border-[#a07850] focus:bg-[#ffffff] transition-all duration-200 resize-y min-h-[140px]`}
                />
                {fieldErrors.description && (
                  <p className="mt-2 text-xs text-red-600 font-medium">{fieldErrors.description}</p>
                )}
              </div>
            </ScrollReveal>

            {/* 4. Action Buttons (Desktop Bottom) */}
            <ScrollReveal delay={0.25} y={15}>
              <div className="pt-2 flex items-center justify-end gap-4">
                <Link
                  to="/seller-home"
                  className="px-6 py-4 text-xs font-bold tracking-[0.2em] text-[#7a7269] hover:text-[#1a1a1a] uppercase transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-10 py-4 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold tracking-[0.22em] uppercase transition-all duration-300 flex items-center gap-3 cursor-pointer hover:bg-[#a07850] hover:text-[#1a1a1a] shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <span>Publish Listing</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </ScrollReveal>

          </div>


          {/* ════ RIGHT COLUMN: Image Upload Gallery (Max 7) ════ */}
          <div className="lg:col-span-5 space-y-6">

            <ScrollReveal delay={0.15} y={20}>
              <div className="bg-[#ffffff] border border-[#e8e2da] p-6 sm:p-8 rounded-none shadow-xs sticky top-24">
                
                {/* Header */}
                <div className="flex justify-between items-baseline mb-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#1a1a1a]">
                      Product Imagery <span className="text-[#a07850]">*</span>
                    </label>
                    <p className="text-[11px] text-[#7a7269] mt-0.5">
                      Upload high-resolution photography.
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 border ${
                    images.length === MAX_IMAGES ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-[#f5f3f0] text-[#a07850] border-[#e8e2da]'
                  }`}>
                    {images.length} / {MAX_IMAGES}
                  </span>
                </div>

                {fieldErrors.images && (
                  <p className="mb-4 text-xs text-red-600 font-medium">{fieldErrors.images}</p>
                )}

                {/* Dropzone */}
                {images.length < MAX_IMAGES && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                      isDragOver
                        ? 'border-[#a07850] bg-[#fdfbf7] scale-[1.01]'
                        : 'border-[#e8e2da] bg-[#f9f8f6] hover:border-[#c8a882] hover:bg-[#ffffff]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f5f3f0] border border-[#e8e2da] flex items-center justify-center text-[#a07850]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>

                    <p className="text-xs font-bold uppercase tracking-wider text-[#1a1a1a] mb-1">
                      Drag & Drop Images Here
                    </p>
                    <p className="text-[11px] text-[#9b8f82] mb-3">
                      or click to browse from device
                    </p>
                    <span className="inline-block text-[10px] tracking-widest text-[#a07850] uppercase font-semibold border-b border-[#a07850] pb-0.5">
                      JPG, PNG, WEBP (Max {MAX_FILE_SIZE_MB}MB each)
                    </span>
                  </div>
                )}

                {/* Image Previews Grid */}
                {images.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#9b8f82]">
                      Uploaded Previews ({images.length})
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {images.map((img, idx) => (
                        <div
                          key={img.id}
                          className="group relative aspect-[3/4] bg-[#1a1a1a] overflow-hidden border border-[#e8e2da] transition-transform duration-300 hover:shadow-md"
                        >
                          <img
                            src={img.preview}
                            alt={`Product view ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          />

                          {/* Cover Badge for first image */}
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#1a1a1a] text-[#c8a882] text-[9px] font-bold uppercase tracking-widest border border-[#c8a882]">
                              Cover
                            </span>
                          )}

                          {/* Index Badge */}
                          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9.5px] font-semibold">
                            #{idx + 1}
                          </span>

                          {/* Delete Button Overlay */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(img.id);
                            }}
                            title="Remove image"
                            className="absolute top-2 right-2 p-1.5 bg-red-950/80 text-white rounded-full opacity-90 sm:opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 cursor-pointer"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}

                      {/* Empty Placeholder Slots if under MAX_IMAGES */}
                      {Array.from({ length: Math.max(0, MAX_IMAGES - images.length) }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-[3/4] border border-dashed border-[#e8e2da] bg-[#fcfbf9] flex flex-col items-center justify-center text-[#c8a882] hover:border-[#c8a882] cursor-pointer transition-colors"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          <span className="text-[9.5px] tracking-wider uppercase text-[#9b8f82] mt-1 font-medium">
                            Slot {images.length + i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editorial Guidelines */}
                <div className="mt-6 pt-5 border-t border-[#e8e2da] space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#a07850]">
                    ✦ Presentation Tips
                  </p>
                  <ul className="text-[11px] text-[#7a7269] space-y-1 list-disc list-inside leading-relaxed">
                    <li>First image becomes the main catalog cover.</li>
                    <li>Use natural, indirect lighting for true fabric colors.</li>
                    <li>Include close-ups of stitching, textures, and labels.</li>
                  </ul>
                </div>

              </div>
            </ScrollReveal>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateProduct;