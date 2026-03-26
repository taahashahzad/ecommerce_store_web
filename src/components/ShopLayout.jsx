import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../supabase'

export default function ShopLayout({ children }) {
  const { cartCount, user, setUser } = useCart()
  const navigate = useNavigate()

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: 'sans-serif' }}>
      <nav style={{
        background: '#fff', padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <Link to="/" style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', textDecoration: 'none' }}>
          MyShop
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/" style={navLink}>Home</Link>
          {user ? (
            <button onClick={logout} style={navBtn}>Logout</button>
          ) : (
            <Link to="/login" style={navLink}>Login</Link>
          )}
          <Link to="/cart" style={{
            ...navLink, background: '#1a1a2e', color: '#fff',
            padding: '8px 16px', borderRadius: 8
          }}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
        </div>
      </nav>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </div>
    </div>
  )
}

const navLink = { color: '#333', textDecoration: 'none', fontSize: 15 }
const navBtn  = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#333' }