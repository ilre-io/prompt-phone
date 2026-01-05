
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { PromptItem } from '../types.ts';
import { CATEGORIES, GENERAL_SUB_CATS } from '../constants.tsx';
import MediaUploader from './MediaUploader.tsx';

interface PromptFormModalProps {
  isOpen: boolean;
  initialData: PromptItem | null;
  activeCategory: string;
  onClose: () => void;
  onSave: (item: PromptItem) => Promise<void>;
}

const PromptFormModal: React.FC<PromptFormModalProps> = ({ isOpen, initialData, activeCategory, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<PromptItem>>({ category: 'txt2img', tags: [] });
  const [isSaving, setIsSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const [selectedSubCat, setSelectedSubCat] = useState('all');

  useEffect(() => {
    if (isOpen) {
      const defaultCat = activeCategory || 'txt2img';
      
      setFormData({ 
        id: initialData?.id || Date.now().toString(), 
        category: initialData?.category || defaultCat, 
        tags: initialData?.tags || [], 
        outputMediaUrl: initialData?.outputMediaUrl || '', 
      });

      if (defaultCat === 'general') {
        setSelectedSubCat('system'); 
      }

      setTimeout(() => {
        if (titleRef.current) titleRef.current.value = initialData?.title || '';
        if (promptRef.current) promptRef.current.value = initialData?.prompt || '';
        const subLabels = GENERAL_SUB_CATS.map(s => s.label);
        const oldLabels = ['系统指令', '视觉/绘图'];
        const userTags = (initialData?.tags || []).filter(t => !subLabels.includes(t) && !oldLabels.includes(t));
        if (tagsRef.current) tagsRef.current.value = userTags.join(', ');
      }, 0);
      
      if (initialData && initialData.category === 'general') {
        const foundSub = GENERAL_SUB_CATS.find(sc => {
          const hasNew = initialData.tags.includes(sc.label);
          const hasOld = (sc.id === 'system' && initialData.tags.includes('系统指令')) || 
                        (sc.id === 'visual' && initialData.tags.includes('视觉/绘图'));
          return hasNew || hasOld;
        });
        if (foundSub) setSelectedSubCat(foundSub.id);
      }
    }
  }, [initialData, isOpen, activeCategory]);

  if (!isOpen) return null;
  
  const handleSubmit = async () => {
    const currentTitle = titleRef.current?.value || '';
    const currentPrompt = promptRef.current?.value || '';
    const currentTags = (tagsRef.current?.value || '').split(/[,，\s]+/).filter(Boolean);

    if (!currentTitle.trim() || !currentPrompt.trim()) return alert("标题和提示词不能为空");
    if (formData.category !== 'general' && !formData.outputMediaUrl) return alert("请上传参考图");

    setIsSaving(true);
    let finalData: PromptItem = { 
      id: formData.id!,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      ...formData, 
      title: currentTitle, 
      prompt: currentPrompt, 
      tags: currentTags 
    } as PromptItem;

    if (finalData.category === 'general') {
      const sub = GENERAL_SUB_CATS.find(s => s.id === selectedSubCat);
      if (sub && sub.id !== 'all') {
        const subLabels = GENERAL_SUB_CATS.map(s => s.label).filter(l => l !== '全部');
        const oldLabels = ['系统指令', '视觉/绘图'];
        finalData.tags = finalData.tags.filter(t => !subLabels.includes(t) && !oldLabels.includes(t));
        finalData.tags.push(sub.label);
      }
    }

    await onSave(finalData);
    setIsSaving(false);
    onClose();
  };

  const isMediaRequired = formData.category !== 'general';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-stone-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full h-[96dvh] bg-white bottom-sheet flex flex-col overflow-hidden"
      >
        <div className="flex-none p-4 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-20">
          <button onClick={onClose} className="p-2 -ml-2 text-stone-400 active:text-stone-800"><ChevronLeft size={24} /></button>
          <h2 className="text-lg font-bold text-stone-800">{initialData ? '编辑资料' : '新建资料'}</h2>
          <button onClick={handleSubmit} disabled={isSaving} className="text-stone-800 font-bold text-sm px-4 py-1.5 bg-stone-100 rounded-full active:scale-95 transition-transform">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : '完成'}
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5 space-y-5 pb-24">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">创作分类</label>
            <div className="flex overflow-x-auto no-scrollbar gap-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all border ${formData.category === cat.id ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">标题名称</label>
                <input type="text" ref={titleRef} placeholder="输入名称" className="w-full input-modern rounded-xl px-4 py-3 text-base text-stone-800 outline-none" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">自定义标签</label>
                <input type="text" ref={tagsRef} placeholder="逗号隔开" className="w-full input-modern rounded-xl px-4 py-3 text-sm text-stone-800 outline-none" />
             </div>
          </div>

          {isMediaRequired && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">图片/视频参考</label>
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-stone-50 border border-stone-200">
                <MediaUploader 
                  value={formData.outputMediaUrl || ''} 
                  onChange={val => setFormData({...formData, outputMediaUrl: val})} 
                  accept={formData.category?.includes('vid') ? 'both' : 'image'} 
                />
              </div>
            </div>
          )}

          {formData.category === 'general' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">快捷归类</label>
              <div className="flex flex-wrap gap-2">
                {GENERAL_SUB_CATS.filter(s => s.id !== 'all').map(sub => (
                  <button key={sub.id} onClick={() => setSelectedSubCat(sub.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${selectedSubCat === sub.id ? 'bg-stone-100 text-stone-800 border-stone-300' : 'bg-white text-stone-400 border-stone-100'}`}
                  >
                    <span style={{color: selectedSubCat === sub.id ? sub.color : 'inherit'}}>{sub.icon}</span> {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">核心提示词 (PROMPT)</label>
            <textarea 
              ref={promptRef} 
              rows={8} 
              className="w-full input-modern rounded-2xl px-4 py-4 text-stone-700 font-mono text-sm outline-none resize-none leading-relaxed border focus:border-stone-300" 
              placeholder="在此输入您的核心提示词..." 
            />
          </div>
        </div>

        <div className="flex-none p-4 bg-white/80 backdrop-blur-md border-t border-stone-100 sticky bottom-0">
           <button onClick={handleSubmit} disabled={isSaving} className="w-full py-4 rounded-2xl font-bold text-sm bg-stone-800 text-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 保存修改
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PromptFormModal;
