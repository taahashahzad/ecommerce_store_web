import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ShopLayout from '../../components/ShopLayout'
import { supabase } from '../../supabase'
import { useCart } from '../../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct]     = useState(null)
  const [variants, setVariants]   = useState([])
  const [reviews, setReviews]     = useState([])
  const [selected, setSelected]   = useState(null)
  const [qty, setQty]             = useState(1)
  const [visible, setVisible]     = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)  const [justAdded, setJustAdded] = useState(false)  const { addToCart, user } = useCart()

  useEffect(() => {
    fetchAll()
    setTimeout(() => setVisible(true), 100)
  }, [id, user])

  const fetchAll = async () => {
    const [{ data: product }, { data: vars }, { data: revs }] = await Promise.all([
      supabase.from('products').select('*, categories(name)').eq('id', id).single(),
      supabase.from('product_variants').select('*').eq('product_id', id),
      supabase.from('reviews').select('*, profiles(full_name)').eq('product_id', id).order('created_at', { ascending: false }),
    ])
    setProduct(product)
    setVariants(vars || [])
    setReviews(revs || [])
    if (vars?.length) setSelected(vars[0])

    if (user) {
      // Check if user bought this product and hasn't reviewed yet
      const { data: bought } = await supabase.rpc('user_bought_product', { product_id: id })
      const alreadyReviewed  = revs?.some(r => r.user_id === user.id)
      setCanReview(bought && !alreadyReviewed)
      setHasReviewed(alreadyReviewed)
    }
  }

  const handleAddToCart = () => {
    if (variants.length > 0 && !selected) { toast.error('Select a variant'); return }
    addToCart(selected || {}, product, qty)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 5000) // Hide after 5 seconds
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please sign in to leave a review'); return }
    setSubmitting(true)

    const { error } = await supabase.from('reviews').insert({
      product_id: id,
      user_id:    user.id,
      rating:     reviewForm.rating,
      comment:    reviewForm.comment
    })

    if (error) {
      toast.error(error.message.includes('policy') ? 'You can only review products you have received.' : error.message)
    } else {
      toast.success('Review submitted!', {
        style: { background: '#1a1a0e', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)' }
      })
      setShowReviewForm(false)
      setReviewForm({ rating: 5, comment: '' })
      fetchAll()
    }
    setSubmitting(false)
  }

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return
    await supabase.from('reviews').delete().eq('id', reviewId)
    fetchAll()
  }

  if (!product) return (
    <ShopLayout>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '1px solid #c9a96e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </ShopLayout>
  )

  const price = selected
    ? Number(selected.price_adjustment)
    : Number(product.base_price)

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <ShopLayout>
      <div style={{
        padding: '60px 48px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.7s cubic-bezier(0.25,0.46,0.45,0.94)'
      }} className="product-detail-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }} className="product-grid">
          {/* Image */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ aspectRatio: '4/5', background: '#111', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
              {product.image_url
                ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }}>No image</div>
              }
              {avgRating && (
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(201,169,110,0.3)',
                  padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <span style={{ color: '#c9a96e', fontSize: 12 }}>★</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ece4' }}>{avgRating}</span>
                  <span style={{ fontSize: 11, color: '#555' }}>({reviews.length})</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 16 }}>{product.categories?.name}</p>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 40, fontWeight: 600, color: '#f0ece4', lineHeight: 1.15, marginBottom: 24 }} className="product-h1">{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 32 }}>
              <span style={{ fontSize: 32, fontWeight: 300, color: '#c9a96e' }} className="product-price">Rs {price.toLocaleString()}</span>
            </div>
            <div style={{ width: 40, height: 1, background: 'rgba(201,169,110,0.3)', marginBottom: 32 }} />
            <p style={{ color: '#888', lineHeight: 1.9, fontSize: 15, marginBottom: 40 }}>{product.description}</p>

            {/* Variants */}
            {variants.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#777', marginBottom: 16 }}>
                  Select — <span style={{ color: '#c9a96e' }}>
                    {selected ? `${selected.size || ''}${selected.size && selected.color ? ' / ' : ''}${selected.color || ''}` : 'None'}
                  </span>
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {variants.map(v => (
                    <button key={v.id} onClick={() => v.stock_qty > 0 && setSelected(v)} style={{
                      padding: '10px 20px',
                      border: selected?.id === v.id ? '1px solid #c9a96e' : '1px solid rgba(255,255,255,0.1)',
                      background: selected?.id === v.id ? 'rgba(201,169,110,0.08)' : 'transparent',
                      color: v.stock_qty === 0 ? '#333' : selected?.id === v.id ? '#c9a96e' : '#a09888',
                      cursor: v.stock_qty === 0 ? 'not-allowed' : 'pointer',
                      fontSize: 13, fontFamily: '"DM Sans", sans-serif',
                      textDecoration: v.stock_qty === 0 ? 'line-through' : 'none',
                      transition: 'all 0.25s'
                    }}>
                      {v.size && v.size}{v.size && v.color && ' / '}{v.color && v.color}
                    </button>
                  ))}
                </div>
                {selected && <p style={{ fontSize: 12, color: '#555', marginTop: 10 }}>{selected.stock_qty} pieces available</p>}
              </div>
            )}

            {/* Qty */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#777' }}>Quantity</p>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 44, height: 44, background: 'transparent', border: 'none', color: '#f0ece4', cursor: 'pointer', fontSize: 18 }}>−</button>
                <span style={{ width: 44, textAlign: 'center', fontSize: 15, fontWeight: 500, color: '#f0ece4' }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ width: 44, height: 44, background: 'transparent', border: 'none', color: '#f0ece4', cursor: 'pointer', fontSize: 18 }}>+</button>
              </div>
            </div>

            <button className="gold-btn" onClick={handleAddToCart} style={{
              width: '100%', padding: '18px 0', border: 'none',
              fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase',
              fontFamily: '"DM Sans", sans-serif', cursor: 'pointer', fontWeight: 500, color: '#0a0a0a'
            }}>Add to Cart</button>

            {justAdded && (
              <div style={{
                marginTop: 16, padding: '12px 16px',
                background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.3)',
                borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                animation: 'fadeIn 0.3s ease'
              }}>
                <span style={{ fontSize: 13, color: '#c9a96e' }}>Added to cart!</span>
                <button onClick={() => navigate('/cart')} className="ghost-btn" style={{
                  padding: '6px 12px', fontSize: 11, letterSpacing: '0.1em',
                  textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer'
                }}>Go to Cart</button>
              </div>
            )}

            <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
              {[['Material', 'Premium quality'], ['Origin', 'Pakistan'], ['Delivery', '3–5 business days']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: 12, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{k}</span>
                  <span style={{ fontSize: 13, color: '#a09888' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div style={{ marginTop: 80, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 60 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 12 }}>Customer Reviews</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 32, color: '#f0ece4', margin: 0 }}>
                  {avgRating ? `${avgRating} / 5` : 'No reviews yet'}
                </h2>
                {avgRating && (
                  <div>
                    <div style={{ color: '#c9a96e', fontSize: 16, letterSpacing: 2 }}>
                      {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                    </div>
                    <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Write review button */}
            {canReview && !showReviewForm && (
              <button className="ghost-btn" onClick={() => setShowReviewForm(true)} style={{
                padding: '12px 24px', fontSize: 12, letterSpacing: '0.15em',
                textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer'
              }}>Write a Review</button>
            )}
            {hasReviewed && (
              <span style={{ fontSize: 12, color: '#555', letterSpacing: '0.1em' }}>You have reviewed this product</span>
            )}
            {!user && (
              <span style={{ fontSize: 12, color: '#555' }}>Sign in and purchase to leave a review</span>
            )}
            {user && !canReview && !hasReviewed && (
              <span style={{ fontSize: 12, color: '#555' }}>Purchase and receive this product to leave a review</span>
            )}
          </div>

          {/* Review form */}
          {showReviewForm && (
            <form onSubmit={submitReview} style={{
              border: '1px solid rgba(201,169,110,0.2)',
              background: 'rgba(201,169,110,0.04)',
              padding: 32, marginBottom: 40,
              animation: 'fadeUp 0.4s ease both'
            }}>
              <p style={{ fontSize: 11, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 24 }}>Your Review</p>

              {/* Star rating */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.2em', color: '#777', textTransform: 'uppercase', marginBottom: 12 }}>Rating</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: star }))} style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                      fontSize: 28, color: star <= reviewForm.rating ? '#c9a96e' : '#333',
                      transition: 'color 0.2s, transform 0.1s',
                      transform: star <= reviewForm.rating ? 'scale(1.1)' : 'scale(1)'
                    }}>★</button>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}
                </p>
              </div>

              {/* Comment */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.2em', color: '#777', textTransform: 'uppercase', marginBottom: 12 }}>Your Comment</p>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  required
                  placeholder="Share your experience with this product..."
                  style={{
                    width: '100%', height: 120, padding: '14px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#f0ece4', fontSize: 14, resize: 'none',
                    fontFamily: '"DM Sans", sans-serif',
                    boxSizing: 'border-box', outline: 'none',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="gold-btn" disabled={submitting} style={{
                  padding: '13px 32px', border: 'none',
                  fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
                  fontFamily: '"DM Sans", sans-serif', cursor: submitting ? 'not-allowed' : 'pointer',
                  color: '#0a0a0a', opacity: submitting ? 0.7 : 1
                }}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                <button type="button" className="ghost-btn" onClick={() => setShowReviewForm(false)} style={{
                  padding: '13px 24px', fontSize: 12, letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer'
                }}>Cancel</button>
              </div>
            </form>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: '#333', fontStyle: 'italic' }}>
                No reviews yet. Be the first to review this product.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }} className="reviews-grid">
              {reviews.map((r, i) => (
                <div key={r.id} style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: 28, background: 'rgba(255,255,255,0.02)',
                  animation: `fadeUp 0.5s ease both`, animationDelay: `${i * 0.06}s`,
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#f0ece4', marginBottom: 6 }}>
                        {r.profiles?.full_name || 'Customer'}
                      </p>
                      <div style={{ color: '#c9a96e', fontSize: 13, letterSpacing: 2 }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <p style={{ fontSize: 11, color: '#444' }}>
                        {new Date(r.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      {user?.id === r.user_id && (
                        <button onClick={() => deleteReview(r.id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 11, color: '#555', letterSpacing: '0.1em',
                          textDecoration: 'underline', padding: 0,
                          textTransform: 'uppercase'
                        }}>Delete</button>
                      )}
                    </div>
                  </div>
                  <p style={{ color: '#a09888', lineHeight: 1.8, fontSize: 14, fontStyle: 'italic' }}>
                    "{r.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-detail-container { padding: 30px 16px !important; }
          .product-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .product-h1 { font-size: 28px !important; }
          .product-price { font-size: 24px !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
        }        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }      `}</style>
    </ShopLayout>
  )
}