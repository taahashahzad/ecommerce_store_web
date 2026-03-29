import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

export default function Dashboard() {
  const [stats, setStats]           = useState({ products: 0, orders: 0, revenue: 0, customers: 0, pending: 0, delivered: 0 })
  const [salesData, setSalesData]   = useState([])
  const [statusData, setStatusData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading]       = useState(true)
  const [period, setPeriod]         = useState(7)
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [period])

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchStats(), fetchSalesData(), fetchStatusData(), fetchTopProducts(), fetchRecentOrders()])
    setLoading(false)
  }

  const fetchStats = async () => {
    const [
      { count: products },
      { count: orders },
      { count: customers },
      { count: pending },
      { count: delivered },
      { data: revenue }
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
      supabase.from('orders').select('total').eq('status', 'delivered'),
    ])
    const total = revenue?.reduce((s, o) => s + Number(o.total), 0) || 0
    setStats({ products, orders, customers, pending, delivered, revenue: total })
  }

  const fetchSalesData = async () => {
    const days  = []
    const today = new Date()
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split('T')[0])
    }

    const since = new Date(today)
    since.setDate(since.getDate() - period)

    const { data: orders } = await supabase
      .from('orders')
      .select('created_at, total, status')
      .gte('created_at', since.toISOString())

    const map = {}
    days.forEach(d => map[d] = { date: d, revenue: 0, orders: 0 })

    orders?.forEach(o => {
      const d = o.created_at.split('T')[0]
      if (map[d]) {
        map[d].orders += 1
        if (o.status === 'delivered') map[d].revenue += Number(o.total)
      }
    })

    setSalesData(days.map(d => ({
      date: new Date(d).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
      revenue: map[d].revenue,
      orders:  map[d].orders
    })))
  }

  const fetchStatusData = async () => {
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    const results  = await Promise.all(
      statuses.map(s => supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', s))
    )
    setStatusData(statuses.map((s, i) => ({
      name:  s.charAt(0).toUpperCase() + s.slice(1),
      value: results[i].count || 0
    })).filter(d => d.value > 0))
  }

  const fetchTopProducts = async () => {
    const { data } = await supabase
      .from('order_items')
      .select('quantity, unit_price, product_variants(products(name, image_url))')
      .limit(100)

    const map = {}
    data?.forEach(item => {
      const name = item.product_variants?.products?.name
      if (!name) return
      if (!map[name]) map[name] = { name, revenue: 0, quantity: 0, image: item.product_variants?.products?.image_url }
      map[name].revenue  += Number(item.unit_price) * item.quantity
      map[name].quantity += item.quantity
    })

    setTopProducts(Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5))
  }

  const fetchRecentOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5)
    setRecentOrders(data || [])
  }

  const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444']

  const statusColor = {
    pending:   { bg: '#fef9c3', color: '#854d0e' },
    confirmed: { bg: '#dbeafe', color: '#1e40af' },
    shipped:   { bg: '#f3e8ff', color: '#6b21a8' },
    delivered: { bg: '#dcfce7', color: '#15803d' },
    cancelled: { bg: '#fee2e2', color: '#b91c1c' },
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: 8 }}>
        <p style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 500 }}>
            {p.name === 'revenue' ? `Rs ${Number(p.value).toLocaleString()}` : `${p.value} orders`}
          </p>
        ))}
      </div>
    )
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: '#888', fontSize: 13 }}>Welcome back — here's what's happening</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setPeriod(d)} style={{
              padding: '7px 16px', borderRadius: 20, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: period === d ? '#1a1a2e' : '#fff',
              color: period === d ? '#fff' : '#666',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}>Last {d}d</button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue',   value: `Rs ${stats.revenue.toLocaleString()}`, sub: 'From delivered orders', color: '#10b981', icon: '◈' },
          { label: 'Total Orders',    value: stats.orders,    sub: `${stats.pending} pending`,   color: '#f59e0b', icon: '◎' },
          { label: 'Customers',       value: stats.customers, sub: 'Registered accounts',         color: '#3b82f6', icon: '◇' },
          { label: 'Products',        value: stats.products,  sub: 'In catalogue',                color: '#8b5cf6', icon: '▣' },
          { label: 'Pending Orders',  value: stats.pending,   sub: 'Awaiting confirmation',       color: '#f59e0b', icon: '⊙', alert: stats.pending > 0 },
          { label: 'Delivered',       value: stats.delivered, sub: 'Completed orders',            color: '#10b981', icon: '✓' },
        ].map(card => (
          <div key={card.label} onClick={() => card.label.includes('Order') && navigate('/admin/orders')} style={{
            background: '#fff', borderRadius: 12, padding: '20px 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderLeft: `4px solid ${card.color}`,
            cursor: card.label.includes('Order') ? 'pointer' : 'default',
            border: card.alert ? `1.5px solid ${card.color}` : `1.5px solid transparent`,
            borderLeft: `4px solid ${card.color}`,
            transition: 'transform 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#888', fontSize: 12, marginBottom: 8, letterSpacing: '0.05em' }}>{card.label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: card.color, marginBottom: 4 }}>{card.value}</p>
                <p style={{ fontSize: 12, color: '#aaa' }}>{card.sub}</p>
              </div>
              <span style={{ fontSize: 22, color: card.color, opacity: 0.4 }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Revenue area chart */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Revenue Over Time</p>
          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>Daily revenue from delivered orders</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} tickFormatter={v => `Rs ${v.toLocaleString()}`} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#4f46e5" strokeWidth={2} fill="url(#revenueGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Order Status</p>
          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 16 }}>Breakdown of all orders</p>
          {statusData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 13 }}>No orders yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {statusData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ fontSize: 12, color: '#666' }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Orders bar chart */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Orders Per Day</p>
        <p style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>Number of orders placed each day</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={salesData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#aaa' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="orders" name="orders" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Top products */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Top Products</p>
          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>By total revenue generated</p>
          {topProducts.length === 0 ? (
            <p style={{ color: '#ccc', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No sales data yet</p>
          ) : topProducts.map((p, i) => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#ddd', width: 20 }}>#{i + 1}</span>
              <div style={{ width: 36, height: 36, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                {p.image && <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                <p style={{ fontSize: 11, color: '#aaa' }}>{p.quantity} sold</p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5', whiteSpace: 'nowrap' }}>Rs {p.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Recent Orders</p>
              <p style={{ fontSize: 12, color: '#aaa' }}>Last 5 orders placed</p>
            </div>
            <button onClick={() => navigate('/admin/orders')} style={{
              background: 'none', border: '1px solid #e0e0e0', padding: '6px 14px',
              borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#666'
            }}>View All</button>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ color: '#ccc', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No orders yet</p>
          ) : recentOrders.map(order => (
            <div key={order.id} onClick={() => navigate('/admin/orders')} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p style={{ fontSize: 11, color: '#aaa' }}>
                  {order.profiles?.full_name || 'Guest'} · {new Date(order.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 4 }}>Rs {Number(order.total).toLocaleString()}</p>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                  background: statusColor[order.status]?.bg,
                  color: statusColor[order.status]?.color,
                  textTransform: 'capitalize'
                }}>{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}