import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside style={{
        width: 220, background: '#1a1a2e', color: '#fff',
        display: 'flex', flexDirection: 'column', padding: '24px 0'
      }}>
        <div style={{ padding: '0 24px 32px', fontSize: 20, fontWeight: 700 }}>
          MyShop Admin
        </div>
        {[
          { to: '/admin/dashboard', label: 'Dashboard' },
          { to: '/admin/products', label: 'Products' },
          { to: '/admin/orders',   label: 'Orders' },
        ].map(link => (
          <Link key={link.to} to={link.to} style={{
            padding: '12px 24px', color: '#ccc',
            textDecoration: 'none', fontSize: 15
          }}>{link.label}</Link>
        ))}
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