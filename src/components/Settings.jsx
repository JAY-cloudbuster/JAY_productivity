import { useState } from 'react';
import { HiOutlineKey, HiOutlineSave, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function Settings() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('openai_api_key');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0 border border-brand-500/20 shadow-glow-brand/10">
            <HiOutlineKey className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white mb-1">OpenAI API Key</h3>
            <p className="text-sm text-surface-400">Required for advanced natural language processing. Keys are stored safely in local storage and never leave your machine.</p>
          </div>
        </div>

        <div className="pt-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="neo-input font-mono"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} className="btn-neo-primary flex items-center gap-2">
            {saved ? <HiOutlineCheck className="w-5 h-5" /> : <HiOutlineSave className="w-5 h-5" />}
            {saved ? 'Saved Successfully' : 'Save Configuration'}
          </button>
          <button onClick={handleClear} className="btn-neo-secondary flex items-center gap-2">
            <HiOutlineTrash className="w-5 h-5" />
            Clear Key
          </button>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mt-6">
          <p className="text-sm text-amber-200/80 leading-relaxed font-medium">
            <strong>Security Notice:</strong> JAY OS runs locally on your machine. API keys used here communicate directly from your browser to OpenAI. We do not track or store your key externally. 
            If no key is provided, the AI Assistant relies on a simpler regex-based local parser.
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-8 flex flex-col gap-2">
        <h3 className="text-lg font-display font-bold text-white">System Information</h3>
        <p className="text-sm text-surface-400 font-medium">JAY Operating System v2.0</p>
        <p className="text-xs text-surface-500">Built using React, Framer Motion, Zustand, and Better SQLite abstractions.</p>
      </motion.div>
    </div>
  );
}
