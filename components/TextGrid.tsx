
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { PromptItem } from '../types.ts';
import { CATEGORY_COLORS, GENERAL_SUB_CATS } from '../constants.tsx';

const TextGridItem: React.FC<{ item: PromptItem; onSelect: (item: PromptItem) => void }> = ({ item, onSelect }) => { 
  const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['general'] || CATEGORY_COLORS['txt2img']; 
  let subCatInfo = null;
  
  if (item.category === 'general') {
    subCatInfo = GENERAL_SUB_CATS.find(sc => {
      if (sc.id === 'all') return false;
      const hasNewLabel = item.tags && item.tags.includes(sc.label);
      const hasOldLabel = item.tags && (
        (sc.id === 'system' && item.tags.includes('系统指令')) ||
        (sc.id === 'visual' && item.tags.includes('视觉/绘图'))
      );
      return hasNewLabel || hasOldLabel;
    });
  }

  return ( 
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)} 
      style={{ '--theme-color-light': colors.light } as any}
      className="modern-card p-4 h-48 flex flex-col justify-between relative overflow-hidden group animate-fade-in"
    > 
      {item._dirty && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500 shadow-sm" />}
      
      {subCatInfo && (
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: subCatInfo.color }} />
      )}

      <div className="flex flex-col h-full"> 
        <div className="flex items-start justify-between mb-2 text-stone-800">
          <h3 className="text-[15px] font-bold line-clamp-1 flex-1">{item.title}</h3> 
          <MoreHorizontal size={14} className="text-stone-300" />
        </div>
        <p className="text-[12px] text-stone-500 line-clamp-5 leading-relaxed font-normal flex-grow">
          {item.prompt}
        </p> 
        
        {subCatInfo && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg w-fit bg-stone-50" style={{ color: subCatInfo.color }}>
            {subCatInfo.icon} {subCatInfo.label}
          </div>
        )}
      </div> 
    </motion.div> 
  ); 
};

const TextGrid: React.FC<{ items: PromptItem[]; onSelect: (item: PromptItem) => void }> = ({ items, onSelect }) => (
  <div className="grid grid-cols-2 gap-3 p-4">
    {items.map(i => <TextGridItem key={i.id} item={i} onSelect={onSelect} />)}
  </div>
);

export default TextGrid;
