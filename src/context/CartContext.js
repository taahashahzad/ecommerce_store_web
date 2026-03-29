import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart]             = useState([])
  const [user, setUser]             = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) fetchCart()
    else setCart([])
  }, [user])

  const fetchCart = async () => {
    const { data } = await supabase
      .from('cart_items')
      .select('*, product_variants(*, products(*))')
      .eq('user_id', user.id)
    setCart(data || [])
  }

  const addToCart = async (variant, product, qty = 1) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    let variantId = variant.id
    if (!variantId) {
      // No variant selected, create or find default variant
      const { data: existing } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', product.id)
        .eq('size', 'Default')
        .maybeSingle()
      if (existing) {
        variantId = existing.id
      } else {
        const { data: newVariant } = await supabase
          .from('product_variants')
          .insert({
            product_id: product.id,
            size: 'Default',
            color: '',
            stock_qty: 999999,
            price_adjustment: product.base_price
          })
          .select('id')
          .single()
        variantId = newVariant.id
      }
    }
    const existing = cart.find(c => c.variant_id === variantId)
    if (existing) {
      await supabase.from('cart_items')
        .update({ quantity: existing.quantity + qty })
        .eq('id', existing.id)
    } else {
      await supabase.from('cart_items')
        .insert({ user_id: user.id, variant_id: variantId, quantity: qty })
    }
    fetchCart()
  }

  const removeFromCart = async (item) => {
    await supabase.from('cart_items').delete().eq('id', item.id)
    fetchCart()
  }

  const clearCart = async () => {
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    setCart([])
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart,
      cartCount, user, setUser, showAuthModal, setShowAuthModal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)