import React, { useState, useEffect } from 'react'
import { DesignProject, AboutContent, WorkHistoryItem } from '../types'
import { useAuth } from '../contexts/AuthContext'
import {
  upsertProject, deleteProject as deleteProjectDb, updateProjectsOrder,
  uploadImage, getAboutContent, updateAboutContent, getContacts,
} from '../lib/data'
import {
  GripVertical, Trash2, Save, Plus, X, Upload, Image as ImageIcon,
  ChevronDown, ChevronUp, Loader2, User, Images, MessageSquare,
} from 'lucide-react'

interface AdminCMSProps {
  projects: DesignProject[]
  onClose: () => void
  onProjectsChanged: () => void
}

interface EditingProject extends DesignProject {
  isNew?: boolean
  imageFile?: File
}

type CMSTab = 'portfolio' | 'about' | 'contacts'

const AdminCMS: React.FC<AdminCMSProps> = ({ projects, onClose, onProjectsChanged }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<CMSTab>('portfolio')

  // Portfolio state
  const [editingProjects, setEditingProjects] = useState<EditingProject[]>(
    projects.map(p => ({ ...p }))
  )
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // About state
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null)
  const [aboutSaving, setAboutSaving] = useState(false)

  // Contacts state
  const [contacts, setContacts] = useState<any[]>([])

  useEffect(() => {
    setEditingProjects(projects.map(p => ({ ...p })))
  }, [projects])

  useEffect(() => {
    if (activeTab === 'about') {
      getAboutContent().then(setAboutContent)
    }
    if (activeTab === 'contacts') {
      getContacts().then(setContacts)
    }
  }, [activeTab])

  const handleSaveAll = async () => {
    setSaving(true)
    setSaveMessage('')
    try {
      for (const p of editingProjects) {
        let imageUrl = p.imageUrl
        if (p.imageFile) {
          imageUrl = await uploadImage(p.imageFile)
        }
        await upsertProject({ ...p, imageUrl })
      }
      await updateProjectsOrder(editingProjects.map((p, i) => ({ id: p.id, sortOrder: i })))
      setSaveMessage('Saved!')
      onProjectsChanged()
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (e: any) {
      setSaveMessage('Error: ' + e.message)
    }
    setSaving(false)
  }

  const handleAddProject = () => {
    const newProject: EditingProject = {
      id: crypto.randomUUID(),
      title: 'New Project',
      category: 'Category',
      imageUrl: 'https://picsum.photos/seed/' + Date.now() + '/800/600',
      description: '',
      sortOrder: editingProjects.length,
      isNew: true,
    }
    setEditingProjects([...editingProjects, newProject])
    setExpandedId(newProject.id)
  }

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProjectDb(id)
      setEditingProjects(prev => prev.filter(p => p.id !== id))
      onProjectsChanged()
    } catch { /* ignore if not in DB yet */ }
    setEditingProjects(prev => prev.filter(p => p.id !== id))
  }

  const updateField = (id: string, field: string, value: string) => {
    setEditingProjects(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    )
  }

  const handleImageChange = (id: string, file: File) => {
    const url = URL.createObjectURL(file)
    setEditingProjects(prev =>
      prev.map(p => p.id === id ? { ...p, imageFile: file, imageUrl: url } : p)
    )
  }

  // Drag reorder
  const handleDragStart = (index: number) => setDraggedIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const items = [...editingProjects]
    const [dragged] = items.splice(draggedIndex, 1)
    items.splice(index, 0, dragged)
    setEditingProjects(items)
    setDraggedIndex(index)
  }
  const handleDragEnd = () => setDraggedIndex(null)

  // About save
  const handleSaveAbout = async () => {
    if (!aboutContent) return
    setAboutSaving(true)
    try {
      await updateAboutContent(aboutContent)
      setSaveMessage('About saved!')
      setTimeout(() => setSaveMessage(''), 2000)
    } catch (e: any) {
      setSaveMessage('Error: ' + e.message)
    }
    setAboutSaving(false)
  }

  const updateAboutField = (field: string, value: any) => {
    setAboutContent(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const updateWorkHistory = (index: number, field: keyof WorkHistoryItem, value: string) => {
    if (!aboutContent) return
    const wh = [...aboutContent.workHistory]
    wh[index] = { ...wh[index], [field]: value }
    setAboutContent({ ...aboutContent, workHistory: wh })
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="font-brand text-xl font-bold tracking-tight">CMS</h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {(['portfolio', 'about', 'contacts'] as CMSTab[]).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                    activeTab === tab ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  {tab === 'portfolio' && <Images size={14} className="inline mr-1" />}
                  {tab === 'about' && <User size={14} className="inline mr-1" />}
                  {tab === 'contacts' && <MessageSquare size={14} className="inline mr-1" />}
                  {tab}
                </button>
              ))}
            </div>
            {saveMessage && <span className="text-xs text-green-600 font-medium">{saveMessage}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{user?.email}</span>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'portfolio' && (
            <div className="space-y-3">
              {editingProjects.map((project, index) => (
                <div key={project.id} draggable onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)} onDragEnd={handleDragEnd}
                  className={`border rounded-lg transition-all ${draggedIndex === index ? 'opacity-50 border-black' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}>
                    <GripVertical size={16} className="text-gray-300 cursor-grab" />
                    <img src={project.imageUrl} alt="" className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{project.title}</p>
                      <p className="text-xs text-gray-400">{project.category}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                      className="p-1.5 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                    {expandedId === project.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {expandedId === project.id && (
                    <div className="px-4 pb-4 space-y-3 border-t pt-3">
                      <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Title"
                        value={project.title} onChange={e => updateField(project.id, 'title', e.target.value)} />
                      <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Category"
                        value={project.category} onChange={e => updateField(project.id, 'category', e.target.value)} />
                      <textarea className="w-full border rounded px-3 py-2 text-sm" placeholder="Description" rows={3}
                        value={project.description || ''} onChange={e => updateField(project.id, 'description', e.target.value)} />
                      <div className="grid grid-cols-3 gap-2">
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Year" value={project.year || ''}
                          onChange={e => updateField(project.id, 'year', e.target.value)} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Medium" value={project.medium || ''}
                          onChange={e => updateField(project.id, 'medium', e.target.value)} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Dimensions" value={project.dimensions || ''}
                          onChange={e => updateField(project.id, 'dimensions', e.target.value)} />
                      </div>
                      <textarea className="w-full border rounded px-3 py-2 text-sm" placeholder="Artist statement" rows={2}
                        value={project.artistStatement || ''} onChange={e => updateField(project.id, 'artistStatement', e.target.value)} />
                      <div className="flex items-center gap-3">
                        <input className="flex-1 border rounded px-3 py-2 text-sm" placeholder="Image URL"
                          value={project.imageUrl} onChange={e => updateField(project.id, 'imageUrl', e.target.value)} />
                        <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded text-xs font-medium cursor-pointer hover:bg-gray-200">
                          <Upload size={14} /> Upload
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => e.target.files?.[0] && handleImageChange(project.id, e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={handleAddProject}
                className="w-full border-2 border-dashed border-gray-200 rounded-lg py-4 text-sm text-gray-400 hover:text-gray-600 hover:border-gray-400 flex items-center justify-center gap-2">
                <Plus size={16} /> Add project
              </button>
            </div>
          )}

          {activeTab === 'about' && aboutContent && (
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Name</label>
                <input className="w-full border rounded px-3 py-2" value={aboutContent.name}
                  onChange={e => updateAboutField('name', e.target.value)} />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Tagline</label>
                <textarea className="w-full border rounded px-3 py-2" rows={2} value={aboutContent.tagline}
                  onChange={e => updateAboutField('tagline', e.target.value)} />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Location</label>
                <input className="w-full border rounded px-3 py-2" value={aboutContent.location}
                  onChange={e => updateAboutField('location', e.target.value)} />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Bio Headline</label>
                <textarea className="w-full border rounded px-3 py-2" rows={2} value={aboutContent.bioHeadline}
                  onChange={e => updateAboutField('bioHeadline', e.target.value)} />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Bio Paragraphs</label>
                {aboutContent.bioParagraphs.map((p, i) => (
                  <textarea key={i} className="w-full border rounded px-3 py-2" rows={3} value={p}
                    onChange={e => {
                      const paras = [...aboutContent.bioParagraphs]
                      paras[i] = e.target.value
                      updateAboutField('bioParagraphs', paras)
                    }} />
                ))}
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Work History</label>
                {aboutContent.workHistory.map((w, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <input className="border rounded px-3 py-2 text-sm" value={w.company}
                      onChange={e => updateWorkHistory(i, 'company', e.target.value)} placeholder="Company" />
                    <input className="border rounded px-3 py-2 text-sm" value={w.role}
                      onChange={e => updateWorkHistory(i, 'role', e.target.value)} placeholder="Role" />
                    <input className="border rounded px-3 py-2 text-sm" value={w.years}
                      onChange={e => updateWorkHistory(i, 'years', e.target.value)} placeholder="Years" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Philosophy</label>
                <textarea className="w-full border rounded px-3 py-2" rows={2} value={aboutContent.philosophy}
                  onChange={e => updateAboutField('philosophy', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold uppercase text-gray-400">LinkedIn URL</label>
                  <input className="w-full border rounded px-3 py-2 mt-1" value={aboutContent.linkedinUrl}
                    onChange={e => updateAboutField('linkedinUrl', e.target.value)} /></div>
                <div><label className="text-xs font-bold uppercase text-gray-400">LinkedIn Handle</label>
                  <input className="w-full border rounded px-3 py-2 mt-1" value={aboutContent.linkedinHandle}
                    onChange={e => updateAboutField('linkedinHandle', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold uppercase text-gray-400">Contact Headline</label>
                  <input className="w-full border rounded px-3 py-2 mt-1" value={aboutContent.contactHeadline}
                    onChange={e => updateAboutField('contactHeadline', e.target.value)} /></div>
                <div><label className="text-xs font-bold uppercase text-gray-400">Contact Description</label>
                  <input className="w-full border rounded px-3 py-2 mt-1" value={aboutContent.contactDescription}
                    onChange={e => updateAboutField('contactDescription', e.target.value)} /></div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-4">
              {contacts.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No contact submissions yet</p>
              ) : contacts.map((c, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{c.name}</span>
                    <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500">{c.email}</p>
                  <p className="text-sm text-gray-700">{c.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-black">Cancel</button>
          {activeTab === 'portfolio' && (
            <button onClick={handleSaveAll} disabled={saving}
              className="px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save All
            </button>
          )}
          {activeTab === 'about' && (
            <button onClick={handleSaveAbout} disabled={aboutSaving}
              className="px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
              {aboutSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save About
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCMS
