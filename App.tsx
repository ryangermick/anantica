import React, { useState, useEffect } from 'react'
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
import { DesignProject, Section } from './types'

const AppContent: React.FC = () => {
  const { isAdmin, user } = useAuth()
  const [activeSection, setActiveSection] = useState<Section>('portfolio')
  const [projects, setProjects] = useState<DesignProject[]>(INITIAL_PROJECTS)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAdminCMS, setShowAdminCMS] = useState(false)

  useEffect(() => {
    const sectionTitles: Record<Section, string> = {
      portfolio: 'Work', about: 'About', contact: 'Contact',
    }
    document.title = `Anantica Singh | ${sectionTitles[activeSection]}`
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
    }
  }

  const handleAdminClick = () => {
    if (isAdmin) setShowAdminCMS(true)
    else setShowLoginModal(true)
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'portfolio': return <Portfolio projects={projects} />
      case 'about': return <About />
      case 'contact': return <Contact />
      default: return <Portfolio projects={projects} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} isScrolled={isScrolled} />
      <main className="flex-grow pt-32 pb-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto w-full">
        {renderSection()}
      </main>
      <Footer onAdminClick={handleAdminClick} isAdmin={isAdmin} onLogout={() => signOut()} />
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showAdminCMS && isAdmin && (
        <AdminCMS projects={projects} onClose={() => setShowAdminCMS(false)} onProjectsChanged={loadProjects} />
      )}
    </div>
  )
}

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
)

export default App
