import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        profiles(full_name, phone),
        order_items(
          quantity, unit_price,
          product_variants(size, color, products(name))
        )
      `)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

  const statusColor = {
    pending:   { bg: '#fef9c3', color: '#854d0e' },
    confirmed: { bg: '#dbeafe', color: '#1e40af' },
    shipped:   { bg: '#f3e8ff', color: '#6b21a8' },
    delivered: { bg: '#dcfce7', color: '#15803d' },
    cancelled: { bg: '#fee2e2', color: '#b91c1c' },
  }

  return (
    <AdminLayout>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Orders</h1>

      {loading ? <p>Loading...</p> : orders.length === 0 ? (
        <p style={{ color: '#aaa' }}>No orders yet</p>
      ) : orders.map(order => (
        <div key={order.id} style={{
          background: '#fff', borderRadius: 12, marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 24px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: 12
          }}>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p style={{ fontSize: 13, color: '#888' }}>
                {new Date(order.created_at).toLocaleString()} &nbsp;|&nbsp;
                {order.profiles?.full_name || 'Guest'} &nbsp;|&nbsp;
                {order.profiles?.phone || '—'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: statusColor[order.payment_status === 'paid' ? 'delivered' : 'pending']?.bg,
                color: statusColor[order.payment_status === 'paid' ? 'delivered' : 'pending']?.color,
              }}>
                {order.payment_method?.toUpperCase()} — {order.payment_status}
              </span>

              <select
                value={order.status}
                onChange={e => updateStatus(order.id, e.target.value)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid #e0e0e0',
                  fontSize: 13, cursor: 'pointer',
                  background: statusColor[order.status]?.bg,
                  color: statusColor[order.status]?.color,
                  fontWeight: 600
                }}
              >
                {['pending','confirmed','shipped','delivered','cancelled'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ padding: '12px 24px' }}>
            {order.order_items?.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid #f9f9f9', fontSize: 14
              }}>
                <span>
                  {item.product_variants?.products?.name || '—'}
                  {item.product_variants?.size ? ` — ${item.product_variants.size}` : ''}
                  {item.product_variants?.color ? ` / ${item.product_variants.color}` : ''}
                  {' '}× {item.quantity}
                </span>
                <span style={{ fontWeight: 500 }}>
                  Rs {(item.unit_price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              paddingTop: 12, fontWeight: 700, fontSize: 15
            }}>
              <span>Total</span>
              <span>Rs {Number(order.total).toLocaleString()}</span>
            </div>

            {order.shipping_address && (
              <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
                Ship to: {order.shipping_address}
              </p>
            )}
          </div>
        </div>
      ))}
    </AdminLayout>
  )
}