import { Settings, LogOut } from 'lucide-react'
import { defaultAbout } from '../lib/data'

export default function Footer({ onAdminClick, isAdmin, onLogout }) {
  const year = new Date().getFullYear()
  const about = defaultAbout

  return (
    <footer className="px-4 md:px-8 lg:px-16 py-12 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-brand text-lg font-bold tracking-tight mb-1">{about.name}</h3>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            © {year} {about.name} / All Rights Reserved.
          </p>
        </div>
        <div className="flex space-x-12">
          {about.linkedinUrl && (
            <a href={about.linkedinUrl} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-50 transition-opacity">
              LinkedIn
            </a>
          )}
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-gray-50">
        <div className="max-w-7xl mx-auto flex justify-center items-center space-x-6">
          {isAdmin ? (
            <>
              <button onClick={onAdminClick} className="flex items-center space-x-1.5 text-[9px] uppercase tracking-[0.2em] text-gray-300 hover:text-gray-500 transition-colors">
                <Settings size={10} /><span>Manage</span>
              </button>
              <span className="text-gray-200">|</span>
              <button onClick={onLogout} className="flex items-center space-x-1.5 text-[9px] uppercase tracking-[0.2em] text-gray-300 hover:text-gray-500 transition-colors">
                <LogOut size={10} /><span>Sign Out</span>
              </button>
            </>
          ) : (
            <button onClick={onAdminClick} className="text-[9px] uppercase tracking-[0.2em] text-gray-200 hover:text-gray-400 transition-colors">
              admin
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}
