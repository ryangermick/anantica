import React, { useState, useEffect } from 'react'
import { DEFAULT_ABOUT_CONTENT } from '../constants'
import { getAboutContent } from '../lib/data'
import { AboutContent } from '../types'

const About: React.FC = () => {
  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT)

  useEffect(() => {
    getAboutContent().then(setContent)
  }, [])

  const profileImage = content.profileImageUrl || 'https://ui-avatars.com/api/?name=Anantica+Singh&background=1c1917&color=fafaf9&size=600&bold=true&font-size=0.33'

  const renderParagraph = (paragraph: string, index: number) => {
    if (paragraph.includes('Scratch Foundation')) {
      const parts = paragraph.split('Scratch Foundation')
      return <p key={index}>{parts[0]}<a href="https://scratch.org/" target="_blank" rel="noopener noreferrer" className="text-black underline decoration-1 underline-offset-4 hover:text-purple-500 transition-colors">Scratch Foundation</a>{parts[1]}</p>
    }
    if (paragraph.includes('Spiral Gardens')) {
      const parts = paragraph.split('Spiral Gardens')
      return <p key={index}>{parts[0]}<a href="http://www.spiralgardens.org/" target="_blank" rel="noopener noreferrer" className="text-black underline decoration-1 underline-offset-4 hover:text-purple-500 transition-colors">Spiral Gardens</a>{parts[1]}</p>
    }
    return <p key={index}>{paragraph}</p>
  }

  return (
    <div className="fade-in max-w-5xl">
      {/* Mobile layout */}
      <div className="lg:hidden space-y-10">
        {/* Photo + Name side by side */}
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 flex-shrink-0 rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
            <img src={profileImage} alt={content.name} className="w-full h-full object-cover" />
          </div>
          <h1 className="font-brand text-4xl font-extrabold tracking-tighter leading-none text-purple-500">
            {content.name.split(' ').map((part, i) => (
              <React.Fragment key={i}>{part}{i === 0 ? <br/> : '.'}</React.Fragment>
            ))}
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl font-light text-gray-600 leading-snug">
          {content.tagline.includes(content.location) ? (
            <>{content.tagline.split(content.location)[0]}
              <span className="text-black italic underline decoration-1 underline-offset-8">{content.location}</span>
              {content.tagline.split(content.location)[1]}</>
          ) : content.tagline}
        </p>

        {/* Bio prose */}
        <div className="prose prose-lg text-gray-500 leading-relaxed space-y-6">
          <p className="text-lg text-black font-medium leading-relaxed">{content.bioHeadline}</p>
          {content.bioParagraphs.map(renderParagraph)}
        </div>

        {/* Selected History */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400">Selected History</h3>
          <ul className="space-y-4 text-[13px] leading-relaxed">
            {content.workHistory.map((item, index) => (
              <li key={index} className="flex flex-col">
                <span className="font-bold">{item.company}</span>
                <span className="text-gray-500 italic">{item.role}, {item.years}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Education */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400">Education</h3>
          <ul className="space-y-3 text-[13px]">
            {content.education.map((item, index) => (
              <li key={index} className="flex flex-col">
                <span className="font-bold">{item.school}</span>
                <span className="text-gray-500 italic">{item.degree}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skills + Philosophy */}
        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-gray-100">
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold">Top Skills</h4>
            <ul className="text-sm space-y-1 text-gray-500 font-medium">
              {content.skills.map((skill, index) => <li key={index}>{skill}</li>)}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-bold">Philosophy</h4>
            <p className="text-sm text-gray-500 leading-relaxed italic">"{content.philosophy}"</p>
          </div>
        </div>
      </div>

      {/* Desktop layout (unchanged) */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_2fr] gap-20 items-start">
        <div className="space-y-10">
          <div className="aspect-[3/4] bg-gray-200 rounded-sm overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 cursor-crosshair">
            <img src={profileImage} alt={content.name} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-6">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400">Selected History</h3>
            <ul className="space-y-4 text-[13px] leading-relaxed">
              {content.workHistory.map((item, index) => (
                <li key={index} className="flex flex-col">
                  <span className="font-bold">{item.company}</span>
                  <span className="text-gray-500 italic">{item.role}, {item.years}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400">Education</h3>
            <ul className="space-y-3 text-[13px]">
              {content.education.map((item, index) => (
                <li key={index} className="flex flex-col">
                  <span className="font-bold">{item.school}</span>
                  <span className="text-gray-500 italic">{item.degree}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="space-y-12">
          <div>
            <h1 className="font-brand text-8xl font-extrabold mb-8 tracking-tighter leading-none text-purple-500">
              {content.name.split(' ').map((part, i) => (
                <React.Fragment key={i}>{part}{i === 0 ? <br/> : '.'}</React.Fragment>
              ))}
            </h1>
            <p className="text-3xl font-light text-gray-600 leading-snug">
              {content.tagline.includes(content.location) ? (
                <>{content.tagline.split(content.location)[0]}
                  <span className="text-black italic underline decoration-1 underline-offset-8">{content.location}</span>
                  {content.tagline.split(content.location)[1]}</>
              ) : content.tagline}
            </p>
          </div>
          <div className="prose prose-lg text-gray-500 leading-relaxed space-y-6 max-w-2xl">
            <p className="text-xl text-black font-medium leading-relaxed">{content.bioHeadline}</p>
            {content.bioParagraphs.map(renderParagraph)}
          </div>
          <div className="grid grid-cols-2 gap-12 pt-8 border-t border-gray-100">
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-bold">Top Skills</h4>
              <ul className="text-sm space-y-1 text-gray-500 font-medium">
                {content.skills.map((skill, index) => <li key={index}>{skill}</li>)}
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest font-bold">Philosophy</h4>
              <p className="text-sm text-gray-500 leading-relaxed italic">"{content.philosophy}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
