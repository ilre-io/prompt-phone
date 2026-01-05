
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
      <div className="w-full max-w-sm bg-white shadow-xl border border-stone-100 rounded-3xl p-8 text-center transform transition-all scale-100">
        <div className="mb-4 mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500"><AlertCircle size={24}/></div>
        <h3 className="text-xl font-bold text-stone-800 mb-2">{title}</h3>
        <p className="text-sm text-stone-500 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 font-bold text-sm hover:bg-stone-200 transition-colors">取消</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 rounded-xl bg-stone-800 text-white font-bold text-sm hover:bg-stone-700 shadow-lg shadow-stone-200 transition-transform active:scale-95">确认</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
