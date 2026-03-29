import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShopLayout from '../../components/ShopLayout'
import { supabase } from '../../supabase'

export default function Blog() {
  const [posts, setPosts]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [categories, setCategories] = useState(['All'])
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data || [])
        const cats = ['All', ...new Set(data?.map(p => p.category).filter(Boolean))]
        setCategories(cats)
        setLoading(false)
      })
  }, [])

  const filtered = activeCategory === 'All' ? posts : posts.filter(p => p.category === activeCategory)

  return (
    <ShopLayout>
      <div style={{ padding: '60px 48px', animation: 'fadeUp 0.6s ease both' }} className="blog-container">

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 16 }}>Our Journal</p>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 52, color: '#f0ece4', marginBottom: 16, lineHeight: 1.1 }} className="blog-h1">
            Stories & Ideas
          </h1>
          <p style={{ color: '#555', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Tips, trends, and insights from our team to help you style better and live well.
          </p>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`category-pill${activeCategory === c ? ' active' : ''}`}
              style={{
                padding: '8px 22px', border: 'none', cursor: 'pointer',
                fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
                fontFamily: '"DM Sans", sans-serif',
                background: activeCategory === c ? '#c9a96e' : 'transparent',
                color: activeCategory === c ? '#0a0a0a' : '#a09888',
              }}
            >{c}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '1px solid #c9a96e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 24, color: '#333', fontStyle: 'italic' }}>No posts yet</p>
          </div>
        ) : (
          <div>
            {/* Featured post */}
            {filtered[0] && (
              <div onClick={() => navigate(`/blog/${filtered[0].slug}`)} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
                border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32,
                cursor: 'pointer', overflow: 'hidden',
                transition: 'transform 0.3s'
              }} className="featured-post"
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ height: 360, background: '#111', overflow: 'hidden' }}>
                  {filtered[0].cover_image_url
                    ? <img src={filtered[0].cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    : <div style={{ height: '100%', background: '#1a1a0e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#333', fontFamily: '"Playfair Display", serif', fontStyle: 'italic' }}>No cover</span>
                      </div>
                  }
                </div>
                <div style={{ padding: 40, background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="featured-text">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <span style={{ fontSize: 10, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase' }}>{filtered[0].category}</span>
                    <span style={{ color: '#333', fontSize: 10 }}>·</span>
                    <span style={{ fontSize: 11, color: '#555' }}>{new Date(filtered[0].created_at).toLocaleDateString('en-PK', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 30, color: '#f0ece4', lineHeight: 1.25, marginBottom: 16 }} className="featured-h2">{filtered[0].title}</h2>
                  <p style={{ color: '#777', lineHeight: 1.8, fontSize: 14, marginBottom: 28 }}>{filtered[0].excerpt}</p>
                  <span style={{ fontSize: 12, color: '#c9a96e', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Read Article →</span>
                </div>
              </div>
            )}

            {/* Rest of posts grid */}
            {filtered.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }} className="posts-grid">
                {filtered.slice(1).map((post, i) => (
                  <div key={post.id} onClick={() => navigate(`/blog/${post.slug}`)} style={{
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer', overflow: 'hidden',
                    animation: `fadeUp 0.5s ease both`, animationDelay: `${i * 0.07}s`,
                    transition: 'transform 0.3s'
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ height: 200, background: '#111', overflow: 'hidden' }}>
                      {post.cover_image_url
                        ? <img src={post.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                          />
                        : <div style={{ height: '100%', background: '#1a1a0e' }} />
                      }
                    </div>
                    <div style={{ padding: '20px 24px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: 10, letterSpacing: '0.25em', color: '#c9a96e', textTransform: 'uppercase' }}>{post.category}</span>
                        <span style={{ color: '#333', fontSize: 10 }}>·</span>
                        <span style={{ fontSize: 11, color: '#555' }}>{new Date(post.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 20, color: '#f0ece4', lineHeight: 1.3, marginBottom: 10 }}>{post.title}</h3>
                      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 16 }}>{post.excerpt}</p>
                      <span style={{ fontSize: 11, color: '#c9a96e', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Read More →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .blog-container { padding: 30px 16px !important; }
          .blog-h1 { font-size: 36px !important; }
          .featured-post { grid-template-columns: 1fr !important; }
          .featured-text { padding: 20px !important; }
          .featured-h2 { font-size: 24px !important; }
          .posts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </ShopLayout>
  )
}