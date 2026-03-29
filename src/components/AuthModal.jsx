import { useState } from 'react'
import { supabase } from '../supabase'
import { useCart } from '../context/CartContext'

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, setUser } = useCart()
  const [mode, setMode]         = useState('login')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (!showAuthModal) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email, password: form.password
      })
      if (error) { setError(error.message); setLoading(false); return }
      setUser(data.user)
      setShowAuthModal(false)

    } else {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name } }
      })
      if (error) { setError(error.message); setLoading(false); return }

      // Insert profile
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: form.full_name,
          role: 'customer'
        })
        setUser(data.user)
        setShowAuthModal(false)
      } else {
        setSuccess('Account created! Please check your email to confirm.')
      }
    }
    setLoading(false)
  }

  const iStyle = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f0ece4', fontSize: 14,
    fontFamily: '"DM Sans", sans-serif',
    boxSizing: 'border-box', marginBottom: 16,
    borderRadius: 0, outline: 'none', transition: 'border-color 0.3s'
  }

  return (
    <div
      onClick={() => setShowAuthModal(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.08)',
          width: '100%', maxWidth: 420, padding: 40,
          animation: 'fadeUp 0.3s ease both'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 8 }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </p>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, color: '#f0ece4', margin: 0 }}>
              {mode === 'login' ? 'Sign In' : 'Sign Up'}
            </h2>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer', padding: 4, lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Error / success */}
        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fca5a5' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#c9a96e' }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <label style={{ fontSize: 10, letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Full Name</label>
              <input
                style={iStyle} placeholder="Your full name"
                value={form.full_name} onChange={e => set('full_name', e.target.value)} required
                onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </>
          )}

          <label style={{ fontSize: 10, letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email Address</label>
          <input
            type="email" style={iStyle} placeholder="you@example.com"
            value={form.email} onChange={e => set('email', e.target.value)} required
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />

          <label style={{ fontSize: 10, letterSpacing: '0.2em', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password</label>
          <input
            type="password" style={iStyle}
            placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
            value={form.password} onChange={e => set('password', e.target.value)} required
            onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />

          <button
            type="submit"
            className="gold-btn"
            disabled={loading}
            style={{
              width: '100%', padding: '15px 0', border: 'none',
              fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase',
              fontFamily: '"DM Sans", sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500, color: '#0a0a0a', opacity: loading ? 0.7 : 1,
              marginTop: 8
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Switch mode */}
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          {mode === 'login' ? (
            <p style={{ fontSize: 13, color: '#555' }}>
              Don't have an account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#c9a96e', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                Sign up
              </button>
            </p>
          ) : (
            <p style={{ fontSize: 13, color: '#555' }}>
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#c9a96e', cursor: 'pointer', fontSize: 13, padding: 0 }}>
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}