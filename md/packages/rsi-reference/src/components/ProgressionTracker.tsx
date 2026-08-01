/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, CheckCircle, Bell, Plus, Trash2, Clock, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { TimerInterval, TrackerEvent } from '../types';

interface ProgressionTrackerProps {
  weight: number;
}

export default function ProgressionTracker({ weight }: ProgressionTrackerProps) {
  // Sounder mute status
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Procedure stopwatch state
  const [procedureSeconds, setProcedureSeconds] = useState<number>(0);
  const [isStopwatchActive, setIsStopwatchActive] = useState<boolean>(false);

  // Interval timers state
  const [timers, setTimers] = useState<TimerInterval[]>([
    { id: 'cpr-loop', label: 'CPR Cycle / Pulse Check', durationSeconds: 120, elapsedSeconds: 0, isActive: false, type: 'cpr', color: 'border-red-500 text-red-400' },
    { id: 'roc-duration', label: 'Rocuronium Paralysis', durationSeconds: 2400, elapsedSeconds: 0, isActive: false, type: 'medication', color: 'border-purple-500 text-purple-400' },
    { id: 'succ-duration', label: 'Succinylcholine Paralysis', durationSeconds: 480, elapsedSeconds: 0, isActive: false, type: 'medication', color: 'border-yellow-500 text-yellow-400' }
  ]);

  // Checklist events state
  const [events, setEvents] = useState<TrackerEvent[]>([
    { id: '1', time: '00:00', title: 'Prep / Equipment Check', description: 'Cuffed ETT, suction active, backup LMA, working laryngoscope lights.', category: 'prep', completed: false },
    { id: '2', time: '00:00', title: 'Pre-Oxygenation Commenced', description: 'Optimal high-flow nasal oxygen/BVM fit to establish oxygen reservoir.', category: 'prep', completed: false },
    { id: '3', time: '00:00', title: 'Adjunct / Atropine IV', description: 'Prevent bradycardia (especially infants <1yr or with Succinylcholine).', category: 'prep', completed: false },
    { id: '4', time: '00:00', title: 'Induction Agent Pushed', description: 'Pushed Ketamine/Etomidate/Propofol over 60 seconds (never rapid push).', category: 'induction', completed: false },
    { id: '5', time: '00:00', title: 'Paralytic Pushed', description: 'Pushed Succinylcholine or Rocuronium; start paralysis tracking timer.', category: 'paralysis', completed: false },
    { id: '6', time: '00:00', title: 'ETCO2 placement confirmed', description: 'Continuous capnography waveform confirmed (PALS gold standard).', category: 'post-intubation', completed: false },
    { id: '7', time: '00:00', title: 'Sedation Infusion Started', description: 'Continuous Dexmedetomidine or Fentanyl started (never paralyze without sedation).', category: 'post-intubation', completed: false },
    { id: '8', time: '00:00', title: 'NG Tube Decompression', description: 'Gastric tube passed to release gastric air and optimize ventilation mechanics.', category: 'transport', completed: false }
  ]);

  // Audit Logs
  const [logs, setLogs] = useState<string[]>([]);

  // Web Audio Context for Beeping Alarm (Safe within iframe sandbox)
  const playBeepSound = (type: 'beep' | 'alarm') => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'beep') {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // high tone
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        // Double pulse alarm for alert
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn('Audio Context blocked by browser or iframe constraints:', e);
    }
  };

  // 1. Procedure Stopwatch logic
  useEffect(() => {
    let timerId: any = null;
    if (isStopwatchActive) {
      timerId = setInterval(() => {
        setProcedureSeconds((p) => p + 1);
      }, 1000);
    } else {
      clearInterval(timerId);
    }
    return () => clearInterval(timerId);
  }, [isStopwatchActive]);

  // Format time (MM:SS)
  const formatTime = (secs: number) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    const ss = (secs % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // 2. Progression Interval Timers logic
  useEffect(() => {
    let intervalId: any = null;
    const activeTimersExist = timers.some((t) => t.isActive);

    if (activeTimersExist) {
      intervalId = setInterval(() => {
        setTimers((prev) =>
          prev.map((t) => {
            if (!t.isActive) return t;
            const nextElapsed = t.elapsedSeconds + 1;
            
            // Check if timer has completed / fired
            if (nextElapsed >= t.durationSeconds) {
              playBeepSound('alarm');
              // Log the alarm
              addLog(`🚨 ALARM: "${t.label}" timer completed!`);
              return { ...t, elapsedSeconds: 0, isActive: t.type === 'cpr' }; // auto-restart CPR loop
            }
            return { ...t, elapsedSeconds: nextElapsed };
          })
        );
      }, 1000);
    } else {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [timers, isMuted]);

  const addLog = (text: string) => {
    const timestamp = formatTime(procedureSeconds);
    setLogs((prev) => [`[${timestamp}] ${text}`, ...prev]);
  };

  const toggleEvent = (id: string) => {
    const updatedEvents = events.map((ev) => {
      if (ev.id !== id) return ev;
      const isCompleted = !ev.completed;
      const timeStr = formatTime(procedureSeconds);
      
      if (isCompleted) {
        addLog(`Completed: ${ev.title}`);
        // If they checked "Paralytic pushed", auto start appropriate duration timer
        if (id === '5') {
          // Check if rocuronium or succinylcholine duration is active
          // Auto start paralysis timers depending on active checklist context
          addLog('👉 Suggest starting Paralytic countdown duration timer below.');
        }
      } else {
        addLog(`Unchecked: ${ev.title}`);
      }
      return { ...ev, completed: isCompleted, time: isCompleted ? timeStr : '00:00' };
    });
    setEvents(updatedEvents);
  };

  const toggleTimerActive = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const willBeActive = !t.isActive;
        addLog(`${willBeActive ? 'Started' : 'Stopped'} timer: ${t.label}`);
        playBeepSound('beep');
        return { ...t, isActive: willBeActive };
      })
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        addLog(`Reset timer: ${t.label}`);
        return { ...t, elapsedSeconds: 0, isActive: false };
      })
    );
  };

  const resetAllProgress = () => {
    if (window.confirm('Reset the entire intubation timeline, checklist, and timers?')) {
      setProcedureSeconds(0);
      setIsStopwatchActive(false);
      setTimers((prev) => prev.map((t) => ({ ...t, elapsedSeconds: 0, isActive: false })));
      setEvents((prev) => prev.map((e) => ({ ...e, completed: false, time: '00:00' })));
      setLogs([]);
      playBeepSound('beep');
    }
  };

  // Add custom countdown interval
  const addCustomTimer = (label: string, minutes: number) => {
    if (!label || isNaN(minutes) || minutes <= 0) return;
    const newId = `custom-${Date.now()}`;
    const newTimer: TimerInterval = {
      id: newId,
      label,
      durationSeconds: minutes * 60,
      elapsedSeconds: 0,
      isActive: true,
      type: 'custom',
      color: 'border-blue-500 text-blue-400'
    };
    setTimers((prev) => [...prev, newTimer]);
    addLog(`Created Custom Alarm: "${label}" for ${minutes} min`);
    playBeepSound('beep');
  };

  return (
    <div id="progression-tracker" className="space-y-6">
      {/* stopwatch control and notification sound panel */}
      <div className="bg-white border-4 border-slate-900 rounded-xl p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] text-slate-900">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Timer className="h-6 w-6 text-purple-600" />
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-black font-display">RSI Procedure Stopwatch</span>
              <div className="font-mono text-3xl md:text-4xl font-black text-purple-700 tracking-tight leading-none mt-1">
                {formatTime(procedureSeconds)}
              </div>
            </div>
          </div>

          {/* stopwatch controllers */}
          <div className="flex items-center gap-2">
            <button
              id="stopwatch-play-pause"
              onClick={() => {
                setIsStopwatchActive(!isStopwatchActive);
                playBeepSound('beep');
              }}
              className={`px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 border-2 ${
                isStopwatchActive
                  ? 'bg-amber-100 border-amber-600 text-amber-900 shadow-[2px_2px_0px_0px_rgba(217,119,6,1)] active:translate-y-0.5'
                  : 'bg-purple-100 border-purple-600 text-purple-900 shadow-[2px_2px_0px_0px_rgba(147,51,234,1)] active:translate-y-0.5'
              }`}
            >
              {isStopwatchActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isStopwatchActive ? 'Pause Clock' : 'Start Airway Clock'}
            </button>

            <button
              id="stopwatch-reset"
              onClick={resetAllProgress}
              className="bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-800 p-2.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 transition-all"
              title="Reset Procedure"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              id="stopwatch-mute"
              onClick={() => setIsMuted(!isMuted)}
              className="bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-800 p-2.5 rounded-lg shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 transition-all"
              title={isMuted ? 'Unmute Alarms' : 'Mute Alarms'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-red-600" /> : <Volume2 className="h-4 w-4 text-emerald-600" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Airway Milestones Checklist */}
        <div className="lg:col-span-7 bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-900">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide font-display">RSI Phase Milestones</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Verify each phase</span>
          </div>

          <div className="space-y-2.5">
            {events.map((ev) => (
              <div
                key={ev.id}
                id={`milestone-${ev.id}`}
                onClick={() => toggleEvent(ev.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                  ev.completed
                    ? 'bg-slate-50 border-slate-300 text-slate-500 opacity-75 shadow-none'
                    : 'bg-white hover:bg-slate-50 border-slate-950 text-slate-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]'
                }`}
              >
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={ev.completed}
                    onChange={() => {}} // Handled by div onClick
                    className="rounded text-purple-600 focus:ring-purple-500 border-slate-900 bg-white h-4.5 w-4.5 cursor-pointer border-2"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${ev.completed ? 'line-through text-slate-400 font-bold' : 'text-slate-900'}`}>
                      {ev.title}
                    </span>
                    {ev.completed && (
                      <span className="font-mono text-[9px] text-purple-700 bg-purple-50 border-2 border-purple-300 px-2 py-0.5 rounded font-black">
                        Done @ {ev.time}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold leading-snug mt-0.5">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timers & Real-time Progression Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Interval Alarms */}
          <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-900">
            <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-2.5 mb-3 justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide font-display">Dosing Interval Alarms</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider font-mono">Real-time alerts</span>
            </div>

            {/* Timers list */}
            <div className="space-y-3">
              {timers.map((t) => {
                const remaining = t.durationSeconds - t.elapsedSeconds;
                const progress = (t.elapsedSeconds / t.durationSeconds) * 100;

                return (
                  <div
                    key={t.id}
                    id={`interval-timer-${t.id}`}
                    className={`p-3 rounded-lg bg-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-900 block">{t.label}</span>
                        <span className="text-[10px] text-slate-500 font-bold">Total duration: {formatTime(t.durationSeconds)}</span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-lg font-black text-purple-700 tracking-tight block">
                          {formatTime(remaining)}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-tight">Remaining</span>
                      </div>
                    </div>

                    {/* Progress line */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border-2 border-slate-900">
                      <div
                        className="bg-purple-600 h-full transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    {/* Timer control buttons */}
                    <div className="flex items-center justify-end gap-1.5 pt-0.5">
                      <button
                        id={`timer-toggle-${t.id}`}
                        onClick={() => toggleTimerActive(t.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-black uppercase transition-all flex items-center gap-1 border-2 ${
                          t.isActive
                            ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-[1px_1px_0px_0px_rgba(217,119,6,1)] active:translate-y-0.5'
                            : 'bg-purple-50 border-purple-600 text-purple-900 shadow-[1px_1px_0px_0px_rgba(147,51,234,1)] active:translate-y-0.5'
                        }`}
                      >
                        {t.isActive ? 'Pause' : 'Start'}
                      </button>

                      <button
                        id={`timer-reset-${t.id}`}
                        onClick={() => resetTimer(t.id)}
                        className="px-2.5 py-1 rounded text-[10px] bg-white border-2 border-slate-900 text-slate-700 font-black uppercase hover:bg-slate-50 transition-all shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5"
                      >
                        Reset
                      </button>

                      {t.type === 'custom' && (
                        <button
                          id={`timer-delete-${t.id}`}
                          onClick={() => {
                            setTimers((prev) => prev.filter((tm) => tm.id !== t.id));
                            addLog(`Deleted Alarm: "${t.label}"`);
                          }}
                          className="p-1 rounded text-red-600 border-2 border-transparent hover:border-red-600 hover:bg-red-50 transition-all"
                          title="Delete alarm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom alarm creator */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const label = (form.elements.namedItem('timerLabel') as HTMLInputElement).value;
                const minutes = parseFloat((form.elements.namedItem('timerMinutes') as HTMLInputElement).value);
                if (label && minutes > 0) {
                  addCustomTimer(label, minutes);
                  form.reset();
                }
              }}
              className="mt-4 pt-4 border-t-2 border-slate-100 grid grid-cols-12 gap-2"
            >
              <input
                name="timerLabel"
                type="text"
                placeholder="Alert Label (e.g. Sedation check)"
                required
                className="col-span-7 bg-white text-xs border-2 border-slate-900 rounded px-2.5 py-2 focus:outline-none focus:border-purple-600 text-slate-900 font-bold placeholder:text-slate-400"
              />
              <input
                name="timerMinutes"
                type="number"
                placeholder="Min"
                required
                min="0.1"
                step="0.1"
                className="col-span-3 bg-white text-xs border-2 border-slate-900 rounded px-2 py-2 text-center font-mono focus:outline-none focus:border-purple-600 text-slate-900 font-black"
              />
              <button
                id="btn-add-custom-timer"
                type="submit"
                className="col-span-2 bg-purple-600 hover:bg-purple-700 text-white font-black rounded flex items-center justify-center p-2 border-2 border-purple-800 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5"
                title="Add custom alarm"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Procedure Timeline Audit Logs */}
          <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-slate-900">
            <div className="flex items-center gap-1.5 border-b-2 border-slate-100 pb-2 mb-2 font-display uppercase">
              <Clock className="h-4 w-4 text-purple-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Timeline Audit Logs</h3>
            </div>

            <div className="bg-slate-50 rounded p-2.5 h-36 overflow-y-auto border-2 border-slate-200 font-mono text-[10px] space-y-1.5 text-slate-600 font-semibold shadow-inner">
              {logs.length === 0 ? (
                <span className="italic block text-slate-400">No events logged. Tap milestones or start timers to audit...</span>
              ) : (
                logs.map((lg, i) => {
                  const isAlarm = lg.includes('🚨');
                  return (
                    <div key={i} className={`leading-snug ${isAlarm ? 'text-red-700 font-black' : 'text-slate-700'}`}>
                      {lg}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
