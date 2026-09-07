
import React from 'react';
import { Feature } from '../types';
import { ArrowUpRight } from 'lucide-react';

interface FeatureCardProps {
  feature: Feature;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col bg-white rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 border border-stone-200/80 hover:border-orange-300 text-left overflow-hidden hover:-translate-y-1"
    >
      {/* Top row: Icon & Arrow Indicator */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className={`${feature.color} w-13 h-13 p-3.5 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-950/15 group-hover:scale-105 transition-transform duration-300`}>
          {feature.icon}
        </div>
        
        <div className="w-9 h-9 rounded-full bg-stone-50 border border-stone-200/70 flex items-center justify-center text-stone-400 group-hover:text-orange-600 group-hover:bg-orange-50 group-hover:border-orange-200 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
      
      {/* Content */}
      <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-orange-600 transition-colors mb-2">
        {feature.title}
      </h3>
      <p className="text-stone-500 text-sm leading-relaxed mb-6 font-normal">
        {feature.description}
      </p>
      
      {/* Bottom status link */}
      <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-400 group-hover:text-orange-600 transition-colors">
        <span>Buka Studio</span>
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
      </div>

      {/* Decorative Warm Ambient Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-amber-300/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
    </button>
  );
};

export default FeatureCard;

