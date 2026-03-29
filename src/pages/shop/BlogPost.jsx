import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ShopLayout from '../../components/ShopLayout'
import { supabase } from '../../supabase'

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:\'Playfair Display\',serif;font-size:28px;font-weight:600;margin:36px 0 16px;color:#f0ece4">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-family:\'Playfair Display\',serif;font-size:22px;font-weight:600;margin:28px 0 12px;color:#f0ece4">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f0ece4;font-weight:500">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#a09888">$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin-bottom:8px;color:#a09888">$1</li>')
    .replace(/(<li.*<\/li>)/gs, '<ul style="padding-left:24px;margin:16px 0">$1</ul>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:40px 0">')
    .replace(/\n\n/g, '</p><p style="margin-bottom:20px;color:#888;line-height:1.9;font-size:16px">')
    .replace(/^(?!<)(.+)/, '<p style="margin-bottom:20px;color:#888;line-height:1.9;font-size:16px">$1</p>')
}

export default function BlogPost() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const [post, setPost]         = useState(null)
  const [related, setRelated]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    supabase.from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
      .then(({ data }) => {
        setPost(data)
        setLoading(false)
        setTimeout(() => setVisible(true), 100)
        if (data) {
          supabase.from('blog_posts')
            .select('id, title, slug, cover_image_url, category, created_at')
            .eq('is_published', true)
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(3)
            .then(({ data: rel }) => setRelated(rel || []))
        }
      })
  }, [slug])

  if (loading) return (
    <ShopLayout>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '1px solid #c9a96e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </ShopLayout>
  )

  if (!post) return (
    <ShopLayout>
      <div style={{ textAlign: 'center', padding: '100px 48px' }}>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, color: '#555', fontStyle: 'italic', marginBottom: 24 }}>Post not found</p>
        <button className="gold-btn" onClick={() => navigate('/blog')} style={{ padding: '13px 32px', border: 'none', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer', color: '#0a0a0a' }}>
          Back to Blog
        </button>
      </div>
    </ShopLayout>
  )

  return (
    <ShopLayout>
      <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>

        {/* Cover image */}
        {post.cover_image_url && (
          <div style={{ height: '55vh', overflow: 'hidden', position: 'relative' }}>
            <img src={post.cover_image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0a 0%, transparent 60%)' }} />
          </div>
        )}

        {/* Post content */}
        <div style={{ maxWidth: 740, margin: '0 auto', padding: post.cover_image_url ? '0 48px 80px' : '80px 48px' }} className="post-content">

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, marginTop: post.cover_image_url ? -60 : 0, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase' }}>{post.category}</span>
            <span style={{ color: '#333' }}>·</span>
            <span style={{ fontSize: 12, color: '#555' }}>
              {new Date(post.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 'clamp(32px, 5vw, 48px)',
            color: '#f0ece4', lineHeight: 1.15,
            marginBottom: 24, position: 'relative', zIndex: 1
          }}>{post.title}</h1>

          {post.excerpt && (
            <p style={{ fontSize: 18, color: '#777', lineHeight: 1.8, marginBottom: 40, fontStyle: 'italic', borderLeft: '2px solid rgba(201,169,110,0.4)', paddingLeft: 20 }}>
              {post.excerpt}
            </p>
          )}

          <div style={{ width: 40, height: 1, background: 'rgba(201,169,110,0.3)', marginBottom: 40 }} />

          {/* Content */}
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />

          {/* Back link */}
          <div style={{ marginTop: 60, paddingTop: 40, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button className="ghost-btn" onClick={() => navigate('/blog')} style={{
              padding: '12px 28px', fontSize: 12, letterSpacing: '0.15em',
              textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer'
            }}>← Back to Journal</button>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 48px' }} className="related-section">
            <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>Continue Reading</p>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 32, color: '#f0ece4', textAlign: 'center', marginBottom: 40 }} className="related-h2">Related Articles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, maxWidth: 960, margin: '0 auto' }} className="related-grid">
              {related.map(r => (
                <div key={r.id} onClick={() => navigate(`/blog/${r.slug}`)} style={{
                  border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.3s'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ height: 160, background: '#111', overflow: 'hidden' }}>
                    {r.cover_image_url && <img src={r.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ padding: '16px 20px 20px' }}>
                    <p style={{ fontSize: 10, color: '#c9a96e', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>{r.category}</p>
                    <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 17, color: '#f0ece4', lineHeight: 1.3 }}>{r.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .post-content { padding: 0 16px 40px !important; }
          .related-section { padding: 40px 16px !important; }
          .related-h2 { font-size: 24px !important; }
          .related-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </ShopLayout>
  )
}