import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ShopLayout from '../../components/ShopLayout'
import { supabase } from '../../supabase'
import { useCart } from '../../context/CartContext'

export default function Checkout() {
  const { cart, clearCart, user } = useCart()
  const navigate  = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '', phone: '', address: '',
    payment_method: 'jazzcash'
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const total = cart.reduce((sum, item) => {
    const base = Number(item.product_variants?.products?.base_price || 0)
    const adj  = Number(item.product_variants?.price_adjustment || 0)
    return sum + (base + adj) * item.quantity
  }, 0)

  const handleOrder = async (e) => {
    e.preventDefault()
    if (cart.length === 0) { toast.error('Your cart is empty'); return }
    setLoading(true)

    const { data: order, error } = await supabase.from('orders').insert({
      user_id:          user?.id || null,
      subtotal:         total,
      total:            total,
      payment_method:   form.payment_method,
      payment_status:   'unpaid',
      status:           'pending',
      shipping_address: `${form.full_name}, ${form.phone}, ${form.address}`
    }).select().single()

    if (error) { toast.error('Order failed: ' + error.message); setLoading(false); return }

    const items = cart.map(item => ({
      order_id:   order.id,
      variant_id: item.variant_id,
      quantity:   item.quantity,
      unit_price: Number(item.product_variants?.products?.base_price || 0) + Number(item.product_variants?.price_adjustment || 0)
    }))

    await supabase.from('order_items').insert(items)
    await clearCart()

    toast.success('Order placed successfully!')
    navigate('/?order=success')
    setLoading(false)
  }

  return (
    <ShopLayout>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <form onSubmit={handleOrder} style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 20 }}>Delivery Details</h2>

          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} value={form.full_name} onChange={e => set('full_name', e.target.value)} required />

          <label style={labelStyle}>Phone Number</label>
          <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="03xxxxxxxxx" />

          <label style={labelStyle}>Delivery Address</label>
          <textarea style={{ ...inputStyle, height: 90, resize: 'vertical' }}
            value={form.address} onChange={e => set('address', e.target.value)} required />

          <h2 style={{ fontSize: 18, marginBottom: 16, marginTop: 8 }}>Payment Method</h2>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {['jazzcash', 'easypaisa', 'nayapay', 'cod'].map(method => (
              <button key={method} type="button" onClick={() => set('payment_method', method)} style={{
                flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                border: form.payment_method === method ? '2px solid #4f46e5' : '1px solid #ddd',
                background: form.payment_method === method ? '#eef2ff' : '#fff',
                fontWeight: 600, fontSize: 13,
                color: form.payment_method === method ? '#4f46e5' : '#333'
              }}>
                {method === 'cod' ? 'Cash on Delivery' : method.charAt(0).toUpperCase() + method.slice(1)}
              </button>
            ))}
          </div>

          {form.payment_method !== 'cod' && (
            <div style={{ background: '#fef9c3', borderRadius: 10, padding: 16, marginBottom: 24, fontSize: 14, color: '#854d0e' }}>
              After placing the order, you will receive payment instructions on your phone number via SMS. Send payment to our {form.payment_method} account and your order will be confirmed.
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px 0', background: '#1a1a2e',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 16, cursor: 'pointer', fontWeight: 600
          }}>{loading ? 'Placing Order...' : 'Place Order'}</button>
        </form>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, height: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Order Summary</h2>
          {cart.map((item, i) => {
            const price = Number(item.product_variants?.products?.base_price || 0) + Number(item.product_variants?.price_adjustment || 0)
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: '#555' }}>
                  {item.product_variants?.products?.name} × {item.quantity}
                </span>
                <span style={{ fontWeight: 600 }}>Rs {(price * item.quantity).toLocaleString()}</span>
              </div>
            )
          })}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontWeight: 700, color: '#4f46e5' }}>Rs {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }