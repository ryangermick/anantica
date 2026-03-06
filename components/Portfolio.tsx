import React from 'react'
import { useNavigate } from 'react-router-dom'
import { DesignProject } from '../types'
import { slugify } from '../lib/slugify'

interface PortfolioProps {
  projects: DesignProject[]
}

const Portfolio: React.FC<PortfolioProps> = ({ projects }) => {
  const navigate = useNavigate()

  return (
    <div className="fade-in">
      <div className="mb-12">
        <h1 className="font-brand text-5xl md:text-7xl font-extrabold mb-4 tracking-tighter">
          Selected Works<span className="text-gray-300">.</span>
        </h1>
        <p className="text-gray-500 max-w-xl text-lg leading-relaxed">
          Handmade ceramics — wheel-thrown and hand-built vessels, bowls, and planters exploring form, glaze, and texture.
        </p>
      </div>

      <div className="masonry">
        {projects.map((project) => (
          <div
            key={project.id}
            className="masonry-item group relative overflow-hidden rounded-sm cursor-pointer bg-gray-100"
            onClick={() => navigate(`/work/${slugify(project.title)}`)}
          >
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{project.category}</p>
              <h3 className="text-white font-brand text-xl font-bold tracking-tight">{project.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Portfolio
