import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Play, BookOpen, Shuffle, Filter, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle, Keyboard, Moon, Sun } from 'lucide-react';
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Lifted state for keyboard control
  const [isFlipped, setIsFlipped] = useState(false);

  // Initialize from LocalStorage (Dark Mode & Unknowns)
  useEffect(() => {
    // Unknowns
    const storedUnknowns = localStorage.getItem('unknownWords');
    if (storedUnknowns) {
      try {
        setUnknownIDs(JSON.parse(storedUnknowns));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }

    // Dark Mode
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Save Unknowns to LocalStorage
  useEffect(() => {
    localStorage.setItem('unknownWords', JSON.stringify(unknownIDs));
  }, [unknownIDs]);

  // Toggle Theme
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100' : 'bg-[#f5f7fa] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-[#f5f7fa] to-[#f5f7fa] text-slate-800'} pb-20 font-sans selection:bg-indigo-500 selection:text-white`}>
      
      {/* Header */}
      <header className="pt-8 pb-6 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 mb-2 drop-shadow-sm animate-in slide-in-from-top-2">
                Kelime Çalış
                </h1>
                <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isFilterActive ? '🔥 Zorlandıklarım Modu' : '✨ Modern Öğrenme Deneyimi'}
                </p>
            </div>

            <button 
                onClick={toggleTheme}
                className={`p-3 rounded-full transition-all duration-300 shadow-lg active:scale-95 ${
                    isDarkMode 
                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 hover:shadow-yellow-400/20' 
                    : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 shadow-slate-200'
                }`}
            >
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="max-w-5xl mx-auto px-4 mb-8 relative z-10">
        <div className={`backdrop-blur-xl p-3 rounded-3xl shadow-xl border transition-colors duration-500 flex flex-col lg:flex-row gap-3 items-center justify-between ${
            isDarkMode 
            ? 'bg-slate-900/60 border-slate-800/60 shadow-black/20' 
            : 'bg-white/60 border-white/50 shadow-indigo-500/5'
        }`}>
            
            {/* Part Selector */}
            <div className="relative w-full lg:w-72 group">
                <select 
                    value={currentPart}
                    onChange={handlePartChange}
                    disabled={isFilterActive}
                    className={`w-full appearance-none border px-5 py-3 rounded-2xl font-bold focus:outline-none focus:ring-4 disabled:opacity-50 transition-all cursor-pointer ${
                        isDarkMode
                        ? 'bg-slate-800/50 border-slate-700 text-slate-200 hover:border-indigo-500/50 focus:ring-indigo-500/20'
                        : 'bg-white/80 border-slate-200 text-slate-700 hover:border-indigo-300 focus:ring-indigo-500/10'
                    }`}
                >
                    {Array.from({ length: totalParts }).map((_, i) => (
                        <option key={i} value={i} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>Part {i + 1} ({i*CHUNK_SIZE+1}-{(i+1)*CHUNK_SIZE})</option>
                    ))}
                    <option value={-1} className={isDarkMode ? 'bg-slate-900 text-white' : ''}>Tüm Kelimeler ({FULL_VOCABULARY_LIST.length})</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <BookOpen size={18} />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                 <button 
                    onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border shadow-sm transition-all whitespace-nowrap active:scale-95 ${
                        isDarkMode
                        ? 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                    }`}
                >
                    {viewMode === 'card' ? <><BookOpen size={18}/> Liste</> : <><Play size={18}/> Kartlar</>}
                </button>

                <button 
                    onClick={handleShuffle}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border shadow-sm transition-all whitespace-nowrap active:scale-95 ${
                        isDarkMode
                        ? 'bg-slate-800/50 text-emerald-400 border-slate-700 hover:bg-slate-700 hover:text-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                    }`}
                >
                    <Shuffle size={18}/> Karıştır
                </button>

                <button 
                    onClick={toggleFilter}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border shadow-sm transition-all whitespace-nowrap active:scale-95 ${
                        isFilterActive 
                        ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/30 hover:bg-rose-500' 
                        : isDarkMode
                            ? 'bg-slate-800/50 text-rose-400 border-slate-700 hover:bg-slate-700'
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
                    <span className={`text-xs font-bold w-10 text-right font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{currentIndex + 1}</span>
                    <div className={`flex-1 h-3 rounded-full overflow-hidden shadow-inner border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500 ease-out rounded-full relative"
                            style={{ width: `${progressPercentage}%` }}
                        >
                             <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                    <span className={`text-xs font-bold w-10 font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{activeList.length}</span>
                </div>

                {/* Navigation & Card */}
                <div className="w-full flex items-center justify-center gap-4 md:gap-8">
                     <button 
                        onClick={handlePrev}
                        className={`hidden md:flex p-4 rounded-full backdrop-blur-md border shadow-lg transition-all active:scale-90 hover:scale-110 ${
                            isDarkMode
                            ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 shadow-black/20'
                            : 'bg-white/80 border-white text-slate-400 hover:text-indigo-600 shadow-indigo-500/5'
                        }`}
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
                            isDarkMode={isDarkMode}
                        />
                     </div>

                     <button 
                        onClick={handleNext}
                        className={`hidden md:flex p-4 rounded-full backdrop-blur-md border shadow-lg transition-all active:scale-90 hover:scale-110 ${
                            isDarkMode
                            ? 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 shadow-black/20'
                            : 'bg-white/80 border-white text-slate-400 hover:text-indigo-600 shadow-indigo-500/5'
                        }`}
                        title="Sonraki (Sağ Ok)"
                     >
                        <ChevronRight size={28} />
                     </button>
                </div>

                {/* Mobile Nav Buttons */}
                <div className="flex md:hidden gap-4 mt-6 w-full max-w-[400px]">
                    <button onClick={handlePrev} className={`flex-1 py-3 rounded-xl shadow-sm font-semibold transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-500'}`}>← Önceki</button>
                    <button onClick={handleNext} className={`flex-1 py-3 rounded-xl shadow-sm font-semibold transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-500'}`}>Sonraki →</button>
                </div>

                {/* Assessment Buttons */}
                <div className="w-full max-w-[400px] mt-8 grid grid-cols-2 gap-4">
                     <button 
                        onClick={markUnknownAndNext}
                        className={`group py-4 rounded-2xl backdrop-blur-sm font-extrabold text-lg border shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2 active:translate-y-0 ${
                            isDarkMode
                            ? 'bg-slate-800/60 text-rose-400 border-slate-700 hover:bg-rose-500/10 hover:border-rose-500/30 shadow-black/20'
                            : 'bg-white/80 text-rose-500 border-rose-100 shadow-rose-500/10 hover:bg-rose-50 hover:border-rose-200'
                        }`}
                     >
                        <XCircle className="group-hover:scale-110 transition-transform" /> Bilemedim
                     </button>
                     <button 
                        onClick={markKnownAndNext}
                        className={`group py-4 rounded-2xl backdrop-blur-sm font-extrabold text-lg border shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2 active:translate-y-0 ${
                            isDarkMode
                            ? 'bg-slate-800/60 text-emerald-400 border-slate-700 hover:bg-emerald-500/10 hover:border-emerald-500/30 shadow-black/20'
                            : 'bg-white/80 text-emerald-600 border-emerald-100 shadow-emerald-500/10 hover:bg-emerald-50 hover:border-emerald-200'
                        }`}
                     >
                        <CheckCircle className="group-hover:scale-110 transition-transform" /> Biliyorum
                     </button>
                </div>

                {/* Keyboard Hints */}
                <div className={`mt-8 flex gap-6 text-xs font-medium opacity-60 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span className="flex items-center gap-1"><Keyboard size={14}/> Space: Çevir</span>
                    <span className="flex items-center gap-1">↑: Bildim</span>
                    <span className="flex items-center gap-1">↓: Bilemedim</span>
                </div>
            </div>
        )}

        {viewMode === 'card' && activeList.length === 0 && (
             <div className={`text-center py-24 px-4 backdrop-blur-md rounded-3xl border-2 border-dashed flex flex-col items-center animate-in zoom-in-95 duration-500 ${
                 isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-white/40 border-slate-200'
             }`}>
                <div className={`p-4 rounded-full shadow-xl mb-6 ${isDarkMode ? 'bg-slate-800 shadow-black/30' : 'bg-white shadow-indigo-500/10'}`}>
                    <RefreshCw className="text-indigo-400" size={40} />
                </div>
                <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>Liste Boş</h3>
                <p className={`max-w-xs mx-auto leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
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
                isDarkMode={isDarkMode}
            />
        )}

      </main>
    </div>
  );
}