import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../Hooks/useCart';

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

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart?.items || []);
  const currentUser = useSelector((state) => state.auth?.user);
  const { handleGetCart } = useCart();

  useEffect(() => {
    if (isOpen && currentUser) {
      handleGetCart();
    }
  }, [isOpen, currentUser]);

  // Calculate Subtotal
  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice =
      item.price?.amount ||
      item.product?.price?.amount ||
      (item.product?.variants?.find((v) => String(v._id) === String(item.variant))?.price?.amount) ||
      0;
    return acc + Number(itemPrice) * Number(item.quantity || 1);
  }, 0);

  const currency = cartItems[0]?.price?.currency || cartItems[0]?.product?.price?.currency || 'INR';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-[Montserrat] text-[#1a1a1a]">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#ffffff] border-l border-[#e8e2da] shadow-2xl flex flex-col justify-between animate-slide-left">
          
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
                const product = item.product || {};
                const variantId = item.variant;
                const matchedVariant = product.variants?.find((v) => String(v._id) === String(variantId));
                const itemImg = matchedVariant?.images?.[0]?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&fit=crop';
                const itemPriceObj = item.price || matchedVariant?.price || product.price;

                let attrText = '';
                if (matchedVariant?.attributes) {
                  attrText = Object.entries(matchedVariant.attributes)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' · ');
                }

                return (
                  <div
                    key={item._id || idx}
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
                        </div>

                        {attrText && (
                          <p className="text-[10px] text-[#a07850] font-semibold tracking-wider uppercase mt-0.5">
                            {attrText}
                          </p>
                        )}

                        <p className="text-[10.5px] text-[#7a7269] mt-0.5">
                          Quantity: <span className="font-bold text-[#1a1a1a]">{item.quantity}</span>
                        </p>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-[#f5f3f0]">
                        <span className="font-[Cormorant_Garamond] text-base font-bold text-[#1a1a1a]">
                          {formatPrice(itemPriceObj)}
                        </span>
                        <span className="text-[9.5px] text-[#9b8f82] uppercase tracking-wider">
                          Subtotal: {formatPrice({ amount: (itemPriceObj?.amount || 0) * (item.quantity || 1), currency: itemPriceObj?.currency || currency })}
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
                onClick={() => {
                  onClose();
                  navigate('/buyer-checkout', { state: { subtotal, currency } });
                }}
                className="w-full py-4 bg-[#1a1a1a] text-[#c8a882] text-xs font-bold uppercase tracking-[0.22em] hover:bg-[#a07850] hover:text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Secured Checkout</span>
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
