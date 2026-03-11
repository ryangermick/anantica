import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { upsertProject, deleteProject, updateSortOrders, uploadImage, fetchAbout, saveAbout, fetchContacts } from '../lib/data'
import { X, Save, GripVertical, Trash2, Plus, ChevronDown, ChevronRight, Upload, Loader2, LayoutGrid, User, Mail } from 'lucide-react'

export default function AdminCMS({ projects, onClose, onProjectsChanged }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('portfolio')
  const [items, setItems] = useState(projects.map(p => ({ ...p })))
  const [expanded, setExpanded] = useState(null)
  const [dragIdx, setDragIdx] = useState(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [about, setAbout] = useState(null)
  const [savingAbout, setSavingAbout] = useState(false)
  const [contacts, setContacts] = useState([])

  useEffect(() => { setItems(projects.map(p => ({ ...p }))) }, [projects])
  useEffect(() => {
    if (tab === 'about') fetchAbout().then(setAbout)
    if (tab === 'contacts') fetchContacts().then(setContacts)
  }, [tab])

  const handleSave = async () => {
    setSaving(true); setStatus('')
    try {
      for (const item of items) {
        let url = item.imageUrl
        if (item.imageFile) url = await uploadImage(item.imageFile)
        await upsertProject({ ...item, imageUrl: url })
      }
      await updateSortOrders(items.map((p, i) => ({ id: p.id, sortOrder: i })))
      setStatus('Saved!')
      onProjectsChanged()
      setTimeout(() => setStatus(''), 2000)
    } catch (e) { setStatus('Error: ' + e.message) }
    setSaving(false)
  }

  const addProject = () => {
    const p = { id: crypto.randomUUID(), title: 'New Project', category: 'Category', imageUrl: `https://picsum.photos/seed/${Date.now()}/800/600`, description: '', sortOrder: items.length, isNew: true }
    setItems([...items, p]); setExpanded(p.id)
  }

  const removeProject = async (id) => {
    try { await deleteProject(id) } catch {}
    setItems(items.filter(p => p.id !== id))
    onProjectsChanged()
  }

  const updateField = (id, field, value) => {
    setItems(items.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const handleFile = (id, file) => {
    const url = URL.createObjectURL(file)
    setItems(items.map(p => p.id === id ? { ...p, imageFile: file, imageUrl: url } : p))
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const copy = [...items]
    const [moved] = copy.splice(dragIdx, 1)
    copy.splice(idx, 0, moved)
    setItems(copy); setDragIdx(idx)
  }

  const handleSaveAbout = async () => {
    if (!about) return
    setSavingAbout(true)
    try { await saveAbout(about); setStatus('About saved!'); setTimeout(() => setStatus(''), 2000) } catch (e) { setStatus('Error: ' + e.message) }
    setSavingAbout(false)
  }

  const updateAbout = (k, v) => setAbout(a => a && { ...a, [k]: v })

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="font-brand text-xl font-bold tracking-tight">CMS</h2>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {['portfolio', 'about', 'contacts'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${tab === t ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}>
                  {t === 'portfolio' && <LayoutGrid size={14} className="inline mr-1" />}
                  {t === 'about' && <User size={14} className="inline mr-1" />}
                  {t === 'contacts' && <Mail size={14} className="inline mr-1" />}
                  {t}
                </button>
              ))}
            </div>
            {status && <span className="text-xs text-green-600 font-medium">{status}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{user?.email}</span>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'portfolio' && (
            <div className="space-y-3">
              {items.map((p, i) => (
                <div key={p.id} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => handleDragOver(e, i)} onDragEnd={() => setDragIdx(null)}
                  className={`border rounded-lg transition-all ${dragIdx === i ? 'opacity-50 border-black' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
                    <GripVertical size={16} className="text-gray-300 cursor-grab" />
                    <img src={p.imageUrl} alt="" className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removeProject(p.id) }} className="p-1.5 text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                    {expanded === p.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  {expanded === p.id && (
                    <div className="px-4 pb-4 space-y-3 border-t pt-3">
                      <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Title" value={p.title} onChange={e => updateField(p.id, 'title', e.target.value)} />
                      <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Category" value={p.category} onChange={e => updateField(p.id, 'category', e.target.value)} />
                      <textarea className="w-full border rounded px-3 py-2 text-sm" placeholder="Description" rows={3} value={p.description || ''} onChange={e => updateField(p.id, 'description', e.target.value)} />
                      <div className="grid grid-cols-3 gap-2">
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Year" value={p.year || ''} onChange={e => updateField(p.id, 'year', e.target.value)} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Medium" value={p.medium || ''} onChange={e => updateField(p.id, 'medium', e.target.value)} />
                        <input className="border rounded px-3 py-2 text-sm" placeholder="Dimensions" value={p.dimensions || ''} onChange={e => updateField(p.id, 'dimensions', e.target.value)} />
                      </div>
                      <textarea className="w-full border rounded px-3 py-2 text-sm" placeholder="Artist statement" rows={2} value={p.artistStatement || ''} onChange={e => updateField(p.id, 'artistStatement', e.target.value)} />
                      <div className="flex items-center gap-3">
                        <input className="flex-1 border rounded px-3 py-2 text-sm" placeholder="Image URL" value={p.imageUrl} onChange={e => updateField(p.id, 'imageUrl', e.target.value)} />
                        <label className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded text-xs font-medium cursor-pointer hover:bg-gray-200">
                          <Upload size={14} /> Upload
                          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(p.id, e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addProject} className="w-full border-2 border-dashed border-gray-200 rounded-lg py-4 text-sm text-gray-400 hover:text-gray-600 hover:border-gray-400 flex items-center justify-center gap-2">
                <Plus size={16} /> Add project
              </button>
            </div>
          )}

          {tab === 'about' && about && (
            <div className="space-y-6 max-w-2xl">
              <div><label className="text-xs font-bold uppercase tracking-wider text-gray-400">Name</label><input className="w-full border rounded px-3 py-2 mt-1" value={about.name} onChange={e => updateAbout('name', e.target.value)} /></div>
              <div><label className="text-xs font-bold uppercase tracking-wider text-gray-400">Tagline</label><textarea className="w-full border rounded px-3 py-2 mt-1" rows={2} value={about.tagline} onChange={e => updateAbout('tagline', e.target.value)} /></div>
              <div><label className="text-xs font-bold uppercase tracking-wider text-gray-400">Bio Headline</label><textarea className="w-full border rounded px-3 py-2 mt-1" rows={2} value={about.bioHeadline} onChange={e => updateAbout('bioHeadline', e.target.value)} /></div>
              <div><label className="text-xs font-bold uppercase tracking-wider text-gray-400">Philosophy</label><textarea className="w-full border rounded px-3 py-2 mt-1" rows={2} value={about.philosophy} onChange={e => updateAbout('philosophy', e.target.value)} /></div>
            </div>
          )}

          {tab === 'contacts' && (
            <div className="space-y-4">
              {contacts.length === 0 ? <p className="text-gray-400 text-center py-12">No contact submissions yet</p> :
                contacts.map((c, i) => (
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

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-black">Cancel</button>
          {tab === 'portfolio' && (
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save All
            </button>
          )}
          {tab === 'about' && (
            <button onClick={handleSaveAbout} disabled={savingAbout}
              className="px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2">
              {savingAbout ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save About
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
