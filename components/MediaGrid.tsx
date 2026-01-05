
import React from 'react';
import { motion } from 'framer-motion';
import { PromptItem } from '../types';
import { CATEGORY_COLORS } from '../constants';

const MediaGridItem: React.FC<{ item: PromptItem; onSelect: (item: PromptItem) => void }> = ({ item, onSelect }) => { 
  const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['general'];
  const isRealVideo = item.isVideo || (item.outputMediaUrl && (item.outputMediaUrl.startsWith('data:video') || item.outputMediaUrl.match(/\.(mp4|webm|ogg|mov|mkv)$/i)));
  const firstTag = item.tags && item.tags.length > 0 ? item.tags[0] : null;

  return ( 
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)} 
      style={{ '--theme-color-light': colors.light } as any}
      className="modern-card relative aspect-[3/4.2] overflow-hidden group animate-fade-in border-0 shadow-sm"
    > 
      {item._dirty && <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-500 z-10 shadow-sm" />}
      <div className="w-full h-full bg-stone-100">
        {isRealVideo ? (
          <div className="relative w-full h-full">
             <video 
              src={item.outputMediaUrl} 
              className="w-full h-full object-cover" 
              muted 
              loop 
              playsInline
            /> 
            <div className="absolute top-2 left-2 bg-black/30 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] text-white font-bold uppercase tracking-widest">Video</div>
          </div>
        ) : (
          <img src={item.outputMediaUrl} className="w-full h-full object-cover" loading="lazy" alt={item.title} /> 
        )}
      </div>
      
      <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/50 to-transparent"> 
        <div className="bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-white/20 shadow-lg">
          <h3 className="text-stone-900 font-bold text-[10px] truncate">{item.title}</h3> 
          {firstTag && <span className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter">#{firstTag}</span>}
        </div>
      </div> 
    </motion.div> 
  ); 
};

const MediaGrid: React.FC<{ items: PromptItem[]; onSelect: (item: PromptItem) => void }> = ({ items, onSelect }) => (
  <div className="grid grid-cols-2 gap-3 p-4">
    {items.map(i => <MediaGridItem key={i.id} item={i} onSelect={onSelect} />)}
  </div>
);

export default MediaGrid;
