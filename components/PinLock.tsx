
import React, { useState, useEffect } from 'react';
import { Lock, Delete, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '../constants';

interface PinLockProps {
  onUnlock: () => void;
}

const PinLock: React.FC<PinLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === APP_CONFIG.pin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 400);
      }
    }
  }, [pin, onUnlock]);

  const handleInput = (num: number) => { 
    if (pin.length < 6) {
      // 触觉反馈模拟 (如果浏览器支持)
      if ('vibrate' in navigator) navigator.vibrate(10);
      setPin(prev => prev + num); 
    }
  };
  const handleDelete = () => { setPin(prev => prev.slice(0, -1)); };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fafaf9] px-8 py-12 select-none overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] rounded-full bg-stone-200/40 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[90vw] h-[90vw] rounded-full bg-stone-300/30 blur-[120px]" />
      
      <div className="relative flex flex-col items-center w-full max-w-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <div className="mb-6 w-16 h-16 rounded-2xl bg-white shadow-xl shadow-stone-200 flex items-center justify-center text-stone-800">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">输入密码</h2>
          <p className="text-stone-400 text-sm mt-2 font-medium">访问您的私人资料库</p>
        </motion.div>
        
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="flex gap-5 mb-16 h-4"
        >
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${i < pin.length ? 'bg-stone-800 scale-125' : 'bg-stone-200'} ${error ? 'bg-red-400' : ''}`} 
            />
          ))}
        </motion.div>
        
        <div className="grid grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} onClick={() => handleInput(num)} 
              className="aspect-square rounded-full bg-white active:bg-stone-100 shadow-sm flex items-center justify-center text-2xl font-bold text-stone-700 transition-all active:scale-90 border border-stone-50"
            >
              {num}
            </button>
          ))}
          <div className="flex items-center justify-center text-stone-200"><Fingerprint size={24}/></div>
          <button onClick={() => handleInput(0)} className="aspect-square rounded-full bg-white active:bg-stone-100 shadow-sm flex items-center justify-center text-2xl font-bold text-stone-700 transition-all active:scale-90 border border-stone-50">0</button>
          <button onClick={handleDelete} className="aspect-square flex items-center justify-center text-stone-400 active:text-stone-800 transition-colors">
            <Delete size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinLock;
