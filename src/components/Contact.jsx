import { useState, useEffect } from 'react'
import { fetchAbout } from '../lib/data'
import { Send, Loader2 } from 'lucide-react'

export default function Contact() {
  const [about, setAbout] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetchAbout().then(setAbout)
    document.title = 'Contact | Anantica Singh'
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSent(true)
      setForm({ name: '', email: '', message: '' })
    } catch {
      alert('Something went wrong. Please try again.')
    }
    setSending(false)
  }

  return (
    <div className="fade-in max-w-xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="font-brand text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
          {about?.contactHeadline || "Let's connect."}
        </h1>
        <p className="text-gray-500">{about?.contactDescription || 'I\'d love to hear from you.'}</p>
      </div>

      {sent ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium mb-2">Thank you!</p>
          <p className="text-gray-500">I'll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input type="text" placeholder="Name" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors" />
          </div>
          <div>
            <input type="email" placeholder="Email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors" />
          </div>
          <div>
            <textarea placeholder="Message" required rows={4} value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full border-b border-gray-200 py-3 text-sm focus:border-black outline-none transition-colors resize-none" />
          </div>
          <button type="submit" disabled={sending}
            className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  )
}
