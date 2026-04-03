import { useState, useEffect } from 'react';
import { useFocusStore } from '../../store/focusStore';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { HiOutlinePlay, HiOutlinePause, HiOutlineStop, HiOutlineClock } from 'react-icons/hi';

const PRESETS = [
  { label: 'Pomodoro', minutes: 25 },
  { label: 'Short Break', minutes: 5 },
  { label: 'Long Focus', minutes: 50 },
];

export default function FocusMode() {
  const { sessions, fetchSessions, saveSession } = useFocusStore();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(25 * 60);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    // Beautiful Confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2dd4bf', '#8b5cf6', '#3b82f6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2dd4bf', '#8b5cf6', '#3b82f6']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    const durationMinutes = Math.round(totalTime / 60);
    await saveSession(durationMinutes);
  };

  const setPreset = (minutes) => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
    setTotalTime(minutes * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Timer Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex-1 glass-panel p-12 flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
        
        {/* Presets */}
        <div className="flex gap-3 mb-12 z-10">
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => setPreset(preset.minutes)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${totalTime === preset.minutes * 60 ? 'bg-brand-500 text-surface-950 shadow-glow-brand' : 'bg-surface-800/50 text-surface-300 hover:bg-surface-700/50 hover:text-white border border-white/5'}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Circular Timer */}
        <div className="relative flex items-center justify-center mb-12 group z-10">
          <svg className="w-[320px] h-[320px] -rotate-90 transform">
            {/* Background Ring */}
            <circle
              cx="160" cy="160" r="120"
              className="stroke-surface-800" strokeWidth="12" fill="none"
            />
            {/* Progress Ring */}
            <motion.circle
              cx="160" cy="160" r="120"
              className="stroke-brand-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]"
              strokeWidth="12" fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-7xl font-display font-bold text-white tracking-tighter drop-shadow-lg">
              {formatTime(timeLeft)}
            </span>
            <span className="text-surface-400 font-medium uppercase tracking-widest mt-2">{isActive ? 'Focusing...' : 'Paused'}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 z-10">
          <button 
            onClick={toggleTimer} 
            className="w-16 h-16 rounded-full bg-white text-surface-950 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            {isActive ? <HiOutlinePause className="w-8 h-8 fill-current" /> : <HiOutlinePlay className="w-8 h-8 fill-current translate-x-0.5" />}
          </button>
          <button 
            onClick={stopTimer}
            className="w-16 h-16 rounded-full bg-surface-800 text-surface-300 flex items-center justify-center border border-white/10 hover:text-white hover:bg-surface-700 hover:scale-105 active:scale-95 transition-all"
          >
            <HiOutlineStop className="w-8 h-8" />
          </button>
        </div>
      </motion.div>

      {/* History Sidebar */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-80 glass-panel flex flex-col max-h-[600px]"
      >
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <HiOutlineClock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white">History</h3>
            <p className="text-xs text-surface-400">Past sessions</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sessions.length === 0 && (
            <p className="text-center text-surface-500 text-sm mt-8">No completed sessions.</p>
          )}
          <AnimatePresence>
            {sessions.map(session => (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-surface-800/30 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <p className="text-lg font-display font-bold text-brand-300">{session.duration} min</p>
                  <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold">Focus Session</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-surface-300">{new Date(session.completed_at).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
