import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      navigate('/admin/dashboard')
    } else {
      await supabase.auth.signOut()
      setError('You are not an admin.')
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: 'Admin' } }
    })
    if (error) setError(error.message)
    else setError('Signup successful! Now click Login.')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f6fa', fontFamily: 'sans-serif'
    }}>
      <form onSubmit={handleLogin} style={{
        background: '#fff', padding: 40, borderRadius: 12,
        width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ marginBottom: 24, fontSize: 22 }}>Admin Login</h2>
        {error && <p style={{ color: '#e74c3c', marginBottom: 16 }}>{error}</p>}
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} required
          style={inputStyle}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)} required
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={btnStyle}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button type="button" onClick={handleSignup} style={{
          ...btnStyle, background: '#27ae60', marginTop: 10
        }}>
          Sign Up (one time only)
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 14px', marginBottom: 16,
  border: '1px solid #ddd', borderRadius: 8, fontSize: 15,
  boxSizing: 'border-box'
}
const btnStyle = {
  width: '100%', padding: '12px 0', background: '#1a1a2e',
  color: '#fff', border: 'none', borderRadius: 8,
  fontSize: 16, cursor: 'pointer'
}