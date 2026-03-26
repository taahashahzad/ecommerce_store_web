import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../supabase'

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
  supabase.auth.getSession().then(async ({ data }) => {
    const user = data.session?.user
    if (!user) { setLoading(false); return }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    setIsAdmin(profile?.role === 'admin')
    setLoading(false)
  })
}, [])

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  return isAdmin ? <Outlet /> : <Navigate to="/login" />
}