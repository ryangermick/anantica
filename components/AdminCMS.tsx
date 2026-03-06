import React, { useState, useEffect } from 'react';
import { DesignProject, AboutContent, WorkHistoryItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  updateProject,
  deleteProject,
  addProject,
  updateProjectsOrder,
  uploadImage,
  subscribeToAboutContent,
  updateAboutContent,
  uploadProfileImage,
  DEFAULT_ABOUT_CONTENT,
} from '../services/firestore';
import {
  GripVertical,
  Trash2,
  Save,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
  Images,
} from 'lucide-react';

interface AdminCMSProps {
  projects: DesignProject[];
  onClose: () => void;
}

interface EditingProject extends DesignProject {
  isNew?: boolean;
  imageFile?: File;
}

type CMSTab = 'portfolio' | 'about';

const AdminCMS: React.FC<AdminCMSProps> = ({ projects, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<CMSTab>('portfolio');
  
  // Portfolio state
  const [editingProjects, setEditingProjects] = useState<EditingProject[]>(
    projects.map(p => ({ ...p }))
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // About state
  const [aboutContent, setAboutContent] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [editingAbout, setEditingAbout] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  
  // Shared state
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setEditingProjects(projects.map(p => ({ ...p })));
  }, [projects]);

  useEffect(() => {
    const unsubscribe = subscribeToAboutContent((content) => {
      setAboutContent(content);
      setEditingAbout(content);
    });
    return () => unsubscribe();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // ========== PORTFOLIO HANDLERS ==========
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newProjects = [...editingProjects];
    const [draggedProject] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(dropIndex, 0, draggedProject);

    const reorderedProjects = newProjects.map((p, idx) => ({
      ...p,
      sortOrder: idx,
    }));

    setEditingProjects(reorderedProjects);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleFieldChange = (id: string, field: keyof EditingProject, value: string) => {
    setEditingProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(projectId);
    try {
      const imageUrl = await uploadImage(file, projectId);
      setEditingProjects(prev =>
        prev.map(p => (p.id === projectId ? { ...p, imageUrl } : p))
      );
      showMessage('success', 'Image uploaded successfully!');
    } catch (error) {
      showMessage('error', 'Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setUploadingId(null);
    }
  };

  const handleAddProject = () => {
    const newProject: EditingProject = {
      id: `new-${Date.now()}`,
      title: '',
      category: '',
      imageUrl: '',
      description: '',
      artistStatement: '',
      sortOrder: editingProjects.length,
      isNew: true,
    };
    setEditingProjects([newProject, ...editingProjects]);
    setExpandedId(newProject.id);
  };

  const handleDeleteProject = async (id: string) => {
    const project = editingProjects.find(p => p.id === id);
    if (!project) return;

    if (project.isNew) {
      setEditingProjects(prev => prev.filter(p => p.id !== id));
      return;
    }

    if (!confirm('Are you sure you want to delete this piece?')) return;

    try {
      await deleteProject(id);
      setEditingProjects(prev => prev.filter(p => p.id !== id));
      showMessage('success', 'Piece deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete piece');
      console.error('Delete error:', error);
    }
  };

  const handleSaveProject = async (project: EditingProject) => {
    if (!project.title || !project.imageUrl) {
      showMessage('error', 'Title and image are required');
      return;
    }

    setSaving(true);
    try {
      if (project.isNew) {
        const { id: _, isNew, imageFile, ...projectData } = project;
        const newId = await addProject(projectData);
        setEditingProjects(prev =>
          prev.map(p => (p.id === project.id ? { ...project, id: newId, isNew: false } : p))
        );
      } else {
        const { isNew, imageFile, ...projectData } = project;
        await updateProject(project.id, projectData);
      }
      showMessage('success', 'Saved successfully!');
    } catch (error) {
      showMessage('error', 'Failed to save');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const orderUpdates = editingProjects
        .filter(p => !p.isNew)
        .map((p, idx) => ({ id: p.id, sortOrder: idx }));
      await updateProjectsOrder(orderUpdates);
      showMessage('success', 'Order saved!');
    } catch (error) {
      showMessage('error', 'Failed to save order');
      console.error('Order save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // ========== ABOUT HANDLERS ==========
  const handleAboutFieldChange = <K extends keyof AboutContent>(
    field: K,
    value: AboutContent[K]
  ) => {
    setEditingAbout(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId('profile');
    try {
      const imageUrl = await uploadProfileImage(file);
      setEditingAbout(prev => ({ ...prev, profileImageUrl: imageUrl }));
      showMessage('success', 'Profile image uploaded!');
    } catch (error) {
      showMessage('error', 'Failed to upload profile image');
      console.error('Upload error:', error);
    } finally {
      setUploadingId(null);
    }
  };

  const handleWorkHistoryChange = (index: number, field: keyof WorkHistoryItem, value: string) => {
    const newHistory = [...editingAbout.workHistory];
    newHistory[index] = { ...newHistory[index], [field]: value };
    setEditingAbout(prev => ({ ...prev, workHistory: newHistory }));
  };

  const handleAddWorkHistory = () => {
    setEditingAbout(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, { company: '', role: '', years: '' }],
    }));
  };

  const handleRemoveWorkHistory = (index: number) => {
    setEditingAbout(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== index),
    }));
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split('\n').filter(s => s.trim());
    setEditingAbout(prev => ({ ...prev, skills }));
  };

  const handleBioParagraphsChange = (value: string) => {
    const paragraphs = value.split('\n\n').filter(p => p.trim());
    setEditingAbout(prev => ({ ...prev, bioParagraphs: paragraphs }));
  };

  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      await updateAboutContent(editingAbout);
      showMessage('success', 'About content saved!');
    } catch (error) {
      showMessage('error', 'Failed to save about content');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h1 className="font-brand text-xl font-bold tracking-tight">Content Manager</h1>
          </div>
          <div className="flex items-center space-x-3">
            {user && (
              <span className="text-xs text-gray-400 hidden md:block">
                {user.email}
              </span>
            )}
            {activeTab === 'portfolio' && (
              <button
                onClick={handleSaveOrder}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Save Order</span>
              </button>
            )}
            {activeTab === 'about' && (
              <button
                onClick={handleSaveAbout}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Save About</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex space-x-1 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'portfolio'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Images size={16} />
              <span>Portfolio</span>
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'about'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <User size={16} />
              <span>About & Contact</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-sm font-medium shadow-lg transition-all ${
            message.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ========== PORTFOLIO TAB ========== */}
        {activeTab === 'portfolio' && (
          <>
            <button
              onClick={handleAddProject}
              className="w-full mb-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span className="font-medium">Add New Piece</span>
            </button>

            <div className="space-y-3">
              {editingProjects.map((project, index) => (
                <div
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white border rounded-lg overflow-hidden transition-all ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${
                    dragOverIndex === index
                      ? 'border-black ring-2 ring-black ring-opacity-20'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center p-4 space-x-4">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                      <GripVertical size={20} />
                    </div>

                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {project.title || 'Untitled'}
                        {project.isNew && (
                          <span className="ml-2 text-xs text-orange-500">(unsaved)</span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">
                        {project.category || 'No category'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === project.id ? null : project.id)
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedId === project.id ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedId === project.id && (
                    <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                          Image
                        </label>
                        <div className="flex items-start space-x-4">
                          <div className="w-32 h-32 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            {project.imageUrl ? (
                              <img
                                src={project.imageUrl}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon size={32} />
                              </div>
                            )}
                          </div>
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, project.id)}
                              className="hidden"
                              id={`upload-${project.id}`}
                            />
                            <label
                              htmlFor={`upload-${project.id}`}
                              className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-white transition-colors"
                            >
                              {uploadingId === project.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Upload size={16} />
                              )}
                              <span>Upload Image</span>
                            </label>
                            <p className="text-xs text-gray-400 mt-2">Or paste an image URL below</p>
                            <input
                              type="text"
                              value={project.imageUrl}
                              onChange={(e) => handleFieldChange(project.id, 'imageUrl', e.target.value)}
                              placeholder="https://..."
                              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Title *</label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => handleFieldChange(project.id, 'title', e.target.value)}
                            placeholder="Enter title..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Category</label>
                          <input
                            type="text"
                            value={project.category}
                            onChange={(e) => handleFieldChange(project.id, 'category', e.target.value)}
                            placeholder="e.g., Oil Painting, Photography..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Year</label>
                          <input
                            type="text"
                            value={project.year || ''}
                            onChange={(e) => handleFieldChange(project.id, 'year', e.target.value)}
                            placeholder="2024"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Medium</label>
                          <input
                            type="text"
                            value={project.medium || ''}
                            onChange={(e) => handleFieldChange(project.id, 'medium', e.target.value)}
                            placeholder="Oil on canvas..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Dimensions</label>
                          <input
                            type="text"
                            value={project.dimensions || ''}
                            onChange={(e) => handleFieldChange(project.id, 'dimensions', e.target.value)}
                            placeholder='24" x 36"'
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Description</label>
                        <textarea
                          value={project.description || ''}
                          onChange={(e) => handleFieldChange(project.id, 'description', e.target.value)}
                          placeholder="Brief description of the piece..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Artist Statement / Notes</label>
                        <textarea
                          value={project.artistStatement || ''}
                          onChange={(e) => handleFieldChange(project.id, 'artistStatement', e.target.value)}
                          placeholder="What you want to say about this piece..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black resize-none"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSaveProject(project)}
                          disabled={saving}
                          className="flex items-center space-x-2 px-6 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {editingProjects.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p>No pieces yet. Add your first one above!</p>
              </div>
            )}
          </>
        )}

        {/* ========== ABOUT TAB ========== */}
        {activeTab === 'about' && (
          <div className="space-y-10">
            {/* Profile Section */}
            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <h2 className="font-brand text-lg font-bold tracking-tight border-b border-gray-100 pb-3">
                Profile
              </h2>

              {/* Profile Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-start space-x-4">
                  <div className="w-32 h-40 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {editingAbout.profileImageUrl ? (
                      <img
                        src={editingAbout.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                      id="upload-profile"
                    />
                    <label
                      htmlFor="upload-profile"
                      className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {uploadingId === 'profile' ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      <span>Upload Photo</span>
                    </label>
                    <p className="text-xs text-gray-400 mt-2">Or paste an image URL below</p>
                    <input
                      type="text"
                      value={editingAbout.profileImageUrl}
                      onChange={(e) => handleAboutFieldChange('profileImageUrl', e.target.value)}
                      placeholder="https://..."
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Name & Tagline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingAbout.name}
                    onChange={(e) => handleAboutFieldChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Location</label>
                  <input
                    type="text"
                    value={editingAbout.location}
                    onChange={(e) => handleAboutFieldChange('location', e.target.value)}
                    placeholder="Oakland, CA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Tagline</label>
                <input
                  type="text"
                  value={editingAbout.tagline}
                  onChange={(e) => handleAboutFieldChange('tagline', e.target.value)}
                  placeholder="Design Leader in Product and Consultant based in Oakland, CA."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                />
              </div>
            </section>

            {/* Bio Section */}
            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <h2 className="font-brand text-lg font-bold tracking-tight border-b border-gray-100 pb-3">
                Bio
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Bio Headline (Bold intro paragraph)
                </label>
                <textarea
                  value={editingAbout.bioHeadline}
                  onChange={(e) => handleAboutFieldChange('bioHeadline', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Additional Bio Paragraphs (separate with blank lines)
                </label>
                <textarea
                  value={editingAbout.bioParagraphs.join('\n\n')}
                  onChange={(e) => handleBioParagraphsChange(e.target.value)}
                  rows={6}
                  placeholder="First paragraph...

Second paragraph..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Philosophy Quote</label>
                <textarea
                  value={editingAbout.philosophy}
                  onChange={(e) => handleAboutFieldChange('philosophy', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black resize-none"
                />
              </div>
            </section>

            {/* Work History Section */}
            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="font-brand text-lg font-bold tracking-tight">Work History</h2>
                <button
                  onClick={handleAddWorkHistory}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-black transition-colors"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-4">
                {editingAbout.workHistory.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_auto] gap-3 items-end">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Company</label>
                      <input
                        type="text"
                        value={item.company}
                        onChange={(e) => handleWorkHistoryChange(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Role</label>
                      <input
                        type="text"
                        value={item.role}
                        onChange={(e) => handleWorkHistoryChange(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Years</label>
                      <input
                        type="text"
                        value={item.years}
                        onChange={(e) => handleWorkHistoryChange(index, 'years', e.target.value)}
                        placeholder="2020 – 2023"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveWorkHistory(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Education & Skills */}
            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <h2 className="font-brand text-lg font-bold tracking-tight border-b border-gray-100 pb-3">
                Education & Skills
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">School</label>
                  <input
                    type="text"
                    value={editingAbout.school}
                    onChange={(e) => handleAboutFieldChange('school', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Degree</label>
                  <input
                    type="text"
                    value={editingAbout.degree}
                    onChange={(e) => handleAboutFieldChange('degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Skills (one per line)
                </label>
                <textarea
                  value={editingAbout.skills.join('\n')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  rows={5}
                  placeholder="User Experience
Web Design
Graphic Design"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black resize-none"
                />
              </div>
            </section>

            {/* Social Links */}
            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <h2 className="font-brand text-lg font-bold tracking-tight border-b border-gray-100 pb-3">
                Social Links
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editingAbout.linkedinUrl}
                    onChange={(e) => handleAboutFieldChange('linkedinUrl', e.target.value)}
                    placeholder="https://www.linkedin.com/in/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">LinkedIn Handle</label>
                  <input
                    type="text"
                    value={editingAbout.linkedinHandle}
                    onChange={(e) => handleAboutFieldChange('linkedinHandle', e.target.value)}
                    placeholder="/alexandra-felski"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Website URL</label>
                  <input
                    type="text"
                    value={editingAbout.websiteUrl}
                    onChange={(e) => handleAboutFieldChange('websiteUrl', e.target.value)}
                    placeholder="https://www.yoursite.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Website Display Name</label>
                  <input
                    type="text"
                    value={editingAbout.websiteDisplay}
                    onChange={(e) => handleAboutFieldChange('websiteDisplay', e.target.value)}
                    placeholder="yoursite.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Behance URL (optional)</label>
                <input
                  type="text"
                  value={editingAbout.behanceUrl || ''}
                  onChange={(e) => handleAboutFieldChange('behanceUrl', e.target.value)}
                  placeholder="https://www.behance.net/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                />
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              <h2 className="font-brand text-lg font-bold tracking-tight border-b border-gray-100 pb-3">
                Contact Page
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Headline</label>
                <input
                  type="text"
                  value={editingAbout.contactHeadline}
                  onChange={(e) => handleAboutFieldChange('contactHeadline', e.target.value)}
                  placeholder="Work with me."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Description</label>
                <textarea
                  value={editingAbout.contactDescription}
                  onChange={(e) => handleAboutFieldChange('contactDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-black resize-none"
                />
              </div>
            </section>

            {/* Save Button (sticky) */}
            <div className="sticky bottom-4 flex justify-end">
              <button
                onClick={handleSaveAbout}
                disabled={saving}
                className="flex items-center space-x-2 px-8 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-lg"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Save All About Changes</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCMS;
