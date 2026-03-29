import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'

export default function AddProduct() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(false)
  const [imageFile, setImageFile]   = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', base_price: '', category_id: '', is_active: true
  })
  const [variants, setVariants] = useState([{ size: '', color: '', stock_qty: '', price_adjustment: '' }])
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setVariant = (i, k, v) => {
    setVariants(vs => vs.map((va, idx) => idx === i ? { ...va, [k]: v } : va))
  }

  const addVariant = () => setVariants(vs => [...vs, { size: '', color: '', stock_qty: '', price_adjustment: '' }])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    let image_url = null
    if (imageFile) {
      const ext  = imageFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      await supabase.storage.from('product-images').upload(path, imageFile)
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const { data: product, error } = await supabase.from('products').insert({
      ...form, base_price: Number(form.base_price), image_url
    }).select().single()

    if (error) { alert('Error: ' + error.message); setLoading(false); return }

    const variantRows = variants
      .filter(v => v.size || v.color)
      .map(v => ({ ...v, product_id: product.id, stock_qty: Number(v.stock_qty), price_adjustment: Number(v.price_adjustment) }))

    if (variantRows.length > 0) {
      await supabase.from('product_variants').insert(variantRows)
    }

    navigate('/admin/products')
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: 24, marginBottom: 24 }}>Add Product</h1>
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

          <label style={labelStyle}>Product Image</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ marginBottom: 24 }} />

          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Variants (Size / Color)</h3>
          {variants.map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input placeholder="Size (e.g. M)" style={inputStyle} value={v.size} onChange={e => setVariant(i, 'size', e.target.value)} />
              <input placeholder="Color" style={inputStyle} value={v.color} onChange={e => setVariant(i, 'color', e.target.value)} />
              <input placeholder="Stock" type="number" style={inputStyle} value={v.stock_qty} onChange={e => setVariant(i, 'stock_qty', e.target.value)} />
              <input placeholder="Variant Price (Rs)" type="number" style={inputStyle} value={v.price_adjustment} onChange={e => setVariant(i, 'price_adjustment', e.target.value)} />
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
            }}>{loading ? 'Saving...' : 'Save Product'}</button>
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