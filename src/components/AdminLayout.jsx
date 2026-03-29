import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const [newOrders, setNewOrders] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    fetchNewOrders()
    fetchUnreadMessages()

    // Realtime subscription — updates badge instantly when new order arrives
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchNewOrders()
      })
      .subscribe()

    // Realtime subscription for messages
    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
        fetchUnreadMessages()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(messagesChannel)
    }
  }, [])

  const fetchNewOrders = async () => {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    setNewOrders(count || 0)
  }

  const fetchUnreadMessages = async () => {
    const { count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
    setUnreadMessages(count || 0)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', badge: null },
    { to: '/admin/products',  label: 'Products',  badge: null },
    { to: '/admin/categories', label: 'Categories', badge: null },
    { to: '/admin/blog',       label: 'Blog',       badge: null },
    { to: '/admin/orders',    label: 'Orders',    badge: newOrders > 0 ? newOrders : null },
    { to: '/admin/messages',   label: 'Messages',   badge: unreadMessages > 0 ? unreadMessages : null },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside style={{
        width: 220, background: '#1a1a2e', color: '#fff',
        display: 'flex', flexDirection: 'column', padding: '24px 0',
        position: 'sticky', top: 0, height: '100vh'
      }}>
        <div style={{ padding: '0 24px 32px', fontSize: 20, fontWeight: 700 }}>
          MyShop Admin
        </div>

        {navLinks.map(link => (
          <Link key={link.to} to={link.to} style={{
            padding: '12px 24px', color: '#ccc',
            textDecoration: 'none', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span>{link.label}</span>
            {link.badge && (
              <span style={{
                background: '#e74c3c', color: '#fff',
                fontSize: 11, fontWeight: 700,
                padding: '2px 7px', borderRadius: 10,
                animation: 'pulse 1.5s ease infinite'
              }}>
                {link.badge}
              </span>
            )}
          </Link>
        ))}

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }`}</style>

        <button onClick={logout} style={{
          marginTop: 'auto', marginInline: 24, padding: '10px 0',
          background: '#e74c3c', color: '#fff', border: 'none',
          borderRadius: 8, cursor: 'pointer', fontSize: 14
        }}>Logout</button>
      </aside>

      <main style={{ flex: 1, background: '#f5f6fa', padding: 32 }}>
        {children}
      </main>
    </div>
  )
}