import { useState, useRef, useEffect } from 'react';
import { parseAICommand, executeAIAction } from '../ai/commandParser';
import { useHabitStore } from '../store/habitStore';
import { useTaskStore } from '../store/taskStore';
import {
  HiOutlineSparkles,
  HiOutlinePaperAirplane,
  HiOutlineTerminal,
  HiOutlineCheck,
  HiOutlineExclamation,
  HiOutlineLightBulb,
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const EXAMPLE_COMMANDS = [
  'Create habit Morning Yoga',
  'Add task Review PR with high priority',
  'Log my Meditation habit',
  'How is my productivity?',
  'Suggest a schedule for today',
  'Complete task Review PR',
];

export default function AICommandInterface() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [processing, setProcessing] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || processing) return;

    setInput('');
    setHistory((h) => [...h, { type: 'user', text: trimmed }]);
    setProcessing(true);

    try {
      const parsed = await parseAICommand(trimmed);
      setHistory((h) => [...h, { type: 'parsed', data: parsed }]);

      const result = await executeAIAction(parsed);
      setHistory((h) => [...h, { type: 'result', data: result }]);

      await Promise.all([fetchHabits(), fetchTasks()]);
    } catch (err) {
      setHistory((h) => [...h, { type: 'error', text: err.message }]);
    } finally {
      setProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleExample = (cmd) => {
    setInput(cmd);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Suggestions */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none shrink-0" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center gap-2 text-surface-400 bg-surface-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
          <HiOutlineLightBulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Try:</span>
        </div>
        {EXAMPLE_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleExample(cmd)}
            className="px-4 py-2 rounded-full bg-surface-800/50 border border-white/5 text-xs text-surface-200 font-medium whitespace-nowrap
              hover:bg-brand-500/10 hover:text-brand-300 hover:border-brand-500/30 transition-all duration-300"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal View */}
      <div className="flex-1 glass-panel flex flex-col relative overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-surface-900/50 flex items-center gap-3 shrink-0">
          <HiOutlineTerminal className="w-5 h-5 text-brand-400" />
          <span className="font-display font-bold text-sm tracking-widest uppercase text-white">JAY Assistant Terminal</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
              <HiOutlineSparkles className="w-16 h-16 mb-4 text-brand-500" />
              <p className="text-surface-300 font-medium">System ready for input.</p>
            </div>
          ) : (
            <AnimatePresence>
              {history.map((entry, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2"
                >
                  {entry.type === 'user' && (
                    <div className="self-end max-w-[80%] bg-surface-800 text-white px-5 py-3 rounded-2xl rounded-tr-none border border-white/10 shadow-lg">
                      <p className="text-sm font-medium leading-relaxed">{entry.text}</p>
                    </div>
                  )}
                  {entry.type === 'parsed' && (
                    <div className="self-start max-w-[80%] flex items-start gap-3 mt-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1 border border-indigo-500/30">
                        <HiOutlineSparkles className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="bg-surface-900/50 backdrop-blur-sm border border-white/5 px-5 py-3 rounded-2xl rounded-tl-none">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-2">Intent Parsed</p>
                        <pre className="text-xs font-mono text-indigo-200 overflow-x-auto">
                          {JSON.stringify(entry.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {entry.type === 'result' && (
                    <div className="self-start max-w-[80%] flex items-start gap-3 mt-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1 border border-emerald-500/30">
                        <HiOutlineCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="bg-surface-900/50 backdrop-blur-sm border border-white/5 px-5 py-3 rounded-2xl rounded-tl-none">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70 mb-2">Execution Success</p>
                        <pre className="text-xs font-mono text-emerald-200/90 overflow-x-auto">
                          {JSON.stringify(entry.data.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {entry.type === 'error' && (
                    <div className="self-start max-w-[80%] flex items-start gap-3 mt-2">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-1 border border-red-500/30">
                        <HiOutlineExclamation className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="bg-surface-900/50 backdrop-blur-sm border border-red-500/20 px-5 py-3 rounded-2xl rounded-tl-none">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-500/70 mb-1">Execution Failed</p>
                        <p className="text-sm font-medium text-red-300">{entry.text}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              {processing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 mt-2">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0 mt-1 animate-pulse">
                    <HiOutlineSparkles className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-brand-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-brand-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-brand-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-surface-900/50 shrink-0">
          <div className="relative flex items-center">
            <input
              id="ai-command-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Command JAY Assistant..."
              className="neo-input pr-16 text-lg py-4 shadow-glass"
              disabled={processing}
            />
            <button
              id="ai-submit-btn"
              type="submit"
              disabled={processing || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-brand-500 text-surface-950 flex items-center justify-center transition-all duration-300 hover:bg-brand-400 hover:shadow-glow-brand disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <HiOutlinePaperAirplane className="w-5 h-5 rotate-90 translate-x-[2px] translate-y-[1px]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
