import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/AuthContext'
import { fetchProjects, signOut } from './lib/data'
import Header from './components/Header'
import Footer from './components/Footer'
import Portfolio from './components/Portfolio'
import ProjectDetail from './components/ProjectDetail'
import About from './components/About'
import Contact from './components/Contact'
import LoginModal from './components/LoginModal'
import AdminCMS from './components/AdminCMS'

const SECTION_MAP = { '/': 'portfolio', '/work': 'portfolio', '/about': 'about', '/contact': 'contact' }
const SECTION_TITLES = { portfolio: 'Work', about: 'About', contact: 'Contact' }

function getSection(pathname) {
  if (pathname.startsWith('/work/')) return 'portfolio'
  return SECTION_MAP[pathname] || 'portfolio'
}

function AppInner() {
  const { isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [footerVisible, setFooterVisible] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showCMS, setShowCMS] = useState(false)

  const activeSection = getSection(location.pathname)

  useEffect(() => {
    document.title = `Anantica Singh | ${SECTION_TITLES[activeSection]}`
  }, [activeSection])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    loadProjects()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isAdmin && showLogin) { setShowLogin(false); setShowCMS(true) }
  }, [isAdmin, showLogin])

  const loadProjects = async () => {
    try {
      const p = await fetchProjects()
      setProjects(p)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }

  const setActiveSection = (section) => {
    navigate({ portfolio: '/', about: '/about', contact: '/contact' }[section])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAdminClick = () => {
    if (isAdmin) setShowCMS(true)
    else setShowLogin(true)
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} isScrolled={isScrolled} />
      <main className="flex-grow pt-32 pb-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Portfolio projects={projects} loading={loading} onReady={() => setFooterVisible(true)} />} />
          <Route path="/work" element={<Portfolio projects={projects} loading={loading} onReady={() => setFooterVisible(true)} />} />
          <Route path="/work/:slug" element={<ProjectDetail projects={projects} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Portfolio projects={projects} loading={loading} onReady={() => setFooterVisible(true)} />} />
        </Routes>
      </main>
      {(footerVisible || !['/','/' + 'work'].includes(location.pathname)) && (
        <div className="transition-opacity duration-700 opacity-100">
          <Footer onAdminClick={handleAdminClick} isAdmin={isAdmin} onLogout={() => signOut()} />
        </div>
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showCMS && isAdmin && <AdminCMS projects={projects} onClose={() => setShowCMS(false)} onProjectsChanged={loadProjects} />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  )
}
