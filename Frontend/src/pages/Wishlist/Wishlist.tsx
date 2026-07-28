import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Wishlist.css';
import { useCustomerAuth } from '@/src/context/CustomerAuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  getWishlist,
  deleteWishlistItem,
  WishlistItem,
} from '../../services/whishlistService';
import { addToCart } from '../../services/cartService';

const Wishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [addingItemId, setAddingItemId] = useState<number | null>(null);
  const { customer, isLoggedIn } = useCustomerAuth();
  const { currency, setCurrency } = useCurrency();

  const currencySymbol = {
    INR: '₹',
    USD: '$',
    AED: 'AED ',
    SAR: 'SAR ',
    KWD: 'KWD ',
  };

  // Fallback to a hardcoded ID like 5 if user session isn't available yet
  const getUserId = (): number | null => {
    const storedId = localStorage.getItem('userId');
    if (!storedId) return null;

    try {
      return JSON.parse(storedId);
    } catch {
      return Number(storedId);
    }
  };

  const currentUserId = Number(customer?.id ?? getUserId() ?? 0) || null;

  // --- Fetch Wishlist ---
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const items = await getWishlist(currentUserId, currency);
        setWishlistItems(Array.isArray(items) ? items : []);
      } catch (error: any) {
        console.error('Error fetching wishlist:', error);
        if (error.response && error.response.status === 404) {
          // If 404, it means wishlist is empty
          setWishlistItems([]);
        } else {
          toast.error('Failed to load wishlist');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [currentUserId, currency]);


  // --- Remove Item Helper ---
  const removeFromWishlist = async (wishlistDbId: number) => {
    try {
      await deleteWishlistItem(wishlistDbId);
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistDbId));
      toast.success('Removed from favorites');
      return true;
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Could not remove item');
    }
    return false;
  };

  // --- Add Single Item to Cart ---
  const handleAddToCart = async (item: WishlistItem) => {
    if (!currentUserId) {
      toast.error('Please login first');
      return;
    }

    setAddingItemId(item.id);
    try {
      await addToCart(currentUserId as number, item.product_id, 1);
      toast.success(`${item.product_name} added to cart`);
      await removeFromWishlist(item.id);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const message =
        error?.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
    } finally {
      setAddingItemId(null);
    }
  };

  // --- Add All to Cart Logic ---
  const handleAddAllToCart = async () => {
    if (!currentUserId) {
      toast.error('Please login first');
      return;
    }
    if (wishlistItems.length === 0) return;

    setIsAddingAll(true);
    const loadingToast = toast.loading('Adding all items to cart...');

    // Use allSettled so one failed item doesn't block the rest
    const results = await Promise.allSettled(
      wishlistItems.map(item =>
        addToCart(currentUserId as number, item.product_id, 1).then(() =>
          removeFromWishlist(item.id).then(() => item.id)
        )
      )
    );

    const succeededIds = results
      .filter(
        (r): r is PromiseFulfilledResult<number> => r.status === 'fulfilled'
      )
      .map(r => r.value);
    const failedCount = results.length - succeededIds.length;

    setWishlistItems(prev =>
      prev.filter(item => !succeededIds.includes(item.id))
    );

    if (failedCount === 0) {
      toast.success('All items moved to cart!', { id: loadingToast });
    } else if (succeededIds.length === 0) {
      toast.error('Failed to add items to cart', { id: loadingToast });
    } else {
      toast.success(
        `${succeededIds.length} item(s) added, ${failedCount} failed`,
        { id: loadingToast }
      );
    }

    setIsAddingAll(false);
  };

  // --- Calculate Total Amount ---
  const totalValue = (wishlistItems || []).reduce((sum, item) => {
    return sum + Number(item.product_price || 0);
  }, 0);

  if (loading) {
    return (
      <div className="rasi-loading-container">
        <Loader2 className="spinner" size={40} />
        <p>Loading your favorites...</p>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="rasi-empty-wishlist">
        <Heart size={64} />
        <h2>Please Login</h2>
        <p>Login to see your wishlist.</p>
        <Link to="/login" className="rasi-shop-now-btn">Go to Login</Link>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="rasi-empty-wishlist">
        <Heart size={64} />
        <h2>Your Wishlist is Empty</h2>
        <Link to="/products" className="rasi-shop-now-btn">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="rasi-wishlist-page">
      <div className="rasi-wishlist-container">
        <div className="rasi-wishlist-header">
          <h1><Heart size={28} /> My Wishlist</h1>
          <p>Total Items: {wishlistItems.length}</p>
        </div>

        <div className="rasi-wishlist-main">
          <div className="rasi-wishlist-items">
            {wishlistItems.map(item => (
              <div key={item.id} className="rasi-wishlist-item">
                <div className="rasi-wishlist-item-image">
                  <img src={item.product_image} alt={item.product_name} referrerPolicy="no-referrer" />
                  <button
                    className="rasi-wishlist-remove"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="rasi-wishlist-item-info">
                  <h3>{item.product_name}</h3>
                  <p className="rasi-wishlist-price">
                    {currencySymbol[currency as keyof typeof currencySymbol]}{item.product_price}
                  </p>
                  <button
                    className="rasi-add-to-cart-btn"
                    onClick={() => handleAddToCart(item)}
                    disabled={addingItemId === item.id}
                  >
                    {addingItemId === item.id ? (
                      <><Loader2 size={16} className="spinner" /> Adding...</>
                    ) : (
                      <><ShoppingCart size={16} /> Add to Cart</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rasi-wishlist-summary">
            <h2>Summary</h2>
            <div className="rasi-summary-row">
              <span>Subtotal</span>
              <span>
                {currencySymbol[currency as keyof typeof currencySymbol]}{totalValue}
              </span>
            </div>
            <div className="rasi-summary-row total">
              <span>Total Amount</span>
              <span>
                {currencySymbol[currency as keyof typeof currencySymbol]}{totalValue}
              </span>
            </div>
            <button
              className="rasi-checkout-btn"
              onClick={handleAddAllToCart}
              disabled={isAddingAll}
            >
              {isAddingAll ? (
                <><Loader2 size={18} className="spinner" /> Moving...</>
              ) : (
                'Add All to Cart'
              )}
            </button>
            <Link to="/products" className="rasi-continue-shopping">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;