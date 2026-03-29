import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

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

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order permanently?')) return
    await supabase.from('order_items').delete().eq('order_id', id)
    await supabase.from('orders').delete().eq('id', id)
    fetchOrders()
  }

  const statusColor = {
    pending:   { bg: '#fef9c3', color: '#854d0e' },
    confirmed: { bg: '#dbeafe', color: '#1e40af' },
    shipped:   { bg: '#f3e8ff', color: '#6b21a8' },
    delivered: { bg: '#dcfce7', color: '#15803d' },
    cancelled: { bg: '#fee2e2', color: '#b91c1c' },
  }

  const filters = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Orders</h1>
        <span style={{ fontSize: 13, color: '#888' }}>{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none',
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
            background: filter === f ? '#1a1a2e' : '#fff',
            color: filter === f ? '#fff' : '#666',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            textTransform: 'capitalize'
          }}>
            {f === 'all' ? 'All Orders' : f}
            {f === 'pending' && orders.filter(o => o.status === 'pending').length > 0 && (
              <span style={{
                marginLeft: 6, background: '#e74c3c', color: '#fff',
                fontSize: 10, padding: '1px 6px', borderRadius: 8
              }}>
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
          <p style={{ fontSize: 18 }}>No orders found</p>
        </div>
      ) : filtered.map(order => {
        const isNew = order.status === 'pending'
        return (
          <div key={order.id} style={{
            background: '#fff', borderRadius: 12, marginBottom: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden',
            border: isNew ? '1.5px solid #fbbf24' : '1.5px solid transparent',
            transition: 'border-color 0.3s'
          }}>
            {/* Order header */}
            <div style={{
              padding: '16px 24px',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 12,
              borderBottom: '1px solid #f0f0f0',
              background: isNew ? '#fffbeb' : '#fff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isNew && (
                  <span style={{
                    background: '#f59e0b', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '3px 10px',
                    borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase'
                  }}>New</span>
                )}
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 2, fontSize: 15 }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p style={{ fontSize: 12, color: '#888' }}>
                    {new Date(order.created_at).toLocaleString('en-PK')} &nbsp;·&nbsp;
                    {order.profiles?.full_name || 'Guest'} &nbsp;·&nbsp;
                    {order.profiles?.phone || order.shipping_address?.split(',')[1]?.trim() || '—'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: statusColor[order.status]?.bg,
                  color: statusColor[order.status]?.color,
                }}>
                  {order.status}
                </span>

                <select
                  value={order.status}
                  onChange={e => updateStatus(order.id, e.target.value)}
                  style={{
                    padding: '6px 12px', borderRadius: 8,
                    border: '1px solid #e0e0e0', fontSize: 13,
                    cursor: 'pointer', background: '#fff'
                  }}
                >
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>

                <button onClick={() => deleteOrder(order.id)} style={{
                  padding: '6px 12px', background: '#fee2e2', color: '#dc2626',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500
                }}>Delete</button>
              </div>
            </div>

            {/* Order items */}
            <div style={{ padding: '12px 24px' }}>
              {order.order_items?.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid #f9f9f9', fontSize: 14
                }}>
                  <span style={{ color: '#444' }}>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700, fontSize: 15 }}>
                <span>Total</span>
                <span>Rs {Number(order.total).toLocaleString()}</span>
              </div>

              {order.shipping_address && (
                <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                  Deliver to: {order.shipping_address}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </AdminLayout>
  )
}