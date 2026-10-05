'use client';

import React, { useState, useEffect } from 'react';
import { UserSession } from '@/types';
import { authService } from '@/services/authService';
import { X, Settings, User, Key, Sun, Moon, Check, Shield, Server, Zap, Activity } from 'lucide-react';
import { nasaMlService } from '@/services/nasaMlService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession | null;
  onSessionUpdate?: (updatedSession: UserSession) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  session,
  onSessionUpdate
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState<number>(34);
  const [gender, setGender] = useState<string>('Female');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // NASA ML Server state
  const [mlUrl, setMlUrl] = useState<string>('https://star-plus.shareflow.workers.dev/api/ml');
  const [mlStatus, setMlStatus] = useState<string>('Unchecked');
  const [mlModels, setMlModels] = useState<string[]>([]);
  const [mlLatency, setMlLatency] = useState<number | null>(null);
  const [isTestingMl, setIsTestingMl] = useState<boolean>(false);

  useEffect(() => {
    if (session) {
      setUsername(session.username || 'astronaut01');
      setPassword(session.password || '');
      setAge(session.age ?? 34);
      setGender(session.gender || 'Female');
      
      const currentTheme = session.theme || (typeof window !== 'undefined' && localStorage.getItem('star_plus_theme') === 'dark' ? 'dark' : 'dark');
      setTheme(currentTheme);
    } else {
      const storedTheme = typeof window !== 'undefined' && localStorage.getItem('star_plus_theme') === 'light' ? 'light' : 'dark';
      setTheme(storedTheme);
    }

    // Load NASA ML URL
    const currentMlUrl = nasaMlService.getApiUrl();
    setMlUrl(currentMlUrl);
  }, [session, isOpen]);

  const handleTestMlConnection = async () => {
    setIsTestingMl(true);
    setMlStatus('Testing...');
    try {
      nasaMlService.setApiUrl(mlUrl.trim());
      const health = await nasaMlService.checkServerHealth();
      if (health.status === 'healthy') {
        setMlStatus('ONLINE (Healthy)');
      } else {
        setMlStatus('EDGE FALLBACK (Server Unreachable)');
      }
      setMlModels(health.modelsLoaded || []);
      setMlLatency(health.latencyMs || null);
    } catch (err) {
      setMlStatus('FAILED (Using Edge Engine)');
    } finally {
      setIsTestingMl(false);
    }
  };

  // Apply theme change whenever theme state updates
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('star_plus_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password && confirmPassword && password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    // Save NASA ML Server URL
    nasaMlService.setApiUrl(mlUrl.trim());

    const updates: Partial<UserSession> = {
      username: username.trim() || session?.username || 'astronaut01',
      age: Number(age),
      gender,
      theme
    };

    if (password) {
      updates.password = password;
    }

    const updated = authService.updateSession(updates);
    
    handleThemeChange(theme);

    if (updated && onSessionUpdate) {
      onSessionUpdate(updated);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Account & System Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage credentials, demographics, and theme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Settings updated successfully! Syncing system preferences...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Section 1: User ID & Credentials */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Account Credentials</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  User ID (Username)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. astronaut01"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {password && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            )}
          </div>

          {/* Section 2: Demographics */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-500" />
              <span>Demographic Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={18}
                  max={80}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Interface Theme */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Interface Theme</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Section 4: NASA ML Model Inference Server */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-500" />
              <span>NASA ML Model Inference Server</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ML Server Endpoint URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={mlUrl}
                  onChange={(e) => setMlUrl(e.target.value)}
                  placeholder="https://star-plus.shareflow.workers.dev/api/ml"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  type="button"
                  onClick={handleTestMlConnection}
                  disabled={isTestingMl}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTestingMl ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {/* Connection Status & Details */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                <span className={`font-semibold ${mlStatus.includes('ONLINE') ? 'text-emerald-500' : mlStatus.includes('EDGE') || mlStatus.includes('FAILED') ? 'text-amber-500' : 'text-slate-400'}`}>
                  {mlStatus}
                </span>
              </div>

              {mlLatency !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Latency:</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{mlLatency} ms</span>
                </div>
              )}

              {mlModels.length > 0 && (
                <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Loaded Models:</span>
                  <div className="flex flex-wrap gap-1">
                    {mlModels.map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
