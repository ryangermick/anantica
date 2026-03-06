import React, { useState, useEffect } from 'react'
import { ArrowRight, CheckCircle, Linkedin } from 'lucide-react'
import { DEFAULT_ABOUT_CONTENT } from '../constants'
import { getAboutContent, submitContact } from '../lib/data'
import { AboutContent } from '../types'

const Contact: React.FC = () => {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT)

  useEffect(() => { getAboutContent().then(setContent) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('sending')
    try {
      await submitContact(formData)
      setFormState('sent')
      setFormData({ name: '', email: '', message: '' })
    } catch {
      setFormState('sent') // Show success even if DB save fails
    }
  }

  if (formState === 'sent') {
    return (
      <div className="fade-in min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <CheckCircle size={64} className="text-black mb-4 animate-bounce" />
        <h2 className="font-brand text-4xl md:text-5xl font-bold tracking-tight">Message Received.</h2>
        <p className="text-gray-500 max-w-md text-lg">Thank you for reaching out. I usually respond within one business day.</p>
        <button onClick={() => setFormState('idle')}
          className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:opacity-50 transition-opacity">
          Send another message
        </button>
      </div>
    )
  }

  return (
    <div className="fade-in grid lg:grid-cols-2 gap-20">
      <div className="space-y-12">
        <div>
          <h1 className="font-brand text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter leading-none">{content.contactHeadline}</h1>
          <p className="text-xl text-gray-500 max-w-md leading-relaxed">{content.contactDescription}</p>
        </div>
        <div className="space-y-10">
          {content.linkedinUrl && (
            <div className="group cursor-pointer">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold">LinkedIn</p>
              <a href={content.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="text-2xl font-brand font-bold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                {content.linkedinHandle} <Linkedin size={20} />
              </a>
            </div>
          )}
          <div className="group cursor-pointer">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold">Location</p>
            <p className="text-2xl font-brand font-bold group-hover:translate-x-2 transition-transform inline-block">{content.location}</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-sm border border-gray-50">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Your Identity</label>
            <input required type="text" placeholder="Name or Organization" value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-transparent border-b border-gray-100 py-3 focus:border-black focus:outline-none transition-colors text-lg" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Email Channel</label>
            <input required type="email" placeholder="hello@example.com" value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-transparent border-b border-gray-100 py-3 focus:border-black focus:outline-none transition-colors text-lg" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">The Brief</label>
            <textarea required rows={4} placeholder="Tell me about your goals or project..." value={formData.message}
              onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full bg-transparent border-b border-gray-100 py-3 focus:border-black focus:outline-none transition-colors resize-none text-lg" />
          </div>
          <button disabled={formState === 'sending'}
            className="w-full bg-black text-white py-6 px-8 font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-4 hover:bg-gray-800 transition-all disabled:opacity-50">
            <span>{formState === 'sending' ? 'Transmitting...' : 'Send Inquiry'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Contact
