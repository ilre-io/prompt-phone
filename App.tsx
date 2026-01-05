
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Loader2, Settings, Cloud, CloudOff
} from 'lucide-react';

import { PromptItem } from './types.ts';
import { CATEGORIES, GENERAL_SUB_CATS, CATEGORY_COLORS } from './constants.tsx';
import { localDB, cloudDB } from './services/db.ts';
import { formatBytes } from './utils.ts';

import TextGrid from './components/TextGrid.tsx';
import MediaGrid from './components/MediaGrid.tsx';
import PromptModal from './components/PromptModal.tsx';
import PromptFormModal from './components/PromptFormModal.tsx';
import SettingsModal from './components/SettingsModal.tsx';
import ConfirmModal from './components/ConfirmModal.tsx';

const App: React.FC = () => {
  const [items, setItems] = useState<PromptItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('txt2img');
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PromptItem | null>(null);
  const [storageUsage, setStorageUsage] = useState(0);
  const [syncStatus, setSyncStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; action: () => Promise<void> } | null>(null);
  
  const activeColor = CATEGORY_COLORS[activeCategory] || CATEGORY_COLORS['txt2img'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const storedItems = await localDB.getAll();
      storedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(storedItems);
      setStorageUsage(storedItems.reduce((acc, item) => acc + JSON.stringify(item).length, 0));
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = () => {
    setSyncStatus('uploading');
    setStatusMessage('同步中...');
    cloudDB.syncToCloud()
      .then(result => {
        setStatusMessage(result.message || `同步成功`);
        loadData();
        setTimeout(() => { setSyncStatus(''); setStatusMessage(''); }, 3000);
      })
      .catch(e => {
        setSyncStatus('error');
        setStatusMessage('同步失败');
        setTimeout(() => { setSyncStatus(''); setStatusMessage(''); }, 3000);
      });
  };

  const handleRestore = () => {
    setSyncStatus('downloading');
    setStatusMessage('下载中...');
    cloudDB.restoreFromCloud()
      .then(count => {
        setStatusMessage(`成功恢复 ${count} 条`);
        loadData();
        setTimeout(() => { setSyncStatus(''); setStatusMessage(''); }, 3000);
      })
      .catch(e => {
        setSyncStatus('error');
        setStatusMessage('恢复失败');
        setTimeout(() => { setSyncStatus(''); setStatusMessage(''); }, 3000);
      });
  };

  const filteredItems = useMemo(() => items.filter(item => {
    const matchesCategory = item.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchLower) || 
                          item.prompt.toLowerCase().includes(searchLower) || 
                          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)));
    
    if (activeCategory === 'general' && activeSubCategory !== 'all') {
      const sub = GENERAL_SUB_CATS.find(s => s.id === activeSubCategory);
      if (sub) {
        const isMatch = item.tags && (
          item.tags.includes(sub.label) || 
          (sub.id === 'system' && item.tags.includes('系统指令')) || 
          (sub.id === 'visual' && item.tags.includes('视觉/绘图'))
        );
        if (!isMatch) return false;
      }
    }
    return matchesCategory && matchesSearch;
  }), [items, activeCategory, searchQuery, activeSubCategory]);

  const handleSaveItem = async (itemData: PromptItem) => {
    await localDB.save(itemData); 
    loadData();
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    await localDB.delete(id);
    loadData();
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#fafaf9] relative overflow-hidden">
      <header className="flex-none px-4 pt-4 pb-2 bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeColor.bg} text-white shadow-lg shadow-stone-200`}>
              <Cloud size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-stone-800 font-exo">ILRE <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full font-bold border border-stone-200">LITE</span></h1>
              <div className="text-[10px] text-stone-400 font-mono">{formatBytes(storageUsage)}</div>
            </div>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 rounded-full text-stone-400 active:bg-stone-100 transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input 
            type="text" 
            className="block w-full pl-10 pr-4 py-2 bg-stone-100/50 border-none text-stone-600 text-sm rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-stone-200 transition-all" 
            placeholder="搜索资料..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => { setActiveCategory(cat.id); setActiveSubCategory('all'); }}
              className={`flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === cat.id ? 'bg-stone-800 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {activeCategory === 'general' && (
          <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-1">
            {GENERAL_SUB_CATS.map(sub => (
              <button 
                key={sub.id} 
                onClick={() => setActiveSubCategory(sub.id)}
                className={`flex-none px-3 py-1.5 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1.5 ${activeSubCategory === sub.id ? 'bg-stone-100 text-stone-800 border-stone-300' : 'bg-white text-stone-400 border-stone-100'}`}
              >
                <span style={{color: activeSubCategory === sub.id ? 'inherit' : sub.color}}>{sub.icon}</span> 
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-grow overflow-y-auto pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Loader2 size={32} className="animate-spin mb-4 opacity-20" />
            <p className="text-sm">加载中...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          activeCategory === 'general' ? 
            <TextGrid items={filteredItems} onSelect={setSelectedItem} /> : 
            <MediaGrid items={filteredItems} onSelect={setSelectedItem} />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-stone-300">
            <div className="p-6 bg-white rounded-full mb-4 shadow-sm border border-stone-100"><CloudOff size={40} /></div>
            <p className="text-sm font-medium">暂无相关资料</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
          className="w-14 h-14 rounded-2xl bg-stone-800 text-white shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>

      <PromptModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
        onEdit={(item) => { setEditingItem(item); setIsFormOpen(true); }}
        onDelete={handleDeleteItem}
      />

      <PromptFormModal 
        isOpen={isFormOpen} 
        initialData={editingItem} 
        activeCategory={activeCategory}
        onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
        onSave={handleSaveItem}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onBackup={() => setConfirmAction({ title: '确认同步？', message: '将本地所有修改上传至云端。', action: async () => handleBackup() })}
        onRestore={() => setConfirmAction({ title: '确认覆盖？', message: '将清空本地所有数据，并从云端重新拉取。', action: async () => handleRestore() })}
        syncStatus={syncStatus}
        statusMessage={statusMessage}
      />

      <ConfirmModal 
        isOpen={!!confirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction?.action()}
      />
    </div>
  );
};

export default App;
