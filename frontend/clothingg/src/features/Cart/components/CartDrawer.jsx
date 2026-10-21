import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../Hooks/useCart';
import { setItems } from '../state/cart.slice';
import { useRazorpay } from "react-razorpay";

const formatPrice = (priceObj) => {
  if (!priceObj) return '—';
  const { amount, currency } = priceObj;
  const sym = currency === 'USD' ? '$' : '₹';
  const formatted = Number(amount || 0).toLocaleString(
    currency === 'USD' ? 'en-US' : 'en-IN',
    { minimumFractionDigits: 0, maximumFractionDigits: 2 }
  );
  return `${sym} ${formatted}`;
};

// Helper to safely extract the matched variant whether product.variants
// is an unwound object (from aggregation pipeline) or an array (standard populate)
const getMatchedVariant = (product, variantId) => {
  if (!product?.variants) return null;
  if (Array.isArray(product.variants)) {
    return (
      product.variants.find((v) => String(v._id) === String(variantId)) ||
      product.variants[0] ||
      null
    );
  }
  if (typeof product.variants === 'object') {
    return product.variants;
  }
  return null;
};

const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.url) return img.url;
  return null;
};

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.items || []);
  const user = useSelector((state) => state.auth?.user);
  const { handleGetCart, handleIncrementCartItem, handleDecrementCartItem, handleDelete, handleCreateOrder } = useCart();
  const [cartCurrency, setCartCurrency] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { error, isLoading, Razorpay } = useRazorpay();

  useEffect(() => {
    if (isOpen) {
      const fetchCart = async () => {
        try {
          const res = await handleGetCart();
          if (!res) return;

          // Aggregation pipeline can return { success: true, cart: { ... } } or cart: [ { ... } ]
          const cartDoc = Array.isArray(res.cart) ? res.cart[0] : res.cart;
          if (cartDoc?.items) {
            dispatch(setItems(cartDoc.items));
          } else {
            dispatch(setItems([]));
          }
          if (cartDoc?.currency) {
            setCartCurrency(cartDoc.currency);
          }
        } catch (error) {
          console.error('Error fetching cart in CartDrawer:', error);
        }
      };

      fetchCart();
    }
  }, [isOpen, dispatch]);

  // Calculate Subtotal safely supporting both aggregation and populated variants
  const subtotal = (cartItems || []).reduce((acc, item) => {
    if (!item) return acc;
    const product = typeof item.product === 'object' && item.product !== null ? item.product : {};
    const matchedVariant = getMatchedVariant(product, item.variant);
    const itemPrice =
      matchedVariant?.price?.amount ??
      item.price?.amount ??
      product.price?.amount ??
      0;
    return acc + Number(itemPrice) * Number(item.quantity || 1);
  }, 0);

  const firstMatchedVariant = getMatchedVariant(cartItems?.[0]?.product, cartItems?.[0]?.variant);
  const currency =
    cartCurrency ||
    firstMatchedVariant?.price?.currency ||
    cartItems?.[0]?.price?.currency ||
    cartItems?.[0]?.product?.price?.currency ||
    'INR';

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const order = await handleCreateOrder({
        amount: subtotal,
        currency: currency || 'INR',
        receipt: `receipt_${Date.now()}`
      });
      console.log('Order created successfully:', order);

      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        alert("Razorpay SDK is not loaded. Please try again.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TqZweCrFvr3VBS",
        amount: order?.amount || (subtotal * 100) || 50000, // Amount in paise
        currency: order?.currency || currency || "INR",
        name: "Clothingg",
        description: "Test Transaction",
        order_id: order?.id || "order_9A33XWu170gUtm", // Generate order_id on server
        handler: (response) => {
          console.log(response);
          alert("Payment Successful!");
        },
        prefill: {
          name: user?.firstName + " " + user?.lastName,
          email: user?.email,
          contact: user?.contactNo,
        },
        theme: {
          color: "#c8a882",
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed inset-0 overflow-hidden font-[Montserrat] text-[#1a1a1a]"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div className="w-screen max-w-md bg-[#ffffff] border-l border-[#e8e2da] shadow-2xl flex flex-col justify-between pointer-events-auto">
          
          {/* Header */}
          <div className="p-6 border-b border-[#e8e2da] flex items-center justify-between bg-[#faf8f5]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#a07850]" />
              <h2 className="font-[Cormorant_Garamond] text-2xl font-medium tracking-tight text-[#1a1a1a]">
                Shopping Bag
              </h2>
              <span className="px-2 py-0.5 bg-[#1a1a1a] text-[#c8a882] text-[10px] font-bold tracking-widest uppercase">
                {cartItems.length} {cartItems.length === 1 ? 'Piece' : 'Pieces'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-[#e8e2da] hover:border-[#1a1a1a] bg-white flex items-center justify-center text-[#7a7269] hover:text-[#1a1a1a] transition-colors cursor-pointer text-xs"
              title="Close bag"
            >
              ✕
            </button>
          </div>

          {/* Cart Items Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center max-w-xs mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#faf8f5] border border-[#e8e2da] flex items-center justify-center text-[#c8a882]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
                <h3 className="font-[Cormorant_Garamond] text-2xl font-medium text-[#1a1a1a] mb-2">
                  Your Bag is Empty
                </h3>
                <p className="text-xs text-[#7a7269] leading-relaxed mb-6">
                  Explore our curated seasonal collection of artisanal luxury garments.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/buyer-products');
                  }}
                  className="px-6 py-3 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#a07850] hover:text-white transition-colors cursor-pointer"
                >
                  Discover Collection
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => {
                if (!item) return null;
                const product = typeof item.product === 'object' && item.product !== null ? item.product : {};
                const matchedVariant = getMatchedVariant(product, item.variant);
                const variantId = item.variant || matchedVariant?._id;

                const itemImg =
                  getImageUrl(matchedVariant?.images?.[0]) ||
                  getImageUrl(product.images?.[0]) ||
                  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&fit=crop';

                const itemPriceObj = {
                  amount: matchedVariant?.price?.amount ?? item.price?.amount ?? product.price?.amount ?? 0,
                  currency: matchedVariant?.price?.currency || item.price?.currency || product.price?.currency || currency
                };

                let attrText = '';
                if (matchedVariant?.attributes) {
                  if (matchedVariant.attributes instanceof Map) {
                    attrText = Array.from(matchedVariant.attributes.entries())
                      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ');
                  } else if (typeof matchedVariant.attributes === 'object') {
                    attrText = Object.entries(matchedVariant.attributes)
                      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ');
                  }
                }

                return (
                  <div
                    key={item._id || `${product._id}-${variantId}` || idx}
                    className="p-3.5 border border-[#e8e2da] bg-white hover:border-[#1a1a1a] transition-all flex gap-4"
                  >
                    {/* Thumbnail */}
                    <div className="w-18 h-22 bg-[#faf8f5] border border-[#e8e2da] shrink-0 p-1 flex items-center justify-center overflow-hidden">
                      <img
                        src={itemImg}
                        alt={product.title || 'Product'}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${product._id}`}
                            onClick={onClose}
                            className="font-[Cormorant_Garamond] text-lg font-medium text-[#1a1a1a] hover:text-[#a07850] transition-colors truncate block"
                          >
                            {product.title || 'Luxury Piece'}
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete({ productId: product._id, variantId: variantId || null });
                            }}
                            className="shrink-0 w-7 h-7 rounded-full border border-[#e8e2da] hover:border-red-400 bg-white hover:bg-red-50 flex items-center justify-center text-[#9b8f82] hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove from bag"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </div>

                        {attrText && (
                          <p className="text-[10px] text-[#a07850] font-semibold tracking-wider uppercase mt-0.5">
                            {attrText}
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <span style={{ fontSize: '10.5px', color: '#7a7269' }}>Qty:</span>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e8e2da', background: '#faf8f5', borderRadius: '2px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.quantity > 1) {
                                  handleDecrementCartItem({ productId: product._id, variantId: variantId || null });
                                }
                              }}
                              disabled={item.quantity <= 1}
                              style={{
                                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'transparent', border: 'none', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                color: item.quantity <= 1 ? '#d4cfc9' : '#7a7269', fontSize: '16px', fontWeight: 600,
                                transition: 'color 150ms ease',
                              }}
                              title="Decrease quantity"
                            >
                              −
                            </button>
                            <span style={{
                              width: '32px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 700, color: '#1a1a1a',
                              borderLeft: '1px solid #e8e2da', borderRight: '1px solid #e8e2da', background: '#fff',
                            }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleIncrementCartItem({ productId: product._id, variantId: variantId || null, delta: 1 });
                              }}
                              style={{
                                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                color: '#7a7269', fontSize: '16px', fontWeight: 600,
                                transition: 'color 150ms ease',
                              }}
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-[#f5f3f0]">
                        <span className="font-[Cormorant_Garamond] text-base font-bold text-[#1a1a1a]">
                          {formatPrice(itemPriceObj)}
                        </span>
                        <span className="text-[9.5px] text-[#9b8f82] uppercase tracking-wider">
                          Subtotal: {formatPrice({ amount: (itemPriceObj.amount || 0) * (item.quantity || 1), currency: itemPriceObj.currency || currency })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[#e8e2da] bg-[#faf8f5] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#7a7269]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1a1a1a]">{formatPrice({ amount: subtotal, currency })}</span>
                </div>
                <div className="flex justify-between text-[#7a7269]">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[10px]">Complimentary</span>
                </div>
                <div className="flex justify-between text-[#7a7269]">
                  <span>Artisanal Packaging</span>
                  <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[10px]">Included</span>
                </div>
                <div className="pt-2 border-t border-[#e8e2da] flex justify-between items-baseline">
                  <span className="font-bold uppercase tracking-wider text-[#1a1a1a] text-xs">Estimated Total</span>
                  <span className="font-[Cormorant_Garamond] text-2xl font-bold text-[#1a1a1a]">
                    {formatPrice({ amount: subtotal, currency })}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || subtotal <= 0}
                className="w-full py-4 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold uppercase tracking-[0.22em] hover:bg-[#a07850] hover:text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isCheckingOut ? 'Processing Order...' : 'Proceed to Secured Checkout'}</span>
                <span className="text-sm">→</span>
              </button>

              <p className="text-[9.5px] text-center text-[#9b8f82] tracking-wider uppercase">
                Free 14-Day Global Returns · 100% Authentic Guarantee
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
