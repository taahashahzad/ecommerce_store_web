import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0, orders: 0, revenue: 0, customers: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: products }, { count: orders }, { count: customers }, { data: revenue }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total').eq('payment_status', 'paid'),
      ])
      const total = revenue?.reduce((sum, o) => sum + Number(o.total), 0) || 0
      setStats({ products, orders, customers, revenue: total })
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Total Products', value: stats.products, color: '#4f46e5' },
    { label: 'Total Orders',   value: stats.orders,   color: '#0891b2' },
    { label: 'Total Revenue',  value: `Rs ${stats.revenue.toLocaleString()}`, color: '#16a34a' },
    { label: 'Customers',      value: stats.customers, color: '#dc2626' },
  ]

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 8, fontSize: 24 }}>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Welcome back, Admin</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {cards.map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: 12, padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderTop: `4px solid ${card.color}`
          }}>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>{card.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}