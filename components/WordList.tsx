
import React from 'react';
import { VocabularyItem } from '../types';
import { Check, X, Volume2 } from 'lucide-react';

interface WordListProps {
  items: VocabularyItem[];
  unknownIDs: number[];
  toggleUnknown: (id: number) => void;
  isDarkMode?: boolean;
}

const WordList: React.FC<WordListProps> = ({ items, unknownIDs, toggleUnknown, isDarkMode }) => {
  const playAudio = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 animate-in slide-in-from-bottom-8 duration-500 pb-12">
      <div className={`backdrop-blur-xl rounded-[2rem] shadow-xl overflow-hidden border transition-colors duration-500 ${
          isDarkMode 
          ? 'bg-slate-900/60 border-slate-800 shadow-black/30' 
          : 'bg-white/70 border-white/60 shadow-indigo-500/5'
      }`}>
          <div className={`divide-y ${isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100/80'}`}>
            {items.map((item) => {
              const isUnknown = unknownIDs.includes(item.id);
              return (
                <div key={item.id} className={`p-5 flex items-center justify-between transition-all group ${
                    isDarkMode 
                    ? 'hover:bg-slate-800/60' 
                    : 'hover:bg-white/60'
                }`}>
                  <div className="flex items-center gap-5 flex-1">
                    <button 
                        onClick={() => playAudio(item.en)}
                        className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full transition-all shadow-sm hover:shadow-md active:scale-90 ${
                            isDarkMode
                            ? 'bg-slate-800 text-indigo-400 hover:bg-indigo-600 hover:text-white'
                            : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white'
                        }`}
                    >
                        <Volume2 size={20} />
                    </button>
                    <div>
                      <p className={`text-xl font-bold tracking-tight transition-colors ${
                          isUnknown 
                          ? 'text-rose-500' 
                          : isDarkMode ? 'text-slate-200' : 'text-slate-800'
                      }`}>
                        {item.en}
                      </p>
                      <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-500'
                      }`}>{item.tr}</p>
                      {item.example && (
                        <p className={`text-sm italic mt-1 font-medium flex items-center gap-1.5 cursor-pointer hover:text-indigo-500 transition-colors ${
                            isDarkMode ? 'text-slate-600' : 'text-slate-400'
                        }`} onClick={() => playAudio(item.example!)}>
                           <span className="text-[10px] opacity-50 bg-current px-1 rounded">Ex</span> "{item.example}"
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleUnknown(item.id)}
                    className={`ml-4 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all border shadow-sm active:scale-95 whitespace-nowrap ${
                      isUnknown
                        ? isDarkMode 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                            : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                        : isDarkMode
                            ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300'
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                    }`}
                  >
                    {isUnknown ? (
                      <>
                        <X size={14} strokeWidth={3} /> Zorlandım
                      </>
                    ) : (
                      <>
                        <Check size={14} strokeWidth={3} /> Bildim
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
};

export default WordList;
