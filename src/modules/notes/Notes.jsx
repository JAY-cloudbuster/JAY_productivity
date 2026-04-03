import { useState, useEffect } from 'react';
import { useNoteStore } from '../../store/noteStore';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineDocumentText } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notes() {
  const { notes, fetchNotes, createNote, updateNote, deleteNote } = useNoteStore();
  const [activeNote, setActiveNote] = useState(null);
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Handle Note selection
  useEffect(() => {
    if (activeNote) {
      setContent(activeNote.content);
    } else {
      setContent('');
    }
  }, [activeNote]);

  // Auto-save logic
  useEffect(() => {
    if (!activeNote) return;
    const timer = setTimeout(() => {
      if (content !== activeNote.content) {
        updateNote(activeNote.id, content).then(n => {
          setActiveNote(n);
        });
      }
      setIsTyping(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, activeNote, updateNote]);

  const handleCreate = async () => {
    const newNote = await createNote('New Note');
    setActiveNote(newNote);
  };

  const handleDelete = async (id) => {
    if (activeNote?.id === id) setActiveNote(null);
    await deleteNote(id);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* Sidebar List */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="w-1/3 glass-panel flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-display font-bold text-white tracking-wide">My Notes</h3>
          <button onClick={handleCreate} className="p-2 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 rounded-xl transition-all">
            <HiOutlinePlus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {notes.length === 0 && (
            <div className="p-6 text-center text-surface-500 text-sm">No notes yet.</div>
          )}
          {notes.map(note => {
            const preview = note.content.split('\\n')[0].substring(0, 30) || 'Empty Note';
            const isActive = activeNote?.id === note.id;
            return (
              <button
                key={note.id}
                onClick={() => setActiveNote(note)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group relative
                  ${isActive ? 'bg-brand-500/20 border border-brand-500/30 shadow-glow-brand/10' : 'hover:bg-white/[0.03] border border-transparent'}`}
              >
                <p className={`font-semibold text-sm truncate ${isActive ? 'text-brand-100' : 'text-surface-200'}`}>{preview}</p>
                <p className="text-[10px] text-surface-500 mt-1">
                  {new Date(note.updated_at).toLocaleDateString()}
                </p>
                
                <div 
                  onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </div>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Editor Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="flex-1 glass-panel flex flex-col overflow-hidden relative"
      >
        {activeNote ? (
          <>
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-900/30">
              <span className="text-xs font-mono text-surface-500">ID: {activeNote.id.split('-')[0]}</span>
              <span className="text-xs text-surface-400 flex items-center gap-2">
                {isTyping ? (
                   <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-amber-400 animate-pulse rounded-full"></span> Unsaved changes</span>
                ) : (
                   <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Saved</span>
                )}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setIsTyping(true);
              }}
              placeholder="Start typing your masterful thoughts..."
              className="flex-1 w-full bg-transparent border-none resize-none p-8 font-sans text-lg leading-relaxed text-surface-100 focus:ring-0 focus:outline-none"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-surface-800/50 rounded-3xl flex items-center justify-center mb-6 shadow-glass">
              <HiOutlineDocumentText className="w-10 h-10 text-surface-500" />
            </div>
            <h3 className="text-xl font-display font-medium text-white mb-2">Select a Note</h3>
            <p className="text-surface-400 max-w-sm">Choose an existing note from the sidebar or create a new one to capture your ideas.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
