import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart]   = useState([])
  const [user, setUser]   = useState(null)

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
    else {
      const local = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(local)
    }
  }, [user])

  const fetchCart = async () => {
    const { data } = await supabase
      .from('cart_items')
      .select('*, product_variants(*, products(*))')
      .eq('user_id', user.id)
    setCart(data || [])
  }

  const addToCart = async (variant, product, qty = 1) => {
    if (user) {
      const existing = cart.find(c => c.variant_id === variant.id)
      if (existing) {
        await supabase.from('cart_items')
          .update({ quantity: existing.quantity + qty })
          .eq('id', existing.id)
      } else {
        await supabase.from('cart_items')
          .insert({ user_id: user.id, variant_id: variant.id, quantity: qty })
      }
      fetchCart()
    } else {
      const local = JSON.parse(localStorage.getItem('cart') || '[]')
      const idx   = local.findIndex(c => c.variant_id === variant.id)
      if (idx >= 0) local[idx].quantity += qty
      else local.push({ variant_id: variant.id, quantity: qty, product_variants: { ...variant, products: product } })
      localStorage.setItem('cart', JSON.stringify(local))
      setCart(local)
    }
  }

  const removeFromCart = async (item) => {
    if (user) {
      await supabase.from('cart_items').delete().eq('id', item.id)
      fetchCart()
    } else {
      const local = cart.filter(c => c.variant_id !== item.variant_id)
      localStorage.setItem('cart', JSON.stringify(local))
      setCart(local)
    }
  }

  const clearCart = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id)
    } else {
      localStorage.removeItem('cart')
    }
    setCart([])
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount, user, setUser }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)