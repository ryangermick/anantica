import { useState, useEffect } from 'react'
import { fetchAbout } from '../lib/data'
import { Linkedin } from 'lucide-react'

export default function About() {
  const [about, setAbout] = useState(null)

  useEffect(() => {
    fetchAbout().then(setAbout)
    document.title = 'About | Anantica Singh'
  }, [])

  if (!about) return <div className="fade-in py-20"><div className="h-8 w-48 bg-gray-100 rounded shimmer" /></div>

  const renderCompany = (company, role) => {
    if (company.includes('Scratch Foundation')) {
      const parts = company.split('Scratch Foundation')
      return <>{parts[0]}<a href="https://www.scratchfoundation.org" target="_blank" rel="noreferrer" className="underline hover:opacity-50">{`Scratch Foundation`}</a>{parts[1]}</>
    }
    return company
  }

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <div className="grid md:grid-cols-[300px_1fr] gap-12 mb-16">
        <div>
          <img
            src={about.profileImageUrl}
            alt={about.name}
            className="w-full rounded-sm"
            loading="lazy"
          />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="font-brand text-4xl md:text-5xl font-extrabold tracking-tighter mb-2">{about.name}</h1>
            <p className="text-gray-400 text-sm uppercase tracking-widest">{about.tagline}</p>
          </div>
          <p className="text-lg leading-relaxed text-gray-700">{about.bioHeadline}</p>
          {about.bioParagraphs.map((p, i) => (
            <p key={i} className="text-gray-600 leading-relaxed">{p}</p>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="font-brand text-2xl font-bold tracking-tight mb-6">Experience</h2>
          <div className="space-y-4">
            {about.workHistory.map((w, i) => (
              <div key={i} className="border-l-2 border-gray-200 pl-4">
                <p className="font-medium text-sm">{renderCompany(w.company, w.role)}</p>
                <p className="text-gray-500 text-xs">{w.role}</p>
                <p className="text-gray-400 text-xs">{w.years}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-brand text-2xl font-bold tracking-tight mb-6">Education</h2>
          <div className="space-y-4">
            {about.education?.map((e, i) => (
              <div key={i} className="border-l-2 border-gray-200 pl-4">
                <p className="font-medium text-sm">{e.school}</p>
                <p className="text-gray-500 text-xs">{e.degree}</p>
              </div>
            ))}
          </div>
          {about.philosophy && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 italic leading-relaxed">"{about.philosophy}"</p>
            </div>
          )}
        </div>
      </div>

      {about.linkedinUrl && (
        <div className="text-center py-8">
          <a href={about.linkedinUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold hover:opacity-50 transition-opacity">
            <Linkedin size={16} /> LinkedIn
          </a>
        </div>
      )}
    </div>
  )
}
