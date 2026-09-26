'use client';

import React from 'react';
import { Role } from '../types';
import { User, Activity, Shield, ArrowRight } from 'lucide-react';

interface RoleCardProps {
  role: Role;
  title: string;
  name: string;
  username: string;
  description: string;
  avatarUrl: string;
  onSelect: (username: string, role: Role) => void;
  isSelected?: boolean;
}

export default function RoleCard({
  role,
  title,
  name,
  username,
  description,
  avatarUrl,
  onSelect,
  isSelected = false
}: RoleCardProps) {
  const getRoleIcon = () => {
    switch (role) {
      case 'astronaut':
        return <User className="w-5 h-5 text-star-blue" />;
      case 'medical':
        return <Activity className="w-5 h-5 text-star-purple" />;
      case 'mission-control':
        return <Shield className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'astronaut':
        return 'border-star-blue/40 bg-blue-50/40 hover:border-star-blue shadow-blue-500/10';
      case 'medical':
        return 'border-purple-200 bg-purple-50/40 hover:border-star-purple shadow-purple-500/10';
      case 'mission-control':
        return 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-600 shadow-emerald-500/10';
    }
  };

  return (
    <div
      onClick={() => onSelect(username, role)}
      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer group bg-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${getRoleColor()} ${
        isSelected ? 'ring-2 ring-star-blue ring-offset-2 border-star-blue' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start gap-4">
        <img
          src={avatarUrl}
          alt={name}
          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-white shadow-xs border border-slate-100">{getRoleIcon()}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
          </div>
          <h3 className="text-base font-extrabold text-star-navy truncate">{name}</h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="font-mono text-slate-400 font-medium">Demo: <strong className="text-slate-700">{username}</strong></span>
        <span className="font-bold text-star-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Select Role <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
