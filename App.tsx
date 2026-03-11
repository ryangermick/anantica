import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import Header from './components/Header'
import Portfolio from './components/Portfolio'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AdminCMS from './components/AdminCMS'
import LoginModal from './components/LoginModal'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { INITIAL_PROJECTS } from './constants'
import { getProjects } from './lib/data'
import { signOut } from './lib/auth'
import { slugify } from './lib/slugify'
import { DesignProject, Section } from './types'

const SECTION_MAP: Record<string, Section> = {
  '/': 'portfolio',
  '/work': 'portfolio',
  '/about': 'about',
  '/contact': 'contact',
}

const SECTION_TITLES: Record<Section, string> = {
  portfolio: 'Work', about: 'About', contact: 'Contact',
}

/** Resolve section from pathname */
const sectionFromPath = (pathname: string): Section => {
  if (pathname.startsWith('/work/')) return 'portfolio'
  return SECTION_MAP[pathname] || 'portfolio'
}

const AppContent: React.FC = () => {
  const { isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [projects, setProjects] = useState<DesignProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [imagesReady, setImagesReady] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAdminCMS, setShowAdminCMS] = useState(false)

  const activeSection = sectionFromPath(location.pathname)

  useEffect(() => {
    document.title = `Anantica Singh | ${SECTION_TITLES[activeSection]}`
  }, [activeSection])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    loadProjects()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isAdmin && showLoginModal) {
      setShowLoginModal(false)
      setShowAdminCMS(true)
    }
  }, [isAdmin, showLoginModal])

  const loadProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch {
      setProjects(INITIAL_PROJECTS)
    } finally {
      setProjectsLoading(false)
    }
  }

  const setActiveSection = (section: Section) => {
    const paths: Record<Section, string> = { portfolio: '/', about: '/about', contact: '/contact' }
    navigate(paths[section])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAdminClick = () => {
    if (isAdmin) setShowAdminCMS(true)
    else setShowLoginModal(true)
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} isScrolled={isScrolled} />
      <main className="flex-grow pt-32 pb-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Portfolio projects={projects} loading={projectsLoading} onReady={() => setImagesReady(true)} />} />
          <Route path="/work" element={<Portfolio projects={projects} loading={projectsLoading} onReady={() => setImagesReady(true)} />} />
          <Route path="/work/:slug" element={<ProjectDetail projects={projects} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Portfolio projects={projects} loading={projectsLoading} onReady={() => setImagesReady(true)} />} />
        </Routes>
      </main>
      {(imagesReady || !['/', '/work'].includes(location.pathname)) && (
        <div className="transition-opacity duration-700 opacity-100">
          <Footer onAdminClick={handleAdminClick} isAdmin={isAdmin} onLogout={() => signOut()} />
        </div>
      )}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showAdminCMS && isAdmin && (
        <AdminCMS projects={projects} onClose={() => setShowAdminCMS(false)} onProjectsChanged={loadProjects} />
      )}
    </div>
  )
}

/** Project detail page at /work/:slug */
const ProjectDetail: React.FC<{ projects: DesignProject[] }> = ({ projects }) => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  const index = projects.findIndex(p => slugify(p.title) === slug)
  const project = index >= 0 ? projects[index] : null

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

  const prev = index > 0 ? projects[index - 1] : null
  const next = index < projects.length - 1 ? projects[index + 1] : null

  useEffect(() => {
    document.title = `${project.title} | Anantica Singh`
    window.scrollTo({ top: 0 })
  }, [slug])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && next) navigate(`/work/${slugify(next.title)}`)
      else if (e.key === 'ArrowLeft' && prev) navigate(`/work/${slugify(prev.title)}`)
      else if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slug, prev, next])

  return (
    <div className="fade-in max-w-5xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
          ← Back to Work
        </button>
      </div>

      <div className="flex items-center justify-center mb-8" style={{ minHeight: '60vh' }}>
        <img src={project.imageUrl} alt={project.title}
          className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-sm" />
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

        {/* Prev / Next navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          {prev ? (
            <button onClick={() => navigate(`/work/${slugify(prev.title)}`)}
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              ← {prev.title}
            </button>
          ) : <span />}
          {next ? (
            <button onClick={() => navigate(`/work/${slugify(next.title)}`)}
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              {next.title} →
            </button>
          ) : <span />}
        </div>
      </div>
    </div>
  )
}

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
)

export default App
