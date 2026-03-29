import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { supabase } from '../../supabase'

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { fetchMessages() }, [])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  const markRead = async (id) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id)
    fetchMessages()
  }

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return
    await supabase.from('contact_messages').delete().eq('id', id)
    fetchMessages()
  }

  const unread = messages.filter(m => !m.is_read).length

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Messages</h1>
          <p style={{ color: '#888', fontSize: 13 }}>{unread} unread · {messages.length} total</p>
        </div>
      </div>

      {loading ? <p>Loading...</p> : messages.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 18, color: '#aaa' }}>No messages yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              background: '#fff', borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${msg.is_read ? '#e0e0e0' : '#4f46e5'}`,
              overflow: 'hidden'
            }}>
              <div
                onClick={() => { setExpanded(expanded === msg.id ? null : msg.id); if (!msg.is_read) markRead(msg.id) }}
                style={{ padding: '16px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                  {!msg.is_read && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', flexShrink: 0 }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <p style={{ fontWeight: msg.is_read ? 400 : 600, fontSize: 15, color: '#333' }}>{msg.name}</p>
                      <span style={{ fontSize: 13, color: '#aaa' }}>{msg.email}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {msg.subject || 'No subject'} — {msg.message}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: '#aaa' }}>
                    {new Date(msg.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ color: '#ccc', fontSize: 16, transition: 'transform 0.3s', transform: expanded === msg.id ? 'rotate(180deg)' : 'rotate(0)' }}>⌄</span>
                </div>
              </div>

              {expanded === msg.id && (
                <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f5f5f5' }}>
                  <div style={{ padding: '20px 0', marginBottom: 16 }}>
                    <p style={{ fontSize: 12, color: '#aaa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Subject</p>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#333', marginBottom: 20 }}>{msg.subject || '—'}</p>
                    <p style={{ fontSize: 12, color: '#aaa', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Message</p>
                    <p style={{ fontSize: 15, color: '#444', lineHeight: 1.8 }}>{msg.message}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} style={{
                      padding: '8px 18px', background: '#4f46e5', color: '#fff',
                      borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 500
                    }}>Reply via Email</a>
                    <button onClick={() => deleteMessage(msg.id)} style={{
                      padding: '8px 18px', background: '#fee2e2', color: '#dc2626',
                      border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13
                    }}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}