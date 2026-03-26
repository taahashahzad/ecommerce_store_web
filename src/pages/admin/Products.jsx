import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const toggleActive = async (id, current) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    fetchProducts()
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>Products</h1>
        <button onClick={() => navigate('/admin/products/add')} style={{
          background: '#4f46e5', color: '#fff', border: 'none',
          padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14
        }}>+ Add Product</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f8f8', textAlign: 'left' }}>
                {['Image', 'Name', 'Category', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: 13, color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>No products yet</td></tr>
              ) : products.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px' }}>
                    {p.image_url
                      ? <img src={p.image_url} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                      : <div style={{ width: 48, height: 48, background: '#eee', borderRadius: 8 }} />}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', color: '#666' }}>{p.categories?.name || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>Rs {Number(p.base_price).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 12,
                      background: p.is_active ? '#dcfce7' : '#fee2e2',
                      color: p.is_active ? '#16a34a' : '#dc2626'
                    }}>{p.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => toggleActive(p.id, p.is_active)} style={{
                      marginRight: 8, padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd',
                      cursor: 'pointer', fontSize: 12, background: '#fff'
                    }}>{p.is_active ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => deleteProduct(p.id)} style={{
                      padding: '6px 12px', borderRadius: 6, border: 'none',
                      cursor: 'pointer', fontSize: 12, background: '#fee2e2', color: '#dc2626'
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}