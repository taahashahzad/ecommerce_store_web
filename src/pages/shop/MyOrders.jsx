import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShopLayout from '../../components/ShopLayout'
import { supabase } from '../../supabase'
import { useCart } from '../../context/CartContext'

const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered']

const statusInfo = {
  pending:   { label: 'Order Placed',    color: '#f59e0b', desc: 'We have received your order and will confirm it shortly.' },
  confirmed: { label: 'Confirmed',       color: '#3b82f6', desc: 'Your order has been confirmed and is being prepared.' },
  shipped:   { label: 'On the Way',      color: '#8b5cf6', desc: 'Your order has been dispatched and is on its way to you.' },
  delivered: { label: 'Delivered',       color: '#10b981', desc: 'Your order has been delivered. Enjoy your purchase!' },
  cancelled: { label: 'Cancelled',       color: '#ef4444', desc: 'This order has been cancelled.' },
}

export default function MyOrders() {
  const { user, setShowAuthModal } = useCart()
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { setShowAuthModal(true); navigate('/'); return }
    fetchOrders()

    const channel = supabase
      .channel('my-orders')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, () => fetchOrders())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          quantity, unit_price,
          product_variants(size, color, products(name, image_url))
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const getStepIndex = (status) => statusSteps.indexOf(status)

  if (loading) return (
    <ShopLayout>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '1px solid #c9a96e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </ShopLayout>
  )

  return (
    <ShopLayout>
      <div style={{ padding: '60px 48px', animation: 'fadeUp 0.6s ease both' }} className="orders-container">
        <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 12 }}>Your Account</p>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 44, color: '#f0ece4', marginBottom: 8 }} className="orders-h1">My Orders</h1>
        <p style={{ color: '#555', fontSize: 14, marginBottom: 48 }}>Track and manage all your orders in one place.</p>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, color: '#222', marginBottom: 24 }}>◎</div>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 24, color: '#555', fontStyle: 'italic', marginBottom: 32 }}>No orders yet</p>
            <button className="gold-btn" onClick={() => navigate('/')} style={{
              padding: '14px 40px', border: 'none', fontSize: 12,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              fontFamily: '"DM Sans", sans-serif', cursor: 'pointer', color: '#0a0a0a'
            }}>Start Shopping</button>
          </div>
        ) : orders.map((order, idx) => {
          const info      = statusInfo[order.status] || statusInfo.pending
          const stepIdx   = getStepIndex(order.status)
          const isCancelled = order.status === 'cancelled'
          const isExpanded  = expanded === order.id

          return (
            <div key={order.id} style={{
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
              marginBottom: 16,
              animation: `fadeUp 0.5s ease both`,
              animationDelay: `${idx * 0.06}s`
            }}>
              {/* Order header */}
              <div
                onClick={() => setExpanded(isExpanded ? null : order.id)}
                style={{
                  padding: '20px 28px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: 16,
                  borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {/* Status dot */}
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: info.color, flexShrink: 0,
                    boxShadow: `0 0 8px ${info.color}66`
                  }} />
                  <div>
                    <p style={{ fontWeight: 500, color: '#f0ece4', marginBottom: 4, fontSize: 15 }}>
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p style={{ fontSize: 12, color: '#555' }}>
                      {new Date(order.created_at).toLocaleDateString('en-PK', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                      &nbsp;·&nbsp;
                      {order.order_items?.length} item{order.order_items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#c9a96e', marginBottom: 4 }}>
                      Rs {Number(order.total).toLocaleString()}
                    </p>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px',
                      borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: `${info.color}18`, color: info.color,
                      border: `1px solid ${info.color}44`
                    }}>{info.label}</span>
                  </div>
                  <span style={{ color: '#444', fontSize: 18, transition: 'transform 0.3s', display: 'block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>⌄</span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ padding: '28px' }}>

                  {/* Progress tracker */}
                  {!isCancelled && (
                    <div style={{ marginBottom: 36 }}>
                      <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 20 }}>Order Progress</p>
                      <div style={{ position: 'relative' }}>
                        {/* Track line */}
                        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                        <div style={{
                          position: 'absolute', top: 16, left: 16,
                          height: 1, background: '#c9a96e',
                          width: stepIdx === -1 ? '0%' : `${(stepIdx / (statusSteps.length - 1)) * 100}%`,
                          transition: 'width 0.6s ease'
                        }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                          {statusSteps.map((step, i) => {
                            const done    = i <= stepIdx
                            const current = i === stepIdx
                            return (
                              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%',
                                  border: `1px solid ${done ? '#c9a96e' : 'rgba(255,255,255,0.1)'}`,
                                  background: done ? (current ? '#c9a96e' : 'rgba(201,169,110,0.15)') : 'transparent',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.4s', zIndex: 1,
                                  boxShadow: current ? '0 0 12px rgba(201,169,110,0.4)' : 'none'
                                }}>
                                  {done && !current && <span style={{ color: '#c9a96e', fontSize: 14 }}>✓</span>}
                                  {current && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0a0a0a', display: 'block' }} />}
                                </div>
                                <p style={{
                                  fontSize: 11, letterSpacing: '0.08em', textAlign: 'center',
                                  color: done ? '#c9a96e' : '#444',
                                  textTransform: 'uppercase', fontWeight: done ? 500 : 400
                                }}>
                                  {statusInfo[step].label}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div style={{
                        marginTop: 24, padding: '14px 20px',
                        borderLeft: `2px solid ${info.color}`,
                        background: `${info.color}0a`
                      }}>
                        <p style={{ fontSize: 13, color: '#a09888', lineHeight: 1.7 }}>{info.desc}</p>
                      </div>
                    </div>
                  )}

                  {isCancelled && (
                    <div style={{
                      marginBottom: 28, padding: '14px 20px',
                      borderLeft: '2px solid #ef4444',
                      background: 'rgba(239,68,68,0.06)'
                    }}>
                      <p style={{ fontSize: 13, color: '#fca5a5', lineHeight: 1.7 }}>{info.desc}</p>
                    </div>
                  )}

                  {/* Items */}
                  <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 16 }}>Items Ordered</p>
                  <div style={{ marginBottom: 28 }}>
                    {order.order_items?.map((item, i) => {
                      const v     = item.product_variants
                      const p     = v?.products
                      const price = item.unit_price
                      return (
                        <div key={i} style={{
                          display: 'flex', gap: 16, padding: '14px 0',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          alignItems: 'center'
                        }}>
                          <div style={{ width: 56, height: 64, background: '#111', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', flexShrink: 0 }}>
                            {p?.image_url && <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 15, color: '#f0ece4', marginBottom: 4 }}>{p?.name}</p>
                            <p style={{ fontSize: 12, color: '#555' }}>
                              {v?.size && `Size: ${v.size}`}
                              {v?.size && v?.color && ' · '}
                              {v?.color && v.color}
                              {' · '}Qty: {item.quantity}
                            </p>
                          </div>
                          <p style={{ fontSize: 14, color: '#c9a96e', whiteSpace: 'nowrap' }}>
                            Rs {(price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Order summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="order-summary">
                    <div>
                      <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 14 }}>Delivery Address</p>
                      <p style={{ fontSize: 13, color: '#a09888', lineHeight: 1.8 }}>{order.shipping_address}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 14 }}>Payment</p>
                      {[
                        ['Method',  order.payment_method?.toUpperCase() || 'COD'],
                        ['Status',  order.payment_status?.toUpperCase() || 'UNPAID'],
                        ['Subtotal', `Rs ${Number(order.subtotal).toLocaleString()}`],
                        ['Delivery', 'Rs 300'],
                        ['Total',    `Rs ${Number(order.total).toLocaleString()}`],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: '#555' }}>{k}</span>
                          <span style={{ fontSize: 13, color: '#a09888' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .orders-container { padding: 30px 16px !important; }
          .orders-h1 { font-size: 32px !important; }
          .order-summary { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
      `}</style>
    </ShopLayout>
  )
}