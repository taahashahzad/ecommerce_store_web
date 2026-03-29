import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'

export default function Blog() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const togglePublish = async (id, current) => {
    await supabase.from('blog_posts').update({ is_published: !current }).eq('id', id)
    fetchPosts()
  }

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    fetchPosts()
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Blog</h1>
          <p style={{ color: '#888', fontSize: 13 }}>{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => navigate('/admin/blog/new')} style={{
          background: '#4f46e5', color: '#fff', border: 'none',
          padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14
        }}>+ New Post</button>
      </div>

      {loading ? <p>Loading...</p> : posts.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 18, color: '#aaa', marginBottom: 8 }}>No posts yet</p>
          <p style={{ fontSize: 14, color: '#ccc' }}>Write your first blog post to attract customers.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map(post => (
            <div key={post.id} style={{
              background: '#fff', borderRadius: 12, padding: '20px 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', gap: 20,
              borderLeft: `4px solid ${post.is_published ? '#10b981' : '#e0e0e0'}`
            }}>
              {post.cover_image_url && (
                <img src={post.cover_image_url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0, maxWidth: '500px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</p>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                    background: post.is_published ? '#dcfce7' : '#f0f0f0',
                    color: post.is_published ? '#15803d' : '#888',
                    textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0
                  }}>{post.is_published ? 'Published' : 'Draft'}</span>
                </div>
                <p style={{ fontSize: 13, color: '#aaa', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {post.excerpt || 'No excerpt'}
                </p>
                <p style={{ fontSize: 11, color: '#ccc' }}>
                  {post.category} · {new Date(post.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => navigate(`/admin/blog/edit/${post.id}`)} style={{
                  padding: '7px 14px', borderRadius: 6, border: '1px solid #ddd',
                  cursor: 'pointer', fontSize: 12, background: '#fff'
                }}>Edit</button>
                <button onClick={() => togglePublish(post.id, post.is_published)} style={{
                  padding: '7px 14px', borderRadius: 6, border: 'none',
                  cursor: 'pointer', fontSize: 12,
                  background: post.is_published ? '#fef9c3' : '#dcfce7',
                  color: post.is_published ? '#854d0e' : '#15803d'
                }}>{post.is_published ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => deletePost(post.id)} style={{
                  padding: '7px 14px', borderRadius: 6, border: 'none',
                  cursor: 'pointer', fontSize: 12, background: '#fee2e2', color: '#dc2626'
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}