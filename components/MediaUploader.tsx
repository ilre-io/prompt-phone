
import React, { useState, useEffect, useRef } from 'react';
import { Upload as IconUpload, Trash2 } from 'lucide-react';
import { formatBytes, compressImage } from '../utils';

interface MediaUploaderProps {
  value: string;
  onChange: (val: string) => void;
  accept: 'image' | 'both';
  className?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ value, onChange, accept, className }) => {
  const [currentSize, setCurrentSize] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (value && value.startsWith('data:')) {
      setCurrentSize(formatBytes(Math.round((value.length * 3) / 4)));
    } else setCurrentSize('');
  }, [value]);

  const processFile = async (file: File) => {
    if (file.type.startsWith('image/')) {
      try { 
        const url = await compressImage(file); 
        onChange(url); 
      } catch (e) { alert("压缩失败"); }
    } else if (file.type.startsWith('video/')) {
      if (file.size > 10 * 1024 * 1024) return alert("视频需小于10MB");
      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (value) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-stone-50 group overflow-hidden rounded-2xl border border-stone-200 ${className}`}>
        {value.match(/data:video|mp4|webm|mov/) ? <video src={value} className="max-w-full max-h-full object-contain" controls /> : <img src={value} className="max-w-full max-h-full object-contain" alt="Preview" />}
        <button onClick={() => onChange('')} className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-sm border border-red-100 z-10"><Trash2 size={14} /></button>
        {currentSize && <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-white/90 backdrop-blur text-[8px] text-stone-500 font-bold rounded shadow-sm border border-stone-100">{currentSize}</div>}
      </div>
    );
  }

  return (
    <div onClick={() => fileInputRef.current?.click()} className={`w-full h-full min-h-[120px] flex flex-col items-center justify-center border-2 border-dashed border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer rounded-2xl group ${className}`}>
      <input type="file" ref={fileInputRef} className="hidden" accept={accept === 'image' ? "image/*" : "image/*,video/*"} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
      <div className="p-2 rounded-full bg-stone-100 text-stone-400 mb-2 group-hover:scale-110 transition-transform"><IconUpload size={18} /></div>
      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">上传媒体</p>
      <div onClick={e => e.stopPropagation()} className="mt-2 w-32 relative">
           <input 
             type="text" 
             onChange={(e) => onChange(e.target.value)} 
             placeholder="或粘贴 URL"
             className="w-full px-2 py-1 text-[10px] text-stone-600 border border-stone-200 rounded-lg outline-none focus:border-stone-400 transition-colors"
           />
      </div>
    </div>
  );
};

// Fix: Added missing default export for MediaUploader component
export default MediaUploader;
