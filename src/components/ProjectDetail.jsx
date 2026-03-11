import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OptimizedImage from './OptimizedImage'
import { slugify } from '../lib/data'

export default function ProjectDetail({ projects }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const idx = projects.findIndex(p => slugify(p.title) === slug)
  const project = idx >= 0 ? projects[idx] : null
  const prev = idx > 0 ? projects[idx - 1] : null
  const next = idx < projects.length - 1 ? projects[idx + 1] : null

  useEffect(() => {
    if (project) document.title = `${project.title} | Anantica Singh`
    window.scrollTo({ top: 0 })
  }, [slug])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' && next) navigate(`/work/${slugify(next.title)}`)
      else if (e.key === 'ArrowLeft' && prev) navigate(`/work/${slugify(prev.title)}`)
      else if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [slug, prev, next])

  if (!project) {
    return (
      <div className="fade-in text-center py-20">
        <h1 className="font-brand text-4xl font-bold mb-4">Not Found</h1>
        <button onClick={() => navigate('/')} className="text-sm uppercase tracking-widest border-b-2 border-black pb-1">
          Back to Work
        </button>
      </div>
    )
  }

  return (
    <div className="fade-in max-w-5xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
          ← Back to Work
        </button>
      </div>

      <div className="flex items-center justify-center mb-8" style={{ minHeight: '60vh' }}>
        <OptimizedImage
          src={project.imageUrl}
          alt={project.title}
          priority
          className="max-w-full max-h-[75vh] w-auto h-auto rounded-sm"
          sizes="(max-width: 1024px) 100vw, 80vw"
        />
      </div>

      <div className="max-w-2xl mx-auto space-y-4 text-center">
        <p className="text-gray-400 uppercase tracking-[0.2em] text-xs font-semibold">{project.category}</p>
        <h1 className="font-brand text-3xl md:text-4xl font-extrabold tracking-tighter">{project.title}</h1>
        {project.description && (
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg mx-auto">{project.description}</p>
        )}
        {project.artistStatement && (
          <div className="py-3 border-t border-gray-100">
            <p className="text-gray-600 leading-relaxed italic text-sm max-w-lg mx-auto">"{project.artistStatement}"</p>
          </div>
        )}
        <div className="flex justify-center gap-12 py-3 border-t border-gray-100 text-sm">
          <div className="text-center">
            <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-1">Year</h4>
            <p className="font-medium">{project.year || '2025'}</p>
          </div>
          <div className="text-center">
            <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-1">{project.medium ? 'Medium' : 'Type'}</h4>
            <p className="font-medium">{project.medium || project.category}</p>
          </div>
          {project.dimensions && (
            <div className="text-center">
              <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-1">Dimensions</h4>
              <p className="font-medium">{project.dimensions}</p>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          {prev ? (
            <button onClick={() => navigate(`/work/${slugify(prev.title)}`)} className="text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              ← {prev.title}
            </button>
          ) : <span />}
          {next ? (
            <button onClick={() => navigate(`/work/${slugify(next.title)}`)} className="text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              {next.title} →
            </button>
          ) : <span />}
        </div>
      </div>
    </div>
  )
}
