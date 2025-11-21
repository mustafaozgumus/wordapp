import React, { useState, useEffect, useMemo } from 'react';
import { Play, BookOpen, Shuffle, Filter, RefreshCw, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
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
       // All items (handle shuffle if active)
       return shuffledList || FULL_VOCABULARY_LIST;
    }

    // Pagination logic
    const start = currentPart * CHUNK_SIZE;
    const end = start + CHUNK_SIZE;
    const slice = FULL_VOCABULARY_LIST.slice(start, end);
    
    return shuffledList || slice;
  }, [currentPart, isFilterActive, unknownIDs, shuffledList]);

  // Reset index when list changes significantly
  useEffect(() => {
    setCurrentIndex(0);
  }, [currentPart, isFilterActive]);

  // Logic handlers
  const totalParts = Math.ceil(FULL_VOCABULARY_LIST.length / CHUNK_SIZE);

  const handlePartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPart(parseInt(e.target.value));
    setIsFilterActive(false);
    setShuffledList(null); // Reset shuffle on part change
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
  };

  const handleNext = () => {
    if (currentIndex < activeList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Loop back to start or stay at end? Let's loop for flow
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(activeList.length - 1);
    }
  };

  const markKnownAndNext = () => {
    const currentItem = activeList[currentIndex];
    if (unknownIDs.includes(currentItem.id)) {
        setUnknownIDs(prev => prev.filter(id => id !== currentItem.id));
    }
    handleNext();
  };

  const markUnknownAndNext = () => {
    const currentItem = activeList[currentIndex];
    if (!unknownIDs.includes(currentItem.id)) {
        setUnknownIDs(prev => [...prev, currentItem.id]);
    }
    handleNext();
  };

  // Render Helpers
  const currentItem = activeList[currentIndex];
  const progressPercentage = activeList.length > 0 ? ((currentIndex + 1) / activeList.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-slate-800 pb-20">
      
      {/* Header */}
      <header className="pt-8 pb-6 px-4 text-center">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 mb-2">
          Kelime Çalış
        </h1>
        <p className="text-slate-500 font-medium">
          {isFilterActive ? 'Zorlandıklarım Modu' : 'Kelime Öğrenme Modu'}
        </p>
      </header>

      {/* Controls Bar */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/50 flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Part Selector */}
            <div className="relative w-full md:w-64">
                <select 
                    value={currentPart}
                    onChange={handlePartChange}
                    disabled={isFilterActive}
                    className="w-full appearance-none bg-white border border-slate-200 hover:border-indigo-400 px-4 py-2.5 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-colors"
                >
                    {Array.from({ length: totalParts }).map((_, i) => (
                        <option key={i} value={i}>Part {i + 1}</option>
                    ))}
                    <option value={-1}>Tüm Kelimeler ({FULL_VOCABULARY_LIST.length})</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <BookOpen size={16} />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                 <button 
                    onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                >
                    {viewMode === 'card' ? <><BookOpen size={16}/> Liste</> : <><Play size={16}/> Kartlar</>}
                </button>

                <button 
                    onClick={handleShuffle}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                >
                    <Shuffle size={16}/> Karıştır
                </button>

                <button 
                    onClick={toggleFilter}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-colors whitespace-nowrap ${
                        isFilterActive 
                        ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                        : 'bg-white text-red-500 border-red-200 hover:border-red-400'
                    }`}
                >
                    <Filter size={16}/> 
                    {isFilterActive ? 'Tümüne Dön' : `Zorlandıklarım (${unknownIDs.length})`}
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4">
        
        {viewMode === 'card' && activeList.length > 0 && currentItem && (
            <div className="flex flex-col items-center">
                {/* Progress Bar */}
                <div className="w-full max-w-md mb-6 flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 w-12 text-right">{currentIndex + 1}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-slate-400 w-12">{activeList.length}</span>
                </div>

                {/* Navigation & Card */}
                <div className="w-full flex items-center justify-center gap-4 md:gap-8">
                     <button 
                        onClick={handlePrev}
                        className="p-3 rounded-full bg-white text-slate-400 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all"
                     >
                        <ChevronLeft size={24} />
                     </button>

                     <div className="flex-1 max-w-md">
                        <Flashcard 
                            item={currentItem} 
                            onNext={handleNext} 
                            onPrev={handlePrev}
                            isUnknown={unknownIDs.includes(currentItem.id)}
                        />
                     </div>

                     <button 
                        onClick={handleNext}
                        className="p-3 rounded-full bg-white text-slate-400 hover:text-indigo-600 shadow-sm hover:shadow-md transition-all"
                     >
                        <ChevronRight size={24} />
                     </button>
                </div>

                {/* Assessment Buttons */}
                <div className="w-full max-w-md mt-8 grid grid-cols-2 gap-4">
                     <button 
                        onClick={markUnknownAndNext}
                        className="py-4 rounded-2xl bg-red-50 text-red-600 font-bold text-lg border-2 border-transparent hover:border-red-200 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                     >
                        <XCircle /> Bilemedim
                     </button>
                     <button 
                        onClick={markKnownAndNext}
                        className="py-4 rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-lg border-2 border-transparent hover:border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                     >
                        <CheckCircle /> Biliyorum
                     </button>
                </div>
            </div>
        )}

        {viewMode === 'card' && activeList.length === 0 && (
             <div className="text-center py-20 px-4 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                <RefreshCw className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-xl font-bold text-slate-600">Liste Boş</h3>
                <p className="text-slate-500">
                    {isFilterActive ? "Harika! Zorlandığın hiç kelime kalmadı." : "Bu kategoride kelime bulunamadı."}
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