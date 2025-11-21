import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Play, BookOpen, Shuffle, Filter, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle, Keyboard } from 'lucide-react';
import { FULL_VOCABULARY_LIST } from './constants';
import { ViewMode } from './types';
import Flashcard from './components/Flashcard';
import WordList from './components/WordList';

const CHUNK_SIZE = 20;

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [currentPart, setCurrentPart] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [unknownIDs, setUnknownIDs] = useState<number[]>([]);
  const [isFilterActive, setIsFilterActive] = useState<boolean>(false);
  const [shuffledList, setShuffledList] = useState<typeof FULL_VOCABULARY_LIST | null>(null);
  
  // Lifted state for keyboard control
  const [isFlipped, setIsFlipped] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('unknownWords');
    if (stored) {
      try {
        setUnknownIDs(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('unknownWords', JSON.stringify(unknownIDs));
  }, [unknownIDs]);

  // Derived State: The actual list of words to show
  const activeList = useMemo(() => {
    if (isFilterActive) {
      return FULL_VOCABULARY_LIST.filter(item => unknownIDs.includes(item.id));
    }
    
    if (currentPart === -1) {
       return shuffledList || FULL_VOCABULARY_LIST;
    }

    const start = currentPart * CHUNK_SIZE;
    const end = start + CHUNK_SIZE;
    const slice = FULL_VOCABULARY_LIST.slice(start, end);
    
    return shuffledList || slice;
  }, [currentPart, isFilterActive, unknownIDs, shuffledList]);

  // Reset navigation when list context changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [currentPart, isFilterActive, shuffledList]);

  const totalParts = Math.ceil(FULL_VOCABULARY_LIST.length / CHUNK_SIZE);

  // Handlers
  const handlePartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPart(parseInt(e.target.value));
    setIsFilterActive(false);
    setShuffledList(null);
  };

  const toggleFilter = () => {
    if (!isFilterActive && unknownIDs.length === 0) {
      alert("Henüz 'Zorlandım' olarak işaretlediğiniz bir kelime yok.");
      return;
    }
    setIsFilterActive(!isFilterActive);
    setShuffledList(null);
  };

  const toggleUnknown = (id: number) => {
    if (unknownIDs.includes(id)) {
      setUnknownIDs(prev => prev.filter(uid => uid !== id));
    } else {
      setUnknownIDs(prev => [...prev, id]);
    }
  };

  const handleShuffle = () => {
    const listToShuffle = [...activeList];
    for (let i = listToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [listToShuffle[i], listToShuffle[j]] = [listToShuffle[j], listToShuffle[i]];
    }
    setShuffledList(listToShuffle);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = useCallback(() => {
    if (activeList.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex(prev => (prev < activeList.length - 1 ? prev + 1 : 0));
    }, 150); // Small delay for animation reset feel
  }, [activeList.length]);

  const handlePrev = useCallback(() => {
    if (activeList.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : activeList.length - 1));
    }, 150);
  }, [activeList.length]);

  const markKnownAndNext = useCallback(() => {
    if (activeList.length === 0) return;
    const currentItem = activeList[currentIndex];
    if (unknownIDs.includes(currentItem.id)) {
        setUnknownIDs(prev => prev.filter(id => id !== currentItem.id));
    }
    handleNext();
  }, [activeList, currentIndex, unknownIDs, handleNext]);

  const markUnknownAndNext = useCallback(() => {
    if (activeList.length === 0) return;
    const currentItem = activeList[currentIndex];
    if (!unknownIDs.includes(currentItem.id)) {
        setUnknownIDs(prev => [...prev, currentItem.id]);
    }
    handleNext();
  }, [activeList, currentIndex, unknownIDs, handleNext]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'card') return;
      
      // Ignore if focus is on an input (if any)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowUp':
          e.preventDefault();
          markKnownAndNext();
          break;
        case 'ArrowDown':
          e.preventDefault();
          markUnknownAndNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, handleNext, handlePrev, markKnownAndNext, markUnknownAndNext]);

  // Render Data
  const currentItem = activeList[currentIndex];
  const progressPercentage = activeList.length > 0 ? ((currentIndex + 1) / activeList.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#f5f7fa] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-[#f5f7fa] to-[#f5f7fa] text-slate-800 pb-20 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* Header */}
      <header className="pt-10 pb-6 px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 mb-3 drop-shadow-sm">
          Kelime Çalış
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          {isFilterActive ? '🔥 Zorlandıklarım Modu' : '✨ Modern Öğrenme Deneyimi'}
        </p>
      </header>

      {/* Controls Bar */}
      <div className="max-w-5xl mx-auto px-4 mb-8 relative z-10">
        <div className="bg-white/60 backdrop-blur-xl p-3 rounded-3xl shadow-lg shadow-indigo-500/5 border border-white/50 flex flex-col lg:flex-row gap-3 items-center justify-between">
            
            {/* Part Selector */}
            <div className="relative w-full lg:w-72 group">
                <select 
                    value={currentPart}
                    onChange={handlePartChange}
                    disabled={isFilterActive}
                    className="w-full appearance-none bg-white/80 border border-slate-200 hover:border-indigo-300 px-5 py-3 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-50 transition-all cursor-pointer"
                >
                    {Array.from({ length: totalParts }).map((_, i) => (
                        <option key={i} value={i}>Part {i + 1} ({i*CHUNK_SIZE+1}-{(i+1)*CHUNK_SIZE})</option>
                    ))}
                    <option value={-1}>Tüm Kelimeler ({FULL_VOCABULARY_LIST.length})</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <BookOpen size={18} />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                 <button 
                    onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 shadow-sm transition-all whitespace-nowrap active:scale-95"
                >
                    {viewMode === 'card' ? <><BookOpen size={18}/> Liste</> : <><Play size={18}/> Kartlar</>}
                </button>

                <button 
                    onClick={handleShuffle}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 shadow-sm transition-all whitespace-nowrap active:scale-95"
                >
                    <Shuffle size={18}/> Karıştır
                </button>

                <button 
                    onClick={toggleFilter}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border shadow-sm transition-all whitespace-nowrap active:scale-95 ${
                        isFilterActive 
                        ? 'bg-rose-500 text-white border-rose-600 shadow-rose-500/30 hover:bg-rose-600' 
                        : 'bg-white text-rose-500 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                    }`}
                >
                    <Filter size={18}/> 
                    {isFilterActive ? 'Tümüne Dön' : `Zorlandıklarım (${unknownIDs.length})`}
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 relative z-0">
        
        {viewMode === 'card' && activeList.length > 0 && currentItem && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Progress Bar */}
                <div className="w-full max-w-md mb-8 flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 w-10 text-right font-mono">{currentIndex + 1}</span>
                    <div className="flex-1 h-3 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-10 font-mono">{activeList.length}</span>
                </div>

                {/* Navigation & Card */}
                <div className="w-full flex items-center justify-center gap-4 md:gap-8">
                     <button 
                        onClick={handlePrev}
                        className="hidden md:flex p-4 rounded-full bg-white/80 backdrop-blur-md text-slate-400 hover:text-indigo-600 hover:scale-110 border border-white shadow-lg shadow-indigo-500/5 transition-all active:scale-90"
                        title="Önceki (Sol Ok)"
                     >
                        <ChevronLeft size={28} />
                     </button>

                     <div className="flex-1 max-w-[400px]">
                        <Flashcard 
                            item={currentItem} 
                            isFlipped={isFlipped}
                            onFlip={() => setIsFlipped(!isFlipped)}
                            isUnknown={unknownIDs.includes(currentItem.id)}
                        />
                     </div>

                     <button 
                        onClick={handleNext}
                        className="hidden md:flex p-4 rounded-full bg-white/80 backdrop-blur-md text-slate-400 hover:text-indigo-600 hover:scale-110 border border-white shadow-lg shadow-indigo-500/5 transition-all active:scale-90"
                        title="Sonraki (Sağ Ok)"
                     >
                        <ChevronRight size={28} />
                     </button>
                </div>

                {/* Mobile Nav Buttons (Visible only on small screens) */}
                <div className="flex md:hidden gap-4 mt-6 w-full max-w-[400px]">
                    <button onClick={handlePrev} className="flex-1 py-3 bg-white rounded-xl shadow-sm font-semibold text-slate-500">← Önceki</button>
                    <button onClick={handleNext} className="flex-1 py-3 bg-white rounded-xl shadow-sm font-semibold text-slate-500">Sonraki →</button>
                </div>

                {/* Assessment Buttons */}
                <div className="w-full max-w-[400px] mt-8 grid grid-cols-2 gap-4">
                     <button 
                        onClick={markUnknownAndNext}
                        className="group py-4 rounded-2xl bg-white/80 backdrop-blur-sm text-rose-500 font-extrabold text-lg border border-rose-100 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 hover:bg-rose-50 hover:border-rose-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 active:translate-y-0"
                        title="Kısayol: Aşağı Ok"
                     >
                        <XCircle className="group-hover:scale-110 transition-transform" /> Bilemedim
                     </button>
                     <button 
                        onClick={markKnownAndNext}
                        className="group py-4 rounded-2xl bg-white/80 backdrop-blur-sm text-emerald-600 font-extrabold text-lg border border-emerald-100 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:bg-emerald-50 hover:border-emerald-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 active:translate-y-0"
                        title="Kısayol: Yukarı Ok"
                     >
                        <CheckCircle className="group-hover:scale-110 transition-transform" /> Biliyorum
                     </button>
                </div>

                {/* Keyboard Hints */}
                <div className="mt-8 flex gap-6 text-xs font-medium text-slate-400 opacity-60">
                    <span className="flex items-center gap-1"><Keyboard size={14}/> Space: Çevir</span>
                    <span className="flex items-center gap-1">↑: Bildim</span>
                    <span className="flex items-center gap-1">↓: Bilemedim</span>
                </div>
            </div>
        )}

        {viewMode === 'card' && activeList.length === 0 && (
             <div className="text-center py-24 px-4 bg-white/40 backdrop-blur-md rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center animate-in zoom-in-95 duration-500">
                <div className="bg-white p-4 rounded-full shadow-xl shadow-indigo-500/10 mb-6">
                    <RefreshCw className="text-indigo-400" size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-700 mb-2">Liste Boş</h3>
                <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">
                    {isFilterActive ? "Harika! Zorlandığın hiç kelime kalmadı." : "Bu kategoride görüntülenecek kelime bulunamadı."}
                </p>
             </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
            <WordList 
                items={activeList} 
                unknownIDs={unknownIDs} 
                toggleUnknown={toggleUnknown}
            />
        )}

      </main>
    </div>
  );
}