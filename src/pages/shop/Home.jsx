import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShopLayout from '../../components/ShopLayout'
import { supabase } from '../../supabase'

export default function Home() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => { fetchProducts() }, [activeCategory, search])

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase.from('products').select('*, categories(name)').eq('is_active', true)
    if (activeCategory !== 'all') {
      const categoryId = Number(activeCategory)
      if (!Number.isNaN(categoryId)) query = query.eq('category_id', categoryId)
    }
    if (search) query = query.ilike('name', `%${search}%`)
    const { data } = await query.order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  return (
    <ShopLayout>
      <div style={{ marginBottom: 32 }}>
        <input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '14px 20px', fontSize: 16,
            border: '1px solid #e0e0e0', borderRadius: 12,
            boxSizing: 'border-box', background: '#fff'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        {[{ id: 'all', name: 'All' }, ...categories].map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
            padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: activeCategory === c.id ? '#1a1a2e' : '#fff',
            color: activeCategory === c.id ? '#fff' : '#333',
            fontSize: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
          }}>{c.name}</button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : products.length === 0 ? (
        <p style={{ color: '#aaa', textAlign: 'center', padding: 60 }}>No products found</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 24
        }}>
          {products.map(p => (
            <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={{
              background: '#fff', borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ height: 200, background: '#f0f0f0', overflow: 'hidden' }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No image</div>
                }
              </div>
              <div style={{ padding: 16 }}>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{p.categories?.name}</p>
                <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 15 }}>{p.name}</p>
                <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: 17 }}>Rs {Number(p.base_price).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </ShopLayout>
  )
}