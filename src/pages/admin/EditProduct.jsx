import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(false)
  const [fetching, setFetching]     = useState(true)
  const [imageFile, setImageFile]   = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', base_price: '', category_id: '', is_active: true, image_url: ''
  })
  const [variants, setVariants] = useState([])

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    const { data: product } = await supabase.from('products').select('*').eq('id', id).single()
    const { data: vars }    = await supabase.from('product_variants').select('*').eq('product_id', id)
    if (product) {
      setForm({
        name:        product.name,
        description: product.description || '',
        base_price:  product.base_price,
        category_id: product.category_id || '',
        is_active:   product.is_active,
        image_url:   product.image_url || ''
      })
    }
    setVariants(vars || [])
    setFetching(false)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setVariant = (i, k, v) =>
    setVariants(vs => vs.map((va, idx) => idx === i ? { ...va, [k]: v } : va))

  const addVariant = () =>
    setVariants(vs => [...vs, { size: '', color: '', stock_qty: '', price_adjustment: 0, isNew: true }])

  const deleteVariant = async (variant) => {
    if (variant.isNew) {
      setVariants(vs => vs.filter((_, i) => vs.indexOf(variant) !== i))
      return
    }
    if (!window.confirm('Delete this variant?')) return
    await supabase.from('product_variants').delete().eq('id', variant.id)
    setVariants(vs => vs.filter(v => v.id !== variant.id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    let image_url = form.image_url
    if (imageFile) {
      const ext  = imageFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      await supabase.storage.from('product-images').upload(path, imageFile)
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const { error } = await supabase.from('products').update({
      name:        form.name,
      description: form.description,
      base_price:  Number(form.base_price),
      category_id: form.category_id || null,
      is_active:   form.is_active,
      image_url
    }).eq('id', id)

    if (error) { alert('Error: ' + error.message); setLoading(false); return }

    // Update existing variants, insert new ones
    for (const v of variants) {
      if (v.isNew) {
        if (v.size || v.color) {
          await supabase.from('product_variants').insert({
            product_id:       id,
            size:             v.size,
            color:            v.color,
            stock_qty:        Number(v.stock_qty) || 0,
            price_adjustment: Number(v.price_adjustment) || 0
          })
        }
      } else {
        await supabase.from('product_variants').update({
          size:             v.size,
          color:            v.color,
          stock_qty:        Number(v.stock_qty) || 0,
          price_adjustment: Number(v.price_adjustment) || 0
        }).eq('id', v.id)
      }
    }

    navigate('/admin/products')
  }

  if (fetching) return <AdminLayout><p>Loading...</p></AdminLayout>

  return (
    <AdminLayout>
      <div style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => navigate('/admin/products')} style={{
            background: 'none', border: '1px solid #ddd', padding: '8px 14px',
            borderRadius: 8, cursor: 'pointer', fontSize: 13
          }}>← Back</button>
          <h1 style={{ fontSize: 24, margin: 0 }}>Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

          <label style={labelStyle}>Product Name</label>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required />

          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' }}
            value={form.description} onChange={e => set('description', e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Base Price (Rs)</label>
              <input type="number" style={inputStyle} value={form.base_price}
                onChange={e => set('base_price', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category_id} onChange={e => set('category_id', e.target.value)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <input type="checkbox" id="active" checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)} />
            <label htmlFor="active" style={{ fontSize: 14, color: '#444', cursor: 'pointer' }}>Product is active (visible in shop)</label>
          </div>

          {/* Current image */}
          {form.image_url && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Current Image</label>
              <img src={form.image_url} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
            </div>
          )}

          <label style={labelStyle}>Replace Image (optional)</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ marginBottom: 24 }} />

          {/* Variants */}
          <h3 style={{ fontSize: 16, marginBottom: 16, borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>Variants</h3>
          {variants.map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'center' }}>
              <input placeholder="Size" style={inputStyle} value={v.size || ''} onChange={e => setVariant(i, 'size', e.target.value)} />
              <input placeholder="Color" style={inputStyle} value={v.color || ''} onChange={e => setVariant(i, 'color', e.target.value)} />
              <input placeholder="Stock" type="number" style={inputStyle} value={v.stock_qty || ''} onChange={e => setVariant(i, 'stock_qty', e.target.value)} />
              <input placeholder="Price +/-" type="number" style={inputStyle} value={v.price_adjustment || ''} onChange={e => setVariant(i, 'price_adjustment', e.target.value)} />
              <button type="button" onClick={() => deleteVariant(v)} style={{
                padding: '8px 10px', background: '#fee2e2', border: 'none',
                borderRadius: 6, cursor: 'pointer', color: '#dc2626', fontSize: 13
              }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={addVariant} style={{
            marginBottom: 24, padding: '8px 16px', border: '1px dashed #ccc',
            borderRadius: 8, cursor: 'pointer', background: '#fff', fontSize: 13
          }}>+ Add Variant</button>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={loading} style={{
              padding: '12px 32px', background: '#4f46e5', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15
            }}>{loading ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => navigate('/admin/products')} style={{
              padding: '12px 32px', background: '#f0f0f0', color: '#333',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#444' }
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }