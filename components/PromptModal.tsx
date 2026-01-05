
import React, { useState } from 'react';
import { X, Edit, Trash2, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PromptItem } from '../types.ts';

interface PromptModalProps {
  item: PromptItem | null;
  onClose: () => void;
  onEdit: (item: PromptItem) => void;
  onDelete: (id: string) => void;
}

const PromptModal: React.FC<PromptModalProps> = ({ item, onClose, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!item) return null;
  const isVideoContent = item.isVideo || (item.outputMediaUrl && (item.outputMediaUrl.startsWith('data:video') || item.outputMediaUrl.match(/\.(mp4|webm|ogg|mov|mkv)$/i)));

  const handleCopy = async (text: string) => {
    try { 
      await navigator.clipboard.writeText(text); 
      setCopied(true); 
      setTimeout(() => setCopied(false), 2000); 
    } catch (err) {}
  };

  const hasMedia = !!item.outputMediaUrl;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end modal-overlay" onClick={onClose}>
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full bg-white bottom-sheet overflow-hidden flex flex-col max-h-[94vh] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full flex justify-center py-2 flex-none">
            <div className="w-10 h-1 bg-stone-200 rounded-full" />
          </div>

          <button onClick={onClose} className="absolute top-3 right-4 z-20 p-2 rounded-full bg-stone-100 text-stone-500 active:scale-90 transition-all"><X size={18} /></button>

          <div className="overflow-y-auto flex flex-col">
            <div className="px-6 py-2 border-b border-stone-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-stone-800 truncate pr-8">{item.title}</h2>
                <button onClick={() => onEdit(item)} className="p-2 text-stone-400 active:bg-stone-100 rounded-full transition-colors"><Edit size={18} /></button>
            </div>

            {hasMedia && (
              <div className="w-full bg-black flex items-center justify-center border-b border-stone-100">
                <div className="w-full aspect-video">
                  {isVideoContent ? (
                    <video 
                      src={item.outputMediaUrl} 
                      className="w-full h-full object-contain" 
                      controls 
                      autoPlay 
                      muted 
                    />
                  ) : (
                    <img src={item.outputMediaUrl} className="w-full h-full object-contain" alt={item.title} />
                  )}
                </div>
              </div>
            )}

            <div className="p-5 pb-24">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">提示词内容</h3>
                    <button 
                      onClick={() => handleCopy(item.prompt)} 
                      className={`flex items-center gap-1.5 text-xs font-bold transition-all px-4 py-2 rounded-full shadow-md ${copied ? 'bg-emerald-500 text-white' : 'bg-stone-800 text-white active:scale-95'}`}
                    >
                      {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? '已复制' : '复制全文'}
                    </button>
                  </div>
                  <div 
                    onClick={() => handleCopy(item.prompt)}
                    className="p-5 rounded-2xl bg-stone-50 border border-stone-100 text-stone-700 font-mono text-sm leading-relaxed whitespace-pre-wrap active:bg-stone-100 transition-colors cursor-pointer"
                  >
                    {item.prompt}
                  </div>
                </div>

                {item.negativePrompt && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">反向提示词</h3>
                    <div className="p-4 rounded-xl bg-red-50/20 border border-red-100/50 text-stone-400 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {item.negativePrompt}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {(item.tags || []).map(tag => (
                    <span key={tag} className="px-2.5 py-1 text-[10px] font-bold text-stone-500 bg-stone-100 rounded-lg">#{tag}</span>
                  ))}
                </div>

                <div className="pt-4 border-t border-stone-100 flex justify-end">
                   <button 
                    onClick={() => { 
                      if (isDeleting) { 
                        onDelete(item.id); 
                        onClose(); 
                      } else { 
                        setIsDeleting(true); 
                        setTimeout(() => setIsDeleting(false), 3000); 
                      } 
                    }} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDeleting ? 'bg-red-500 text-white shadow-lg' : 'text-stone-300'}`}
                  >
                    <Trash2 size={14} /> {isDeleting ? '确定删除？' : '删除'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PromptModal;
