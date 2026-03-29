import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ShopLayout from '../../components/ShopLayout'
import { supabase } from '../../supabase'

export default function Home() {
  const [products, setProducts]         = useState([])
  const [categories, setCategories]     = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(true)
  const [heroVisible, setHeroVisible]   = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => { fetchProducts() }, [activeCategory, search])

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase.from('products').select('*, categories(name), product_variants(*)').eq('is_active', true)
    if (activeCategory !== 'all') query = query.eq('category_id', activeCategory)
    if (search) query = query.ilike('name', `%${search}%`)
    const { data } = await query.order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  return (
    <ShopLayout>
      {/* Hero */}
      <div style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 60% 50%, #1a1408 0%, #0a0a0a 70%)',
      }}>
        {/* Decorative lines */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '-5%', width: '40%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)', transform: 'rotate(-15deg)' }} />
          <div style={{ position: 'absolute', bottom: '25%', right: '-5%', width: '35%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.15), transparent)', transform: 'rotate(-15deg)' }} />
          <div style={{ position: 'absolute', top: '10%', right: '15%', width: 1, height: '30%', background: 'linear-gradient(180deg, transparent, rgba(201,169,110,0.12), transparent)' }} />
        </div>

        <div style={{ textAlign: 'center', maxWidth: 800, padding: '0 32px', position: 'relative', zIndex: 1 }}>
          <div style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(32px)',
            transition: 'all 0.9s cubic-bezier(0.25,0.46,0.45,0.94)'
          }}>
            <p style={{ fontSize: 11, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 24 }}>New Collection 2025</p>
            <h1 style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 700, lineHeight: 1.05,
              color: '#f0ece4', marginBottom: 24,
              letterSpacing: '-0.02em'
            }}>
              Crafted for<br />
              <span style={{ color: '#c9a96e', fontStyle: 'italic' }}>Those Who Know</span>
            </h1>
            <p style={{ fontSize: 16, color: '#777', lineHeight: 1.8, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
              Discover our curated selection of premium products, designed with precision and delivered with care.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button className="gold-btn" onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })} style={{
                padding: '16px 40px', border: 'none', borderRadius: 2,
                fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
                fontFamily: '"DM Sans", sans-serif', cursor: 'pointer', fontWeight: 500, color: '#0a0a0a'
              }}>Shop Now</button>
              <button className="ghost-btn" style={{
                padding: '16px 40px', borderRadius: 2,
                fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
                fontFamily: '"DM Sans", sans-serif', cursor: 'pointer', fontWeight: 500
              }}>Our Story</button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.3em', color: '#555', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(180deg, #c9a96e, transparent)' }} />
        </div>
      </div>

      {/* Collection */}
      <div id="collection" style={{ padding: '80px 48px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 12 }}>Curated Selection</p>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 40, fontWeight: 600, color: '#f0ece4', margin: 0 }}>The Collection</h2>
          </div>
          <div style={{ width: 80, height: 1, background: 'rgba(201,169,110,0.3)', marginBottom: 8 }} />
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 32, maxWidth: 400 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: 14 }}>⌕</span>
          <input
            placeholder="Search the collection..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px 14px 40px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2, color: '#f0ece4', fontSize: 14,
              fontFamily: '"DM Sans", sans-serif',
              boxSizing: 'border-box', transition: 'border-color 0.3s'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 48, flexWrap: 'wrap' }}>
          {[{ id: 'all', name: 'All Pieces' }, ...categories].map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`category-pill${activeCategory === c.id ? ' active' : ''}`}
              style={{
                padding: '8px 22px', borderRadius: 2, border: 'none',
                cursor: 'pointer', fontSize: 12, letterSpacing: '0.12em',
                textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif',
                background: activeCategory === c.id ? '#c9a96e' : 'transparent',
                color: activeCategory === c.id ? '#0a0a0a' : '#a09888',
              }}
            >{c.name}</button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: 340, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease infinite' }} />
                <div style={{ padding: 24 }}>
                  <div style={{ height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 12, width: '60%' }} />
                  <div style={{ height: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 2, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 24, color: '#555', fontStyle: 'italic' }}>No pieces found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {products.map((p, idx) => (
              <div
                key={p.id}
                className="product-card"
                onClick={() => navigate(`/product/${p.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 2, overflow: 'hidden', cursor: 'pointer',
                  animation: `fadeUp 0.6s ease both`,
                  animationDelay: `${idx * 0.08}s`
                }}
              >
                <div style={{ height: 320, overflow: 'hidden', position: 'relative', background: '#111' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="card-img" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontFamily: '"Playfair Display", serif', fontSize: 13, fontStyle: 'italic' }}>No image</div>
                  }
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                    opacity: 0, transition: 'opacity 0.4s'
                  }} className="card-overlay" />
                  <div style={{
                    position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center',
                    opacity: 0, transform: 'translateY(8px)', transition: 'all 0.3s'
                  }} className="card-cta">
                    <span style={{ fontSize: 11, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase' }}>View Details</span>
                  </div>
                </div>
                <div style={{ padding: '20px 24px 24px' }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 8 }}>{p.categories?.name || 'Product'}</p>
                  <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 18, color: '#f0ece4', marginBottom: 12, lineHeight: 1.3 }}>{p.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 16, fontWeight: 500, color: '#c9a96e' }}>
                      Rs {p.product_variants?.length > 0
                        ? Math.min(...p.product_variants.map(v => Number(v.price_adjustment))).toLocaleString()
                        : Number(p.base_price).toLocaleString()}
                    </p>
                    <span style={{ fontSize: 10, letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase' }}>Shop →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features strip */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          {[
            { icon: '◈', title: 'Premium Quality', sub: 'Every product curated' },
            { icon: '◎', title: 'Fast Delivery', sub: 'Across Pakistan' },
            { icon: '◇', title: 'Secure Payment', sub: 'JazzCash · EasyPaisa · NayaPay' },
          ].map(f => (
            <div key={f.title}>
              <div style={{ fontSize: 24, color: '#c9a96e', marginBottom: 12 }}>{f.icon}</div>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#f0ece4', marginBottom: 4, letterSpacing: '0.06em' }}>{f.title}</p>
              <p style={{ fontSize: 12, color: '#555' }}>{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </ShopLayout>
  )
}