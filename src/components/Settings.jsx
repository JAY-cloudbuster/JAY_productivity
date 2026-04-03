import { useState } from 'react';
import { HiOutlineKey, HiOutlineSave, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi';

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
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-surface-500 mt-1 text-sm">Configure your productivity dashboard</p>
      </div>

      {/* OpenAI API Key */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <HiOutlineKey className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">OpenAI API Key</h3>
            <p className="text-xs text-surface-500">Required for AI-powered command parsing</p>
          </div>
        </div>

        <input
          id="settings-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="input-field font-mono text-sm"
        />

        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm">
            {saved ? <HiOutlineCheck className="w-4 h-4" /> : <HiOutlineSave className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Key'}
          </button>
          <button onClick={handleClear} className="btn-danger flex items-center gap-2">
            <HiOutlineTrash className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
          <p className="text-xs text-amber-400/80">
            <strong>Note:</strong> Without an API key, the AI will use local pattern matching (limited). 
            Your key is stored locally and never sent to our servers.
          </p>
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-6 space-y-3">
        <h3 className="text-sm font-semibold text-white">About</h3>
        <div className="space-y-2 text-sm text-surface-400">
          <p>JAY Productivity Dashboard v1.0.0</p>
          <p>A local-first, AI-assisted productivity application.</p>
          <p>All data is stored locally in SQLite — nothing leaves your machine.</p>
        </div>
      </div>
    </div>
  );
}
