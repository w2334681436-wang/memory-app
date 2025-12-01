import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, CheckCircle, Clock, Plus, Trash2, WifiOff, Archive
} from 'lucide-react';

/**
 * Mnemo (记忆复利) - PWA Version
 */

// 读取 vite.config.js 注入的自动版本号，如果是本地开发则显示 Dev Mode
const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'Dev Mode';

const STAGES = [
  { days: 1, label: '初次复习' },
  { days: 2, label: '二次巩固' },
  { days: 4, label: '短期记忆' },
  { days: 7, label: '中期记忆' },
  { days: 15, label: '长期转化' },
  { days: 30, label: '深度固化' },
  { days: 60, label: '永久封存' }
];

// --- 新增：Mnemo 折叠丝带图标组件 ---
const MnemoIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
    <defs>
      <linearGradient id="leftGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#312e81" /> <stop offset="100%" stop-color="#4338ca" /> </linearGradient>
      <linearGradient id="rightGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#7c3aed" /> <stop offset="100%" stop-color="#d946ef" /> </linearGradient>
      <linearGradient id="foldGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#4c1d95" /> <stop offset="100%" stop-color="#6d28d9" /> </linearGradient>
      <linearGradient id="shadow" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#000000" stop-opacity="0.3" /> <stop offset="100%" stop-color="#000000" stop-opacity="0" /></linearGradient>
    </defs>
    <rect width="512" height="512" rx="110" fill="#ffffff"/>
    <g transform="translate(86, 106)">
      <path d="M 0 0 L 170 260 L 340 0 L 255 0 L 170 140 L 85 0 Z" fill="url(#foldGrad)" />
      <rect x="0" y="0" width="85" height="300" rx="12" fill="url(#leftGrad)" />
      <rect x="255" y="0" width="85" height="300" rx="12" fill="url(#rightGrad)" />
      <rect x="85" y="0" width="20" height="100" fill="url(#shadow)" opacity="0.5" />
      <rect x="235" y="0" width="20" height="100" fill="url(#shadow)" opacity="0.5" />
    </g>
  </svg>
);

// --- 启动屏组件 (更新) ---
const SplashScreen = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 稍微延长一点展示时间，让用户看清漂亮的新图标
    const timer1 = setTimeout(() => setFading(true), 1800);
    const timer2 = setTimeout(onFinish, 2300);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFDFE] transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative animate-bounce-slight">
        {/* 移除原来的紫色背景框，直接展示新的大图标，并加上更柔和的投影 */}
        <MnemoIcon className="w-28 h-28 drop-shadow-2xl" />
      </div>
      <h1 className="mt-8 text-3xl font-bold text-gray-900 tracking-tight">Mnemo</h1>
      <p className="text-gray-400 text-sm mt-2 font-medium tracking-widest uppercase">Memory Compound</p>
      <p className="absolute bottom-10 text-[10px] text-gray-300 font-mono">{VERSION}</p>
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [activeTab, setActiveTab] = useState('review');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const saved = localStorage.getItem('mnemo-data');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('mnemo-data', JSON.stringify(items));
  }, [items]);

  const getTodayString = () => new Date().toISOString().split('T')[0];
  const addDays = (dateStr, days) => {
    const result = new Date(dateStr);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    const today = getTodayString();
    setItems([{
      id: crypto.randomUUID(),
      content: newItem,
      createdAt: today,
      nextReview: addDays(today, STAGES[0].days),
      stage: 0,
      history: [],
      mastered: false
    }, ...items]);
    setNewItem('');
  };

  const handleReview = (id, quality) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const today = getTodayString();
      if (quality === 'forgot') {
        return { ...item, stage: 0, nextReview: addDays(today, 1), history: [...item.history, { date: today, result: quality }] };
      } else {
        const nextStage = item.stage + 1;
        if (nextStage >= STAGES.length) {
          return { ...item, mastered: true, nextReview: null, stage: nextStage, history: [...item.history, { date: today, result: quality }] };
        }
        return { ...item, stage: nextStage, nextReview: addDays(today, STAGES[nextStage].days), history: [...item.history, { date: today, result: quality }] };
      }
    }));
  };

  const handleDelete = (id) => {
    if (window.confirm('确认删除？')) setItems(items.filter(i => i.id !== id));
  };

  const todayStr = getTodayString();
  const dueItems = useMemo(() => items.filter(i => !i.mastered && i.nextReview <= todayStr).sort((a,b)=>a.nextReview.localeCompare(b.nextReview)), [items, todayStr]);
  const futureItems = useMemo(() => items.filter(i => !i.mastered && i.nextReview > todayStr).sort((a,b)=>a.nextReview.localeCompare(b.nextReview)), [items, todayStr]);
  const masteredItems = useMemo(() => items.filter(i => i.mastered), [items]);
  const reviewLoad = dueItems.length;

  if (loading) return <SplashScreen onFinish={() => setLoading(false)} />;

  return (
    <div className="min-h-screen bg-[#FDFDFE] text-slate-800 font-sans selection:bg-indigo-100 pb-safe">
      {/* Header (更新：移除图标) */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            {/* 图标已移除 */}
            <span className="font-bold text-lg tracking-tight text-slate-900 ml-1">Mnemo</span>
          </div>
          <div className="flex items-center gap-3">
             {isOffline && (
               <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                 <WifiOff className="w-3 h-3" /> OFFLINE
               </span>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        {reviewLoad > 0 ? (
          <div className="relative overflow-hidden rounded-2xl p-6 bg-slate-900 text-white shadow-xl shadow-indigo-200/50">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full blur-2xl opacity-20"></div>
            <div className="relative z-10 flex justify-between items-end">
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Due Review</p>
                <h2 className="text-3xl font-bold flex items-center gap-2">{reviewLoad} <span className="text-lg font-normal opacity-60">个任务</span></h2>
              </div>
              <div className="text-right">
                 <div className="text-2xl font-bold">{items.length > 0 ? Math.round((masteredItems.length / items.length) * 100) : 0}%</div>
                 <p className="text-[10px] text-indigo-200 uppercase tracking-wider">掌握率</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-200/50 flex flex-col items-center text-center justify-center py-8">
            <CheckCircle className="w-10 h-10 mb-3 text-emerald-100" />
            <h2 className="font-bold text-xl">任务完成!</h2>
            <p className="text-emerald-50 text-sm mt-1">今天是个学习新知识的好日子。</p>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleAddItem} className="relative">
          <input
            type="text"
            className="w-full pl-5 pr-14 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            placeholder="输入新知识点..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!newItem.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Navigation */}
        <nav className="flex p-1 bg-slate-100/50 rounded-xl">
          {['review', 'all', 'mastered'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'review' ? '待复习' : tab === 'all' ? '列表' : '已归档'}
            </button>
          ))}
        </nav>

        {/* List */}
        <div className="space-y-3 pb-20">
          {activeTab === 'review' && dueItems.map(item => (
            <div key={item.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-slate-800">{item.content}</h3>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider">
                  阶段 {item.stage}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleReview(item.id, 'forgot')} className="py-2.5 rounded-lg border border-slate-200 text-slate-500 text-sm font-medium hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors">忘了/模糊</button>
                <button onClick={() => handleReview(item.id, 'remembered')} className="py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors">记得</button>
              </div>
            </div>
          ))}

          {activeTab === 'all' && futureItems.map(item => (
            <div key={item.id} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between group">
              <div>
                <h3 className="text-slate-700 font-medium">{item.content}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 下次复习: {item.nextReview}
                </p>
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}

          {activeTab === 'mastered' && masteredItems.map(item => (
             <div key={item.id} className="bg-slate-50 rounded-xl p-4 flex items-center gap-3 opacity-70">
                <Archive className="w-4 h-4 text-emerald-500" />
                <span className="flex-1 text-slate-500 line-through decoration-emerald-500/30">{item.content}</span>
                <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 className="w-4 h-4" /></button>
             </div>
          ))}

          {((activeTab === 'review' && dueItems.length === 0) || 
            (activeTab === 'all' && futureItems.length === 0) || 
            (activeTab === 'mastered' && masteredItems.length === 0)) && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3 text-slate-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-slate-400 text-sm">暂无内容</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
