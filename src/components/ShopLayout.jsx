import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../supabase'
import AuthModal from './AuthModal'

export default function ShopLayout({ children }) {
  const { cartCount, user, setUser, setShowAuthModal } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0ece4', fontFamily: '"DM Sans", sans-serif' }}>
      <AuthModal /> 
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        .nav-link { position: relative; color: #a09888; text-decoration: none; font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; transition: color 0.3s; }
        .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px; background: #c9a96e; transition: width 0.3s; }
        .nav-link:hover { color: #f0ece4; }
        .nav-link:hover::after { width: 100%; }
        .product-card { transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94); }
        .product-card:hover { transform: translateY(-8px); }
        .product-card:hover .card-img { transform: scale(1.06); }
        .card-img { transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94); }
        .gold-btn { background: linear-gradient(135deg, #c9a96e, #e8c98a, #c9a96e); background-size: 200% auto; transition: background-position 0.4s, transform 0.2s, box-shadow 0.2s; }
        .gold-btn:hover { background-position: right center; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(201,169,110,0.35); }
        .ghost-btn { border: 1px solid rgba(201,169,110,0.4); color: #c9a96e; background: transparent; transition: all 0.3s; }
        .ghost-btn:hover { background: rgba(201,169,110,0.08); border-color: #c9a96e; }
        .category-pill { transition: all 0.25s; border: 1px solid rgba(240,236,228,0.12); }
        .category-pill:hover { border-color: rgba(201,169,110,0.5); color: #c9a96e; }
        .category-pill.active { background: #c9a96e; border-color: #c9a96e; color: #0a0a0a; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0a; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        input, textarea, select { outline: none; }
        input::placeholder, textarea::placeholder { color: #555; }
      `}</style>

      <style>{`
        @media (max-width: 768px) {
          nav { padding: 0 16px !important; }
          .nav-links { display: none !important; }
          .hamburger { display: flex !important; }
          main { padding: 16px !important; }
          footer { padding: 24px !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '0 48px', height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 700, color: '#f0ece4', letterSpacing: '0.04em' }}>MYSHOP</span>
            <span style={{ fontSize: 9, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase' }}>Premium Store</span>
          </div>
        </Link>

        <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger" style={{
          display: 'none', background: 'none', border: 'none', cursor: 'pointer',
          width: 44, height: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4
        }}>
          <div style={{ width: 20, height: 2, background: '#f0ece4', transition: '0.3s' }}></div>
          <div style={{ width: 20, height: 2, background: '#f0ece4', transition: '0.3s' }}></div>
          <div style={{ width: 20, height: 2, background: '#f0ece4', transition: '0.3s' }}></div>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 36, flexWrap: 'wrap' }} className="nav-links">
          <Link to="/" className="nav-link">Collection</Link>
          <Link to="/blog" className="nav-link">Journal</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ fontSize: 12, color: '#777', letterSpacing: '0.08em' }}>
                {user.email?.split('@')[0]}
              </span>
              <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}
            >
              Sign In
            </button>
          )}
          {user && (
            <Link to="/my-orders" className="nav-link">My Orders</Link>
          )}
          <Link to="/cart" style={{ textDecoration: 'none', position: 'relative' }}>
            <div style={{
              width: 44, height: 44, border: '1px solid rgba(201,169,110,0.3)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#c9a96e', fontSize: 18, transition: 'all 0.3s', cursor: 'pointer'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.1)'; e.currentTarget.style.borderColor = '#c9a96e' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)' }}
            >
              ⌀
            </div>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#c9a96e', color: '#0a0a0a',
                width: 18, height: 18, borderRadius: '50%',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 0.4s ease'
              }}>{cartCount}</span>
            )}
          </Link>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="mobile-menu" style={{
        position: 'fixed', top: 72, left: 0, right: 0,
        background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: menuOpen ? 'block' : 'none', zIndex: 999
      }}>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Collection</Link>
          <Link to="/blog" className="nav-link" onClick={() => setMenuOpen(false)}>Journal</Link>
          <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</Link>
          {user ? (
            <>
              <span style={{ fontSize: 12, color: '#777', letterSpacing: '0.08em' }}>
                {user.email?.split('@')[0]}
              </span>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => { setShowAuthModal(true); setMenuOpen(false) }}
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}
            >
              Sign In
            </button>
          )}
          {user && <Link to="/my-orders" className="nav-link" onClick={() => setMenuOpen(false)}>My Orders</Link>}
        </div>
      </div>

      <main style={{ paddingTop: 72 }}>{children}</main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px', marginTop: 80, textAlign: 'center' }}>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: '#c9a96e', marginBottom: 8 }}>MYSHOP</p>
        <p style={{ fontSize: 13, color: '#555', letterSpacing: '0.08em' }}>© 2025 · Premium Shopping Experience</p>
      </footer>
    </div>
  )
}