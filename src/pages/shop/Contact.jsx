import { useState } from 'react'
import ShopLayout from '../../components/ShopLayout'
import { supabase } from '../../supabase'

const WHATSAPP_NUMBER = '923116146976' // replace with your number

export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Store message in Supabase
    const { error } = await supabase.from('contact_messages').insert({
      name:    form.name,
      email:   form.email,
      subject: form.subject,
      message: form.message
    })

    if (error) {
      setError('Something went wrong. Please try WhatsApp instead.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  const openWhatsApp = () => {
    const text = encodeURIComponent(`Hi MyShop! I have a question about your products.`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
  }

  const contactInfo = [
    { icon: '◈', label: 'WhatsApp',  value: '+92 311 614 6976',   action: openWhatsApp, clickable: true },
    { icon: '◎', label: 'Email',     value: 'taha@myshop.pk',    action: null, clickable: false },
    { icon: '◇', label: 'Location',  value: 'Lahore, Pakistan',   action: null, clickable: false },
    { icon: '▣', label: 'Hours',     value: 'Mon–Sat, 9am–6pm',  action: null, clickable: false },
  ]

  const iStyle = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f0ece4', fontSize: 14,
    fontFamily: '"DM Sans", sans-serif',
    boxSizing: 'border-box', marginBottom: 20,
    transition: 'border-color 0.3s', borderRadius: 0, outline: 'none'
  }
  const lStyle = {
    fontSize: 10, letterSpacing: '0.25em', color: '#777',
    textTransform: 'uppercase', display: 'block', marginBottom: 8
  }

  return (
    <ShopLayout>
      <div style={{ animation: 'fadeUp 0.6s ease both' }}>

        {/* Hero */}
        <div style={{ padding: '80px 48px 60px', textAlign: 'center', background: 'radial-gradient(ellipse at 50% 60%, #1a1408 0%, #0a0a0a 70%)' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.5em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 16 }}>Get in Touch</p>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(36px, 6vw, 60px)', color: '#f0ece4', lineHeight: 1.1, marginBottom: 20 }}>
            We'd Love to<br />
            <span style={{ color: '#c9a96e', fontStyle: 'italic' }}>Hear From You</span>
          </h1>
          <p style={{ color: '#555', fontSize: 15, maxWidth: 420, margin: '0 auto' }}>
            Have a question, feedback, or just want to say hello? We reply to every message personally.
          </p>
        </div>

        <div style={{ padding: '60px 48px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, maxWidth: 1100, margin: '0 auto', alignItems: 'start' }}>

          {/* Left — contact info */}
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 16 }}>Contact Info</p>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 30, color: '#f0ece4', marginBottom: 32, lineHeight: 1.2 }}>Let's Start a Conversation</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {contactInfo.map((info, i) => (
                <div
                  key={info.label}
                  onClick={info.clickable ? info.action : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 20,
                    padding: '20px 0',
                    borderBottom: i < contactInfo.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    cursor: info.clickable ? 'pointer' : 'default',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => info.clickable && (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={e => info.clickable && (e.currentTarget.style.opacity = '1')}
                >
                  <div style={{
                    width: 44, height: 44, border: '1px solid rgba(201,169,110,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, color: '#c9a96e', flexShrink: 0
                  }}>{info.icon}</div>
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: '0.2em', color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{info.label}</p>
                    <p style={{ fontSize: 15, color: info.clickable ? '#c9a96e' : '#a09888' }}>{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp button */}
            <button onClick={openWhatsApp} className="gold-btn" style={{
              width: '100%', padding: '16px 0', border: 'none', marginTop: 32,
              fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
              fontFamily: '"DM Sans", sans-serif', cursor: 'pointer', color: '#0a0a0a'
            }}>Chat on WhatsApp</button>

            <p style={{ fontSize: 12, color: '#444', textAlign: 'center', marginTop: 12 }}>
              Usually replies within 1 hour
            </p>
          </div>

          {/* Right — contact form */}
          <div style={{ border: '1px solid rgba(255,255,255,0.06)', padding: 40, background: 'rgba(255,255,255,0.02)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 64, height: 64, border: '1px solid #c9a96e', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', fontSize: 24, color: '#c9a96e'
                }}>✓</div>
                <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 12 }}>Message Sent</p>
                <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, color: '#f0ece4', marginBottom: 12 }}>Thank You!</h3>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.8 }}>
                  We've received your message and will get back to you within 24 hours.
                </p>
                <button className="ghost-btn" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }} style={{
                  marginTop: 28, padding: '12px 28px', fontSize: 12, letterSpacing: '0.15em',
                  textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer'
                }}>Send Another</button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 11, letterSpacing: '0.3em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 28 }}>Send a Message</p>

                {error && (
                  <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#fca5a5' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={lStyle}>Your Name</label>
                      <input style={iStyle} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Full name"
                        onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </div>
                    <div>
                      <label style={lStyle}>Email Address</label>
                      <input type="email" style={iStyle} value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@example.com"
                        onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                    </div>
                  </div>

                  <label style={lStyle}>Subject</label>
                  <input style={iStyle} value={form.subject} onChange={e => set('subject', e.target.value)} required placeholder="What is this about?"
                    onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />

                  <label style={lStyle}>Message</label>
                  <textarea style={{ ...iStyle, height: 140, resize: 'none' }}
                    value={form.message} onChange={e => set('message', e.target.value)} required
                    placeholder="Tell us how we can help..."
                    onFocus={e => e.target.style.borderColor = 'rgba(201,169,110,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />

                  <button type="submit" className="gold-btn" disabled={loading} style={{
                    width: '100%', padding: '16px 0', border: 'none',
                    fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase',
                    fontFamily: '"DM Sans", sans-serif', cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 500, color: '#0a0a0a', opacity: loading ? 0.7 : 1
                  }}>{loading ? 'Sending...' : 'Send Message'}</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}