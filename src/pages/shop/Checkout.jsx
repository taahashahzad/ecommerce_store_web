import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ShopLayout from '../../components/ShopLayout'
import { supabase } from '../../supabase'
import { useCart } from '../../context/CartContext'

export default function Checkout() {
  const { cart, clearCart, user, setShowAuthModal } = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState(1)
  const [orderId, setOrderId] = useState(null)
  const [confirmedSubtotal, setConfirmedSubtotal] = useState(0)
  const [confirmedTotal, setConfirmedTotal] = useState(0)
  const [form, setForm] = useState({
    full_name: '', phone: '', address: '', city: '', notes: ''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true)
      navigate('/')
    }
  }, [user])

  const DELIVERY_CHARGE = 300

  const subtotal = cart.reduce((sum, item) => {
    const v = item.product_variants
    const p = v?.products
    const price = Number(v?.price_adjustment ?? p?.base_price ?? 0)
    return sum + price * item.quantity
  }, 0)
  const total = subtotal + DELIVERY_CHARGE

  const placeOrder = async (e) => {
    e.preventDefault()
    if (cart.length === 0) { toast.error('Your cart is empty'); return }
    setLoading(true)

    const { data: order, error } = await supabase.from('orders').insert({
      user_id:          user?.id || null,
      subtotal:         subtotal,
      total:            total,
      payment_method:   'cod',
      payment_status:   'unpaid',
      status:           'pending',
      shipping_address: `${form.full_name}, ${form.phone}, ${form.address}, ${form.city}`
    }).select().single()

    if (error) {
      toast.error('Order failed: ' + error.message)
      setLoading(false)
      return
    }

    await supabase.from('order_items').insert(
      cart.map(item => ({
        order_id:   order.id,
        variant_id: item.variant_id,
        quantity:   item.quantity,
        unit_price: Number(item.product_variants?.price_adjustment ?? item.product_variants?.products?.base_price ?? 0)
      }))
    )

    setConfirmedSubtotal(subtotal)
    setConfirmedTotal(total)
    await clearCart()
    setOrderId(order.id)
    setStep(2)
    setLoading(false)
  }

  const iStyle = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f0ece4', fontSize: 14,
    fontFamily: '"DM Sans", sans-serif',
    boxSizing: 'border-box', marginBottom: 20,
    transition: 'border-color 0.3s', borderRadius: 0
  }
  const lStyle = {
    fontSize: 10, letterSpacing: '0.25em', color: '#777',
    textTransform: 'uppercase', display: 'block', marginBottom: 8
  }

  // Step 2 — Order confirmed screen
  if (step === 2) return (
    <ShopLayout>
      <div style={{
        minHeight: '70vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '60px 48px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: 520, animation: 'fadeUp 0.6s ease both' }}>
          <div style={{
            width: 72, height: 72, border: '1px solid #c9a96e',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 32px',
            fontSize: 28, color: '#c9a96e'
          }}>✓</div>

          <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 12 }}>Order Received</p>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 40, color: '#f0ece4', marginBottom: 16 }}>Thank You!</h1>
          <p style={{ color: '#777', lineHeight: 1.8, marginBottom: 8, fontSize: 15 }}>
            Your order <span style={{ color: '#c9a96e', fontWeight: 500 }}>#{orderId?.slice(0,8).toUpperCase()}</span> has been placed successfully.
          </p>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 40 }}>
            Our team will call you on <span style={{ color: '#a09888' }}>{form.phone}</span> to confirm delivery.
          </p>

          {/* Order details box */}
          <div style={{
            border: '1px solid rgba(201,169,110,0.2)',
            background: 'rgba(201,169,110,0.04)',
            padding: 32, marginBottom: 40, textAlign: 'left'
          }}>
            <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 20 }}>Order Details</p>

            {[
              ['Order ID',         `#${orderId?.slice(0,8).toUpperCase()}`],
              ['Name',             form.full_name],
              ['Phone',            form.phone],
              ['Address',          `${form.address}, ${form.city}`],
              ['Payment',          'Cash on Delivery'],
              ['Subtotal',         `Rs ${confirmedSubtotal.toLocaleString()}`],
              ['Delivery',         'Rs 300'],
              ['Total',            `Rs ${confirmedTotal.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 14,
                paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.04)'
              }}>
                <span style={{ fontSize: 11, letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase', flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 14, color: '#a09888', textAlign: 'right', marginLeft: 24 }}>{value}</span>
              </div>
            ))}

            {form.notes && (
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase' }}>Notes</span>
                <p style={{ fontSize: 14, color: '#a09888', marginTop: 8 }}>{form.notes}</p>
              </div>
            )}
          </div>

          {/* What happens next */}
          <div style={{ textAlign: 'left', marginBottom: 40 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 20 }}>What happens next</p>
            {[
              ['Step 1', 'We confirm your order via phone call'],
              ['Step 2', 'Your order is packed and dispatched'],
              ['Step 3', 'Delivery in 3–5 business days'],
              ['Step 4', 'Pay cash when your order arrives'],
            ].map(([step, text]) => (
              <div key={step} style={{ display: 'flex', gap: 16, marginBottom: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.2em', color: '#c9a96e', textTransform: 'uppercase', whiteSpace: 'nowrap', paddingTop: 2 }}>{step}</span>
                <span style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>

          <button className="gold-btn" onClick={() => navigate('/')} style={{
            padding: '16px 48px', border: 'none',
            fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
            fontFamily: '"DM Sans", sans-serif', cursor: 'pointer', color: '#0a0a0a'
          }}>Continue Shopping</button>
        </div>
      </div>
    </ShopLayout>
  )

  // Step 1 — Checkout form
  return (
    <ShopLayout>
      <div style={{ padding: '60px 48px', animation: 'fadeUp 0.6s ease both' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 12 }}>Final Step</p>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 44, color: '#f0ece4', marginBottom: 8 }}>Checkout</h1>
        <p style={{ color: '#555', fontSize: 14, marginBottom: 48 }}>Fill in your details and we'll deliver to your door.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          <form onSubmit={placeOrder}>

            {/* Delivery details */}
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 40, marginBottom: 24, background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 28 }}>Delivery Details</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={lStyle}>Full Name</label>
                  <input style={iStyle} value={form.full_name}
                    onChange={e => set('full_name', e.target.value)} required
                    onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
                <div>
                  <label style={lStyle}>Phone Number</label>
                  <input style={iStyle} value={form.phone} placeholder="03xxxxxxxxx"
                    onChange={e => set('phone', e.target.value)} required
                    onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                </div>
              </div>

              <label style={lStyle}>Street Address</label>
              <input style={iStyle} value={form.address}
                onChange={e => set('address', e.target.value)} required
                placeholder="House no, street, area"
                onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />

              <label style={lStyle}>City</label>
              <input style={iStyle} value={form.city}
                onChange={e => set('city', e.target.value)} required
                placeholder="Lahore, Karachi, Islamabad..."
                onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />

              <label style={lStyle}>Order Notes (optional)</label>
              <textarea style={{ ...iStyle, height: 80, resize: 'none' }}
                value={form.notes} placeholder="Any special instructions..."
                onChange={e => set('notes', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>

            {/* Payment method — COD only */}
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 32, marginBottom: 24, background: 'rgba(255,255,255,0.02)', display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, border: '1px solid #c9a96e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#c9a96e', flexShrink: 0 }}>◉</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#f0ece4', marginBottom: 4 }}>Cash on Delivery</p>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>Pay with cash when your order arrives at your door. No online payment required.</p>
              </div>
            </div>

            <button type="submit" className="gold-btn" disabled={loading} style={{
              width: '100%', padding: '18px 0', border: 'none',
              fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase',
              fontFamily: '"DM Sans", sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500, color: '#0a0a0a', opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 16 }}>
              By placing your order you agree to our terms of service
            </p>
          </form>

          {/* Order summary */}
          <div style={{
            border: '1px solid rgba(255,255,255,0.06)', padding: 32,
            position: 'sticky', top: 100, background: 'rgba(255,255,255,0.02)'
          }}>
            <p style={{ fontSize: 11, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 24 }}>Order Summary</p>

            {cart.length === 0 ? (
              <p style={{ color: '#555', fontSize: 14 }}>Your cart is empty</p>
            ) : cart.map((item, i) => {
              const price = Number(item.product_variants?.price_adjustment ?? item.product_variants?.products?.base_price ?? 0)
              return (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 56, height: 64, background: '#111', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.product_variants?.products?.image_url && (
                      <img src={item.product_variants.products.image_url} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: '#f0ece4', marginBottom: 4, fontFamily: '"Playfair Display", serif' }}>
                      {item.product_variants?.products?.name}
                    </p>
                    <p style={{ fontSize: 11, color: '#555' }}>
                      {item.product_variants?.size && `Size: ${item.product_variants.size}`}
                      {item.product_variants?.size && item.product_variants?.color && ' · '}
                      {item.product_variants?.color && item.product_variants.color}
                    </p>
                    <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ fontSize: 14, color: '#c9a96e', whiteSpace: 'nowrap' }}>
                    Rs {(price * item.quantity).toLocaleString()}
                  </p>
                </div>
              )
            })}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#555' }}>Subtotal</span>
                <span style={{ fontSize: 13, color: '#a09888' }}>Rs {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: '#555' }}>Delivery</span>
                <span style={{ fontSize: 13, color: '#f0ece4' }}>Rs 300</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, color: '#f0ece4' }}>Total</span>
                <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, color: '#c9a96e' }}>Rs {total.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                ◉ Cash on Delivery · Rs 300 delivery · 3–5 business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}