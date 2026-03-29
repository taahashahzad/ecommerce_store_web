import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'

export default function BlogEditor() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)

  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview]   = useState(null)
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    category: 'General', cover_image_url: '', is_published: false
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const CATEGORIES = ['General', 'Fashion', 'Lifestyle', 'Tips & Tricks', 'News', 'Deals']

  useEffect(() => {
    if (isEdit) fetchPost()
  }, [id])

  const fetchPost = async () => {
    const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single()
    if (data) setForm(data)
    setFetching(false)
  }

  const autoSlug = (title) =>
    title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e, publish = null) => {
    e.preventDefault()
    setLoading(true)

    let cover_image_url = form.cover_image_url
    if (imageFile) {
      const ext  = imageFile.name.split('.').pop()
      const path = `blog/${Date.now()}.${ext}`
      await supabase.storage.from('product-images').upload(path, imageFile)
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
      cover_image_url = urlData.publicUrl
    }

    const payload = {
      ...form,
      cover_image_url,
      is_published: publish !== null ? publish : form.is_published,
      updated_at:   new Date().toISOString()
    }

    if (isEdit) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', id)
      if (error) { alert(error.message); setLoading(false); return }
    } else {
      const { data: user } = await supabase.auth.getUser()
      const { error } = await supabase.from('blog_posts').insert({ ...payload, author_id: user.user?.id })
      if (error) { alert(error.message); setLoading(false); return }
    }

    navigate('/admin/blog')
  }

  if (fetching) return <AdminLayout><p>Loading...</p></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => navigate('/admin/blog')} style={{
          background: 'none', border: '1px solid #ddd', padding: '8px 14px',
          borderRadius: 8, cursor: 'pointer', fontSize: 13
        }}>← Back</button>
        <h1 style={{ fontSize: 24, margin: 0 }}>{isEdit ? 'Edit Post' : 'New Post'}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* Main editor */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

          <label style={lStyle}>Post Title</label>
          <input
            style={{ ...iStyle, fontSize: 18, fontWeight: 600 }}
            value={form.title}
            onChange={e => { set('title', e.target.value); if (!isEdit) set('slug', autoSlug(e.target.value)) }}
            placeholder="Your post title..."
            required
          />

          <label style={lStyle}>Excerpt (shown in blog listing)</label>
          <textarea
            style={{ ...iStyle, height: 80, resize: 'none' }}
            value={form.excerpt}
            onChange={e => set('excerpt', e.target.value)}
            placeholder="A short summary of your post..."
          />

          <label style={lStyle}>Content</label>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: '#f8f8f8', borderRadius: '8px 8px 0 0', border: '1px solid #e0e0e0', borderBottom: 'none', flexWrap: 'wrap' }}>
              {[
                { label: 'H2',     action: () => set('content', form.content + '\n## ') },
                { label: 'H3',     action: () => set('content', form.content + '\n### ') },
                { label: 'Bold',   action: () => set('content', form.content + '**bold**') },
                { label: 'Italic', action: () => set('content', form.content + '*italic*') },
                { label: '— Line', action: () => set('content', form.content + '\n\n---\n\n') },
                { label: '• List', action: () => set('content', form.content + '\n- item') },
              ].map(btn => (
                <button key={btn.label} type="button" onClick={btn.action} style={{
                  padding: '4px 10px', background: '#fff', border: '1px solid #e0e0e0',
                  borderRadius: 4, cursor: 'pointer', fontSize: 12, color: '#555'
                }}>{btn.label}</button>
              ))}
              <span style={{ fontSize: 11, color: '#ccc', marginLeft: 'auto', alignSelf: 'center' }}>Supports Markdown</span>
            </div>
            <textarea
              style={{ ...iStyle, height: 400, resize: 'vertical', borderRadius: '0 0 8px 8px', marginBottom: 0, fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7 }}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder={`Write your post content here...\n\nYou can use Markdown:\n## Heading\n**bold text**\n*italic text*\n- bullet list`}
            />
          </div>

          {/* Live preview */}
          {form.content && (
            <div style={{ marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
              <p style={{ fontSize: 12, color: '#aaa', marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Preview</p>
              <div style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }}
              />
            </div>
          )}
        </div>

        {/* Sidebar settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Publish actions */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Publish</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={e => handleSubmit(e, true)} disabled={loading} style={{
                padding: '11px 0', background: '#4f46e5', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500
              }}>{loading ? 'Saving...' : isEdit && form.is_published ? 'Save Changes' : 'Publish Now'}</button>
              <button onClick={e => handleSubmit(e, false)} disabled={loading} style={{
                padding: '11px 0', background: '#f0f0f0', color: '#555',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14
              }}>Save as Draft</button>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888' }}>
                <span>Status</span>
                <span style={{ color: form.is_published ? '#10b981' : '#aaa', fontWeight: 500 }}>
                  {form.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Cover image */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Cover Image</p>
            {(preview || form.cover_image_url) && (
              <img src={preview || form.cover_image_url} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 13, width: '100%' }} />
          </div>

          {/* Category & slug */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Settings</p>

            <label style={lStyle}>Category</label>
            <select style={iStyle} value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label style={lStyle}>URL Slug</label>
            <input
              style={iStyle}
              value={form.slug}
              onChange={e => set('slug', autoSlug(e.target.value))}
              placeholder="post-url-slug"
            />
            <p style={{ fontSize: 11, color: '#aaa', marginTop: -12 }}>/blog/{form.slug || 'post-slug'}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function renderMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:20px;font-weight:600;margin:24px 0 12px;color:#1a1a2e">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:17px;font-weight:600;margin:20px 0 10px;color:#1a1a2e">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li style="margin-bottom:4px">$1</li>')
    .replace(/(<li.*<\/li>)/gs, '<ul style="padding-left:20px;margin:12px 0">$1</ul>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #eee;margin:24px 0">')
    .replace(/\n\n/g, '</p><p style="margin-bottom:16px">')
    .replace(/^(?!<[h|u|l|h])(.+)/, '<p style="margin-bottom:16px">$1</p>')
}

const lStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }
const iStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: 'border-box', outline: 'none' }