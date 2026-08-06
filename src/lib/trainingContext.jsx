import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const TrainingContext = createContext(null);
const DEFAULT_PRESETS = [30, 45, 60, 90, 120, 180, 300];

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}

export function TrainingProvider({ children }) {
  const [isActive, setIsActive] = useState(() => {
    try { return JSON.parse(localStorage.getItem("beltva_trainingActive") || "false"); } catch { return false; }
  });
  const [exercises, setExercises] = useState(() => {
    try { return JSON.parse(localStorage.getItem("beltva_trainingExercises") || "[]"); } catch { return []; }
  });
  const [elapsedSec, setElapsedSec] = useState(0);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [defaultRest, setDefaultRest] = useState(() => Number(localStorage.getItem("beltva_defaultRest")) || 90);
  const [customPresets, setCustomPresets] = useState(() => JSON.parse(localStorage.getItem("beltva_restPresets") || "[]"));
  const [isSimple, setIsSimple] = useState(() => {
    try { return JSON.parse(localStorage.getItem("beltva_trainingSimple") || "false"); } catch { return false; }
  });
  const startRef = useRef(null);

  // Persist state to localStorage
  useEffect(() => { localStorage.setItem("beltva_trainingActive", JSON.stringify(isActive)); }, [isActive]);
  useEffect(() => { localStorage.setItem("beltva_trainingExercises", JSON.stringify(exercises)); }, [exercises]);
  useEffect(() => { localStorage.setItem("beltva_defaultRest", String(defaultRest)); }, [defaultRest]);
  useEffect(() => { localStorage.setItem("beltva_restPresets", JSON.stringify(customPresets)); }, [customPresets]);
  useEffect(() => { localStorage.setItem("beltva_trainingSimple", JSON.stringify(isSimple)); }, [isSimple]);

  // Elapsed timer — restores start time from localStorage on reload
  useEffect(() => {
    if (!isActive) return;
    if (!startRef.current) {
      const stored = localStorage.getItem("beltva_trainingStart");
      startRef.current = stored ? Number(stored) : Date.now();
    }
    localStorage.setItem("beltva_trainingStart", String(startRef.current));
    const update = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - startRef.current) / 1000)));
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [isActive]);

  // Rest timer
  useEffect(() => {
    if (!restRunning) return;
    const i = setInterval(() => {
      setRestRemaining(r => {
        if (r <= 1) {
          setRestRunning(false);
          playBeep();
          if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [restRunning]);

  const startTraining = useCallback((initial = [], simple = false) => {
    setExercises(initial);
    setIsSimple(simple);
    setElapsedSec(0);
    setRestRemaining(0);
    setRestRunning(false);
    startRef.current = Date.now();
    localStorage.setItem("beltva_trainingStart", String(startRef.current));
    setIsActive(true);
  }, []);

  const stopTraining = useCallback(() => {
    setIsActive(false);
    setIsSimple(false);
    setExercises([]);
    setElapsedSec(0);
    setRestRemaining(0);
    setRestRunning(false);
    startRef.current = null;
    localStorage.removeItem("beltva_trainingStart");
  }, []);

  const addExercise = useCallback((type, prevRecord = null) => {
    setExercises(prev => [...prev, { workout_type: type, sets: [{ weight: prevRecord?.weight || 0, reps: prevRecord?.reps || 0 }] }]);
  }, []);

  const updateSet = useCallback((ei, si, field, val) => {
    setExercises(p => p.map((ex, i) => i === ei ? { ...ex, sets: ex.sets.map((s, j) => j === si ? { ...s, [field]: Number(val) || 0 } : s) } : ex));
  }, []);

  const copyPrevToExercise = useCallback((ei, weight, reps) => {
    setExercises(p => p.map((ex, i) => i === ei ? { ...ex, sets: ex.sets.map(s => ({ weight, reps })) } : ex));
  }, []);

  const addSet = useCallback((ei) => {
    setExercises(p => p.map((ex, i) => i === ei ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 0 }] } : ex));
  }, []);

  const removeSet = useCallback((ei, si) => {
    setExercises(p => p.map((ex, i) => i === ei ? { ...ex, sets: ex.sets.filter((_, j) => j !== si) } : ex));
  }, []);

  const removeExercise = useCallback((ei) => {
    setExercises(p => p.filter((_, i) => i !== ei));
  }, []);

  const startRest = useCallback((seconds) => { setRestRemaining(seconds); setRestRunning(true); }, []);
  const stopRest = useCallback(() => { setRestRunning(false); setRestRemaining(0); }, []);
  const pauseRest = useCallback(() => { setRestRunning(false); }, []);
  const completeSet = useCallback(() => { startRest(defaultRest); }, [defaultRest, startRest]);

  const addPreset = useCallback((sec) => {
    setCustomPresets(prev => [...new Set([...prev, sec])].sort((a, b) => a - b));
  }, []);
  const removePreset = useCallback((sec) => {
    setCustomPresets(prev => prev.filter(s => s !== sec));
  }, []);

  const presets = [...new Set([...DEFAULT_PRESETS, ...customPresets])].sort((a, b) => a - b);

  return (
    <TrainingContext.Provider value={{
      isActive, isSimple, exercises, elapsedSec, restRemaining, restRunning,
      defaultRest, setDefaultRest, customPresets, presets,
      startTraining, stopTraining, addExercise, updateSet, copyPrevToExercise,
      addSet, removeSet, removeExercise, startRest, stopRest, pauseRest, completeSet,
      addPreset, removePreset,
    }}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  return useContext(TrainingContext);
}