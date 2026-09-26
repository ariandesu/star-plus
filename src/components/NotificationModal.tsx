'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Bell, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { AlertItem } from '../types';
import { alertService } from '../services/alertService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    setAlerts(alertService.getAlerts());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAcknowledge = (id: string) => {
    const updated = alertService.acknowledgeAlert(id, 'Flight Medical Officer');
    setAlerts(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-star-navy/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-star-navy via-slate-900 to-star-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-star-soft" />
            <h3 className="font-extrabold text-sm tracking-tight">Mission Health Alerts</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-star-soft text-star-blue">
              {alerts.filter(a => a.status === 'ACTIVE').length} Active
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications Body */}
        <div className="p-4 overflow-y-auto space-y-3">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-2xl border transition-all ${
                alt.status === 'ACTIVE'
                  ? alt.severity === 'WARNING'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : 'bg-red-50/70 border-red-300 text-red-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  alt.severity === 'WARNING' ? 'bg-amber-200 text-amber-900' : 'bg-red-200 text-red-900'
                }`}>
                  {alt.severity}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{alt.timestamp}</span>
              </div>

              <h4 className="font-bold text-xs text-star-navy mb-1">{alt.title}</h4>
              <p className="text-[11px] leading-relaxed text-slate-600 mb-3">{alt.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                {alt.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handleAcknowledge(alt.id)}
                    className="px-3 py-1 rounded-lg bg-star-navy hover:bg-slate-800 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>Ack'd by {alt.acknowledgedBy || 'Medical Control'}</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    router.push('/medical');
                    onClose();
                  }}
                  className="text-[11px] font-bold text-star-blue hover:underline flex items-center gap-1"
                >
                  <span>Investigate Signal</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
