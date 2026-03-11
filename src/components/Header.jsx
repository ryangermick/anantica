export default function Header({ activeSection, setActiveSection, isScrolled }) {
  const navItems = [
    { key: 'portfolio', label: 'Work' },
    { key: 'about', label: 'About' },
    { key: 'contact', label: 'Contact' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6 flex justify-between items-center">
        <button onClick={() => setActiveSection('portfolio')} className="font-brand text-2xl font-extrabold tracking-tighter hover:opacity-50 transition-opacity">
          Anantica Singh
        </button>
        <nav className="flex space-x-8">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`text-xs uppercase tracking-[0.2em] font-bold transition-opacity ${activeSection === item.key ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
