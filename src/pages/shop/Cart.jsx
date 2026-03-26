import { useNavigate } from 'react-router-dom'
import ShopLayout from '../../components/ShopLayout'
import { useCart } from '../../context/CartContext'

export default function Cart() {
  const { cart, removeFromCart } = useCart()
  const navigate = useNavigate()

  const total = cart.reduce((sum, item) => {
    const base = Number(item.product_variants?.products?.base_price || 0)
    const adj  = Number(item.product_variants?.price_adjustment || 0)
    return sum + (base + adj) * item.quantity
  }, 0)

  return (
    <ShopLayout>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Your Cart</h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <p style={{ color: '#aaa', fontSize: 18, marginBottom: 24 }}>Your cart is empty</p>
          <button onClick={() => navigate('/')} style={{
            padding: '12px 32px', background: '#1a1a2e', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15
          }}>Continue Shopping</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          <div>
            {cart.map((item, i) => {
              const v    = item.product_variants
              const p    = v?.products
              const price = (Number(p?.base_price || 0) + Number(v?.price_adjustment || 0))
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12,
                  display: 'flex', gap: 16, alignItems: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ width: 80, height: 80, background: '#f0f0f0', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                    {p?.image_url && <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{p?.name}</p>
                    <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
                      {v?.size && `Size: ${v.size}`}{v?.size && v?.color && ' / '}{v?.color && `Color: ${v.color}`}
                    </p>
                    <p style={{ color: '#4f46e5', fontWeight: 600 }}>Rs {price.toLocaleString()} × {item.quantity}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, marginBottom: 8 }}>Rs {(price * item.quantity).toLocaleString()}</p>
                    <button onClick={() => removeFromCart(item)} style={{
                      padding: '6px 12px', background: '#fee2e2', color: '#dc2626',
                      border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12
                    }}>Remove</button>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 24, height: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Order Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#666' }}>Subtotal</span>
              <span>Rs {total.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ color: '#666' }}>Shipping</span>
              <span style={{ color: '#16a34a' }}>Free</span>
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ fontWeight: 700, fontSize: 17 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 17, color: '#4f46e5' }}>Rs {total.toLocaleString()}</span>
            </div>
            <button onClick={() => navigate('/checkout')} style={{
              width: '100%', padding: '14px 0', background: '#1a1a2e',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 16, cursor: 'pointer', fontWeight: 600
            }}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </ShopLayout>
  )
}