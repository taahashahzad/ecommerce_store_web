import { useNavigate } from 'react-router-dom'
import ShopLayout from '../../components/ShopLayout'

export default function About() {
  const navigate = useNavigate()

  const values = [
    { icon: '◈', title: 'Quality First',      desc: 'Every product in our catalogue is hand-picked and tested for quality before it reaches you.' },
    { icon: '◎', title: 'Customer Focused',   desc: 'Your satisfaction is our priority. We are always here to help before, during, and after your purchase.' },
    { icon: '◇', title: 'Honest Pricing',     desc: 'No hidden fees, no surprises. What you see is what you pay — with free delivery on every order.' },
    { icon: '▣', title: 'Fast Delivery',      desc: 'We process and dispatch orders quickly so your products arrive fresh and on time.' },
  ]

  const team = [
    { name: 'Taaha Shahzad',    role: 'Founder & CEO',        initial: 'T' },
    { name: 'Talha Chaudhry',      role: 'Head of Products',     initial: 'T' },
    { name: 'Awais Lakhoka',   role: 'Customer Experience',  initial: 'A' },
  ]

  const stats = [
    { value: '500+',  label: 'Happy Customers' },
    { value: '100+',  label: 'Products' },
    { value: '3–5',   label: 'Day Delivery' },
    { value: '24/7',  label: 'Support' },
  ]

  return (
    <ShopLayout>
      <div style={{ animation: 'fadeUp 0.6s ease both' }}>

        {/* Hero */}
        <div style={{
          minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '80px 48px',
          background: 'radial-gradient(ellipse at 50% 60%, #1a1408 0%, #0a0a0a 70%)',
          position: 'relative', overflow: 'hidden'
        }} className="about-hero">
          <div style={{ position: 'absolute', top: '15%', left: '10%', width: '30%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.15), transparent)', transform: 'rotate(-10deg)' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: '25%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.12), transparent)', transform: 'rotate(-10deg)' }} />

          <div style={{ maxWidth: 680, position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.5em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 24 }}>Our Story</p>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(40px, 7vw, 72px)', color: '#f0ece4', lineHeight: 1.1, marginBottom: 28 }}>
              Built with Passion,<br />
              <span style={{ color: '#c9a96e', fontStyle: 'italic' }}>Delivered with Care</span>
            </h1>
            <p style={{ color: '#666', fontSize: 17, lineHeight: 1.9, maxWidth: 520, margin: '0 auto' }}>
              We started MyShop with a simple belief — everyone deserves access to quality products without compromise. From our home in Pakistan to yours, we bring you the best.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 48px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 800, margin: '0 auto', textAlign: 'center' }} className="about-stats-grid">
            {stats.map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 36, color: '#c9a96e', marginBottom: 8 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div style={{ padding: '80px 48px', maxWidth: 860, margin: '0 auto' }} className="about-story">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="about-story-grid">
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 16 }}>How We Started</p>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 36, color: '#f0ece4', lineHeight: 1.2, marginBottom: 24 }}>A Small Idea That Grew</h2>
              <p style={{ color: '#777', lineHeight: 1.9, fontSize: 15, marginBottom: 20 }}>
                MyShop began in 2024 as a small passion project — a desire to make quality products accessible to everyone in Pakistan without the hassle of visiting crowded markets.
              </p>
              <p style={{ color: '#666', lineHeight: 1.9, fontSize: 15, marginBottom: 32 }}>
                What started as a handful of products has grown into a curated collection that our customers trust and love. Every item we carry has been personally selected by our team.
              </p>
              <button className="gold-btn" onClick={() => navigate('/')} style={{
                padding: '14px 32px', border: 'none', fontSize: 12,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                fontFamily: '"DM Sans", sans-serif', cursor: 'pointer', color: '#0a0a0a'
              }}>Shop the Collection</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['#1a1408', '#0f0f0f', '#141410', '#1a1a0e'].map((bg, i) => (
                <div key={i} style={{
                  height: i % 2 === 0 ? 160 : 120, background: bg,
                  border: '1px solid rgba(201,169,110,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: 24, color: 'rgba(201,169,110,0.2)' }}>
                    {['◈', '◎', '◇', '▣'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '80px 48px' }} className="about-values">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 16 }}>What We Stand For</p>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 40, color: '#f0ece4' }}>Our Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }} className="about-values-grid">
            {values.map((v, i) => (
              <div key={v.title} style={{
                border: '1px solid rgba(255,255,255,0.06)', padding: 32,
                animation: `fadeUp 0.5s ease both`, animationDelay: `${i * 0.1}s`
              }}>
                <div style={{ fontSize: 28, color: '#c9a96e', marginBottom: 20 }}>{v.icon}</div>
                <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 19, color: '#f0ece4', marginBottom: 12 }}>{v.title}</p>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ padding: '80px 48px' }} className="about-team">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c9a96e', textTransform: 'uppercase', marginBottom: 16 }}>The People Behind It</p>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 40, color: '#f0ece4' }}>Our Team</h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {team.map((member, i) => (
              <div key={member.name} style={{
                textAlign: 'center', width: 200,
                animation: `fadeUp 0.5s ease both`, animationDelay: `${i * 0.1}s`
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Playfair Display", serif', fontSize: 28, color: '#c9a96e'
                }}>{member.initial}</div>
                <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 18, color: '#f0ece4', marginBottom: 6 }}>{member.name}</p>
                <p style={{ fontSize: 12, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '60px 48px', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="about-cta">
          <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 32, color: '#f0ece4', marginBottom: 16 }}>Have a question?</p>
          <p style={{ color: '#555', marginBottom: 32, fontSize: 15 }}>We'd love to hear from you.</p>
          <button className="ghost-btn" onClick={() => navigate('/contact')} style={{
            padding: '14px 40px', fontSize: 12, letterSpacing: '0.2em',
            textTransform: 'uppercase', fontFamily: '"DM Sans", sans-serif', cursor: 'pointer'
          }}>Contact Us</button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-hero { padding: 60px 16px !important; }
          .about-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
          .about-story { padding: 40px 16px !important; }
          .about-story-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .about-values { padding: 40px 16px !important; }
          .about-values-grid { grid-template-columns: 1fr !important; }
          .about-team { padding: 40px 16px !important; }
          .about-cta { padding: 40px 16px !important; }
        }
      `}</style>
    </ShopLayout>
  )
}