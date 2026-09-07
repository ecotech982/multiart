
import React from 'react';
import { LayoutDashboard, X, ChevronRight, Key } from 'lucide-react';
import { AppView, Feature } from '../types';
import { FEATURES } from '../constants';
import MultiArtLogo from './MultiArtLogo';
import { getApiKeySource } from '../services/geminiService';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenApiKeyModal?: () => void;
}

interface NavItemProps {
  feature: Feature;
  isActive: boolean;
  onNavigate: (view: AppView) => void;
}

const NavItem: React.FC<NavItemProps> = ({ feature, isActive, onNavigate }) => (
  <button
    onClick={() => onNavigate(feature.id)}
    className={`group w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left relative ${
      isActive 
        ? 'bg-orange-50/90 text-orange-600 font-semibold shadow-sm shadow-orange-500/5' 
        : 'text-stone-500 hover:bg-stone-100/70 hover:text-stone-900 font-medium'
    }`}
  >
    {isActive && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-r-full" />
    )}
    <div className={`p-1.5 rounded-lg transition-transform duration-200 ${
      isActive ? 'bg-orange-100/70 text-orange-600 scale-105' : 'text-stone-400 group-hover:text-stone-700'
    }`}>
      {React.cloneElement(feature.icon as React.ReactElement, { className: 'w-4 h-4' })}
    </div>
    <span className="text-sm tracking-tight flex-1 truncate">{feature.title}</span>
    {isActive && <ChevronRight className="w-4 h-4 text-orange-400 shrink-0" />}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose, onOpenApiKeyModal }) => {
  const creationTools = FEATURES.filter(f => ['generate', 'logo', 'thumbnail', 'mascot'].includes(f.id));
  const editingTools = FEATURES.filter(f => ['resize', 'remove-object', 'watermark', 'graduation', 'age', 'collage'].includes(f.id));
  const keySource = getApiKeySource();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200/80 flex flex-col transition-transform duration-300 lg:translate-x-0
      ${isOpen ? 'translate-x-0 shadow-2xl shadow-stone-900/20' : '-translate-x-full shadow-none'}
    `}>
      {/* Sidebar Header with Non-AI MultiArt Studio Logo */}
      <div className="p-5 flex items-center justify-between border-b border-stone-100">
        <MultiArtLogo size="md" />
        <button 
          onClick={onClose}
          className="lg:hidden p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
          aria-label="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 py-5 overflow-y-auto space-y-6">
        {/* Home Link */}
        <div>
          <button
            onClick={() => onNavigate('home')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 text-left relative ${
              currentView === 'home' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-md shadow-orange-500/20' 
                : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 font-medium'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span className="text-sm tracking-tight flex-1">Studio Utama</span>
          </button>
        </div>

        {/* Creation Tools Section */}
        <div className="space-y-1.5">
          <div className="px-3 flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
              Kreasi & Desain
            </span>
            <span className="text-[9px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200/60">
              Studio
            </span>
          </div>
          <div className="space-y-0.5">
            {creationTools.map((feature) => (
              <NavItem 
                key={feature.id} 
                feature={feature} 
                isActive={currentView === feature.id} 
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        {/* Editing Tools Section */}
        <div className="space-y-1.5">
          <div className="px-3 flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">
              Pengeditan Foto
            </span>
            <span className="text-[9px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-full">
              Retouch
            </span>
          </div>
          <div className="space-y-0.5">
            {editingTools.map((feature) => (
              <NavItem 
                key={feature.id} 
                feature={feature} 
                isActive={currentView === feature.id} 
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <div className="bg-white rounded-xl p-3.5 border border-stone-200/70 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${keySource !== 'none' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
              <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                {keySource !== 'none' ? 'Google Gemini Aktif' : 'Gemini API Lokal'}
              </span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${keySource === 'local_storage' ? 'bg-orange-100 text-orange-700' : keySource === 'environment' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
              {keySource === 'local_storage' ? 'Lokal' : keySource === 'environment' ? 'Env' : 'Opsional'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed font-normal">
            {keySource !== 'none' 
              ? 'Terhubung dengan model Gemini untuk analisis visual dan kreasi gambar.' 
              : 'Gunakan kunci Gemini lokal Anda untuk hasil visual dan analisis prompt terbaik.'}
          </p>
          {onOpenApiKeyModal && (
            <button
              id="sidebar-manage-api-key-btn"
              onClick={onOpenApiKeyModal}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold text-stone-700 bg-stone-50 hover:bg-orange-50 hover:text-orange-600 border border-stone-200 hover:border-orange-200 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Key className="w-3.5 h-3.5 text-orange-500" />
              <span>Kelola API Key Lokal</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

