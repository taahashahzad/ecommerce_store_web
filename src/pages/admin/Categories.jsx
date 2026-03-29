import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [form, setForm] = useState({ name: '', slug: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*, products(count)')
      .order('name')
    setCategories(data || [])
    setLoading(false)
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', slug: '' })
    setShowForm(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setForm({ name: cat.name, slug: cat.slug })
    setShowForm(true)
  }

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    if (editing) {
      const { error } = await supabase
        .from('categories')
        .update({ name: form.name, slug: form.slug })
        .eq('id', editing.id)
      if (error) { alert(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({ name: form.name, slug: form.slug })
      if (error) { alert(error.message); setSaving(false); return }
    }

    setSaving(false)
    setShowForm(false)
    fetchCategories()
  }

  const deleteCategory = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? Products in this category will be uncategorized.`)) return
    await supabase.from('categories').delete().eq('id', cat.id)
    fetchCategories()
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Categories</h1>
        <button onClick={openAdd} style={{
          background: '#4f46e5', color: '#fff', border: 'none',
          padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14
        }}>+ Add Category</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 24
        }} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 12, padding: 32,
            width: '100%', maxWidth: 440,
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ fontSize: 20, marginBottom: 24 }}>
              {editing ? 'Edit Category' : 'Add Category'}
            </h2>

            <form onSubmit={handleSubmit}>
              <label style={lStyle}>Category Name</label>
              <input
                style={iStyle}
                value={form.name}
                onChange={e => {
                  set('name', e.target.value)
                  if (!editing) set('slug', autoSlug(e.target.value))
                }}
                required
                placeholder="e.g. Clothing"
                autoFocus
              />

              <label style={lStyle}>Slug (URL-friendly name)</label>
              <input
                style={iStyle}
                value={form.slug}
                onChange={e => set('slug', autoSlug(e.target.value))}
                required
                placeholder="e.g. clothing"
              />
              <p style={{ fontSize: 12, color: '#aaa', marginTop: -12, marginBottom: 20 }}>
                Auto-generated from name. Only lowercase letters, numbers, hyphens.
              </p>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: '12px 0', background: '#4f46e5',
                  color: '#fff', border: 'none', borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15,
                  opacity: saving ? 0.7 : 1
                }}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Category'}</button>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '12px 0', background: '#f0f0f0',
                  color: '#333', border: 'none', borderRadius: 8,
                  cursor: 'pointer', fontSize: 15
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories list */}
      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {categories.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#aaa' }}>
              <p style={{ fontSize: 18, marginBottom: 8 }}>No categories yet</p>
              <p style={{ fontSize: 14 }}>Add your first category to organise your products.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f8f8', textAlign: 'left' }}>
                  {['Name', 'Slug', 'Products', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', fontSize: 13, color: '#666', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{cat.name}</p>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        background: '#f0f0f0', color: '#666',
                        padding: '3px 10px', borderRadius: 4,
                        fontSize: 12, fontFamily: 'monospace'
                      }}>{cat.slug}</span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#666', fontSize: 14 }}>
                      {cat.products?.[0]?.count ?? 0} product{cat.products?.[0]?.count !== 1 ? 's' : ''}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(cat)} style={{
                          padding: '6px 14px', borderRadius: 6,
                          border: '1px solid #ddd', cursor: 'pointer',
                          fontSize: 12, background: '#fff'
                        }}>Edit</button>
                        <button onClick={() => deleteCategory(cat)} style={{
                          padding: '6px 14px', borderRadius: 6, border: 'none',
                          cursor: 'pointer', fontSize: 12,
                          background: '#fee2e2', color: '#dc2626'
                        }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

const lStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }
const iStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: 'border-box', outline: 'none' }