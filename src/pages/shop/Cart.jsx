import { useNavigate } from 'react-router-dom'
import ShopLayout from '../../components/ShopLayout'
import { useCart } from '../../context/CartContext'

export default function Cart() {
  const { cart, removeFromCart } = useCart()
  const navigate = useNavigate()

  const DELIVERY_CHARGE = 300

  const subtotal = cart.reduce((sum, item) => {
    const v = item.product_variants
    const p = v?.products
    const price = Number(v?.price_adjustment ?? p?.base_price ?? 0)
    return sum + price * item.quantity
  }, 0)
  const total = subtotal + DELIVERY_CHARGE

  return (
    <ShopLayout>
      <div style={{ padding: '60px 48px', animation: 'fadeUp 0.6s ease both' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 12 }}>Your Selection</p>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 44, color: '#f0ece4', marginBottom: 48 }}>Shopping Cart</h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 24, color: '#222' }}>◎</div>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 24, color: '#555', fontStyle: 'italic', marginBottom: 32 }}>Your cart is empty</p>
            <button className="gold-btn" onClick={() => navigate('/')} style={{
              padding: '16px 48px', border: 'none', fontSize: 12, letterSpacing: '0.2em',
              textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer', color: '#0a0a0a'
            }}>Explore Collection</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
            <div>
              {cart.map((item, i) => {
                const v     = item.product_variants
                const p     = v?.products
                const price = Number(v?.price_adjustment ?? p?.base_price ?? 0)
                return (
                  <div key={i} style={{
                    display: 'flex', gap: 24, padding: '28px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    animation: `fadeUp 0.5s ease both`, animationDelay: `${i * 0.08}s`
                  }}>
                    <div style={{ width: 100, height: 120, background: '#111', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', flexShrink: 0 }}>
                      {p?.image_url && <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 8 }}>
                        {v?.size && `Size: ${v.size}`}{v?.size && v?.color && ' · '}{v?.color && `${v.color}`}
                      </p>
                      <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: '#f0ece4', marginBottom: 12 }}>{p?.name}</p>
                      <p style={{ fontSize: 15, color: '#c9a96e', marginBottom: 16 }}>Rs {price.toLocaleString()} × {item.quantity}</p>
                      <button onClick={() => removeFromCart(item)} className="ghost-btn" style={{
                        padding: '6px 16px', fontSize: 11, letterSpacing: '0.15em',
                        textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer'
                      }}>Remove</button>
                    </div>
                    <div style={{ textAlign: 'right', paddingTop: 4 }}>
                      <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, color: '#f0ece4' }}>Rs {(price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 32, position: 'sticky', top: 100, background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 24 }}>Order Summary</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#777', fontSize: 14 }}>Subtotal</span>
                <span style={{ color: '#f0ece4', fontSize: 14 }}>Rs {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ color: '#777', fontSize: 14 }}>Delivery</span>
                <span style={{ color: '#f0ece4', fontSize: 14 }}>Rs 300</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: '#f0ece4' }}>Total</span>
                <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: '#c9a96e' }}>Rs {total.toLocaleString()}</span>
              </div>
              <button className="gold-btn" onClick={() => navigate('/checkout')} style={{
                width: '100%', padding: '16px 0', border: 'none',
                fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
                fontFamily: '"DM Sans", sans-serif', cursor: 'pointer', color: '#0a0a0a', fontWeight: 500
              }}>Proceed to Checkout</button>
              <button onClick={() => navigate('/')} style={{
                width: '100%', padding: '14px 0', marginTop: 12, border: 'none',
                background: 'transparent', color: '#555', fontSize: 12, letterSpacing: '0.15em',
                textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer'
              }}>Continue Shopping</button>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  )
}