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
      // Step 1: Parse command
      const parsed = await parseAICommand(trimmed);
      setHistory((h) => [...h, { type: 'parsed', data: parsed }]);

      // Step 2: Execute action
      const result = await executeAIAction(parsed);
      setHistory((h) => [...h, { type: 'result', data: result }]);

      // Step 3: Refresh stores
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Command Interface</h2>
        <p className="text-surface-500 mt-1 text-sm">Use natural language to manage your productivity</p>
      </div>

      {/* Example commands */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <HiOutlineLightBulb className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Try these commands</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleExample(cmd)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-surface-400
                hover:bg-white/[0.08] hover:text-white transition-all duration-200"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="glass-card p-4 min-h-[300px] max-h-[500px] overflow-y-auto space-y-3">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
              <HiOutlineTerminal className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Ready for commands</h3>
            <p className="text-surface-500 text-sm max-w-sm">
              Type a natural language command below or click one of the examples above
            </p>
          </div>
        ) : (
          history.map((entry, i) => (
            <div key={i} className="animate-slide-up">
              {entry.type === 'user' && (
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-brand-400">You</span>
                  </div>
                  <p className="text-sm text-white font-medium pt-1">{entry.text}</p>
                </div>
              )}
              {entry.type === 'parsed' && (
                <div className="flex gap-3 items-start ml-10">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineSparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-surface-500 mb-1">Parsed Action</p>
                    <pre className="text-xs font-mono bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-surface-300 overflow-x-auto">
                      {JSON.stringify(entry.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              {entry.type === 'result' && (
                <div className="flex gap-3 items-start ml-10">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-emerald-400 mb-1 font-medium">✓ Action Executed</p>
                    <pre className="text-xs font-mono bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-surface-300 overflow-x-auto">
                      {JSON.stringify(entry.data.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              {entry.type === 'error' && (
                <div className="flex gap-3 items-start ml-10">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HiOutlineExclamation className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-red-400 mb-1 font-medium">Error</p>
                    <p className="text-sm text-red-300">{entry.text}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {processing && (
          <div className="flex gap-3 items-center ml-10 animate-pulse-soft">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center">
              <HiOutlineSparkles className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <p className="text-sm text-surface-500">Processing...</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          id="ai-command-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command... e.g. 'Create habit Morning Run'"
          className="input-field flex-1"
          disabled={processing}
        />
        <button
          id="ai-submit-btn"
          type="submit"
          disabled={processing || !input.trim()}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
          Send
        </button>
      </form>
    </div>
  );
}
