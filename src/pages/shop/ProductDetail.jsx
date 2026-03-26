import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import ShopLayout from '../../components/ShopLayout'
import { supabase } from '../../supabase'
import { useCart } from '../../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct]   = useState(null)
  const [variants, setVariants] = useState([])
  const [reviews, setReviews]   = useState([])
  const [selected, setSelected] = useState(null)
  const [qty, setQty]           = useState(1)
  const { addToCart }           = useCart()

  useEffect(() => {
    supabase.from('products').select('*, categories(name)').eq('id', id).single()
      .then(({ data }) => setProduct(data))
    supabase.from('product_variants').select('*').eq('product_id', id)
      .then(({ data }) => { setVariants(data || []); if (data?.length) setSelected(data[0]) })
    supabase.from('reviews').select('*, profiles(full_name)').eq('product_id', id)
      .then(({ data }) => setReviews(data || []))
  }, [id])

  const handleAddToCart = () => {
    if (!selected) { toast.error('Please select a variant'); return }
    addToCart(selected, product, qty)
    toast.success('Added to cart!')
  }

  if (!product) return <ShopLayout><p>Loading...</p></ShopLayout>

  const price = selected
    ? Number(product.base_price) 
    : Number(product.base_price)

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <ShopLayout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        <div style={{ background: '#f0f0f0', borderRadius: 16, overflow: 'hidden', height: 420 }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No image</div>
          }
        </div>

        <div>
          <p style={{ color: '#888', marginBottom: 8 }}>{product.categories?.name}</p>
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>{product.name}</h1>
          {avgRating && <p style={{ color: '#f59e0b', marginBottom: 16 }}>{'★'.repeat(Math.round(avgRating))} {avgRating}/5 ({reviews.length} reviews)</p>}
          <p style={{ color: '#4f46e5', fontSize: 26, fontWeight: 700, marginBottom: 16 }}>Rs {price.toLocaleString()}</p>
          <p style={{ color: '#555', lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>

          {variants.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>Select Variant</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {variants.map(v => (
                  <button key={v.id} onClick={() => setSelected(v)} style={{
                    padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                    border: selected?.id === v.id ? '2px solid #4f46e5' : '1px solid #ddd',
                    background: selected?.id === v.id ? '#eef2ff' : '#fff',
                    fontSize: 13, color: v.stock_qty === 0 ? '#ccc' : '#333'
                  }} disabled={v.stock_qty === 0}>
                    {v.size && `Size: ${v.size}`}{v.size && v.color && ' / '}{v.color && `Color: ${v.color}`}
                    {v.stock_qty === 0 && ' (Out of stock)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <p style={{ fontWeight: 600 }}>Qty:</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={qtyBtn}>−</button>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={qtyBtn}>+</button>
            </div>
          </div>

          <button onClick={handleAddToCart} style={{
            width: '100%', padding: '14px 0', background: '#1a1a2e',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 16, cursor: 'pointer', fontWeight: 600
          }}>Add to Cart</button>
        </div>
      </div>

      {reviews.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>Customer Reviews</h2>
          {reviews.map(r => (
            <div key={r.id} style={{
              background: '#fff', borderRadius: 10, padding: 20,
              marginBottom: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{r.profiles?.full_name || 'Customer'}</span>
                <span style={{ color: '#f59e0b' }}>{'★'.repeat(r.rating)}</span>
              </div>
              <p style={{ color: '#555' }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </ShopLayout>
  )
}

const qtyBtn = {
  width: 32, height: 32, borderRadius: 8, border: '1px solid #ddd',
  background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex',
  alignItems: 'center', justifyContent: 'center'
}