import React from 'react';
import { VocabularyItem } from '../types';
import { Check, X, Volume2 } from 'lucide-react';

interface WordListProps {
  items: VocabularyItem[];
  unknownIDs: number[];
  toggleUnknown: (id: number) => void;
}

const WordList: React.FC<WordListProps> = ({ items, unknownIDs, toggleUnknown }) => {
  const playAudio = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (items.length === 0) {
    return <div className="text-center p-12 text-slate-400 font-medium bg-white/50 rounded-3xl border border-dashed border-slate-200">Bu listede görüntülenecek kelime yok.</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-500/5 overflow-hidden border border-white/60">
          <div className="divide-y divide-slate-100/80">
            {items.map((item) => {
              const isUnknown = unknownIDs.includes(item.id);
              return (
                <div key={item.id} className="p-5 flex items-center justify-between hover:bg-white/60 transition-all group">
                  <div className="flex items-center gap-5">
                    <button 
                        onClick={() => playAudio(item.en)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-sm hover:shadow-md active:scale-90"
                    >
                        <Volume2 size={18} />
                    </button>
                    <div>
                      <p className={`text-xl font-bold tracking-tight transition-colors ${isUnknown ? 'text-rose-500' : 'text-slate-800'}`}>
                        {item.en}
                      </p>
                      <p className="text-sm text-slate-500 font-medium">{item.tr}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleUnknown(item.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all border shadow-sm active:scale-95 ${
                      isUnknown
                        ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 hover:border-rose-200'
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