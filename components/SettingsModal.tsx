
import React from 'react';
import { X, Settings, Upload, Download, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackup: () => void;
  onRestore: () => void;
  syncStatus: string;
  statusMessage: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onBackup, onRestore, syncStatus, statusMessage }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end modal-overlay" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white bottom-sheet w-full overflow-hidden flex flex-col shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full flex justify-center py-3">
          <div className="w-12 h-1.5 bg-stone-200 rounded-full" />
        </div>

        <div className="p-5 border-b border-stone-100 flex justify-between items-center">
          <h3 className="font-bold text-stone-800 flex items-center gap-2"><Settings size={18}/> 设置与备份</h3>
          <button onClick={onClose} className="p-2 bg-stone-100 rounded-full text-stone-400 transition-colors"><X size={18}/></button>
        </div>

        <div className="p-6 space-y-4 pb-12">
          <button onClick={onBackup} disabled={!!syncStatus} className="w-full p-5 bg-stone-50 active:bg-stone-100 rounded-2xl flex items-center justify-between transition-all group border border-stone-100">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white text-stone-600 shadow-sm"><Upload size={22} /></div>
              <div className="text-left">
                <div className="text-base font-bold text-stone-800">同步至云端</div>
                <div className="text-[11px] text-stone-500 mt-0.5">上传本地变更项</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-stone-300" />
          </button>

          <button onClick={onRestore} disabled={!!syncStatus} className="w-full p-5 bg-stone-50 active:bg-stone-100 rounded-2xl flex items-center justify-between transition-all group border border-stone-100">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white text-stone-600 shadow-sm"><Download size={22} /></div>
              <div className="text-left">
                <div className="text-base font-bold text-stone-800">从云端同步</div>
                <div className="text-[11px] text-stone-500 mt-0.5">覆盖并恢复本地数据</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-stone-300" />
          </button>

          {statusMessage && (
            <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-3 animate-fade-in ${syncStatus === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              {(syncStatus === 'uploading' || syncStatus === 'downloading') && <Loader2 size={14} className="animate-spin"/>}
              {statusMessage}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
