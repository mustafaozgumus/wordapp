
import React from 'react';
import { Volume2, RotateCw, Turtle } from 'lucide-react';
import { VocabularyItem } from '../types';

interface FlashcardProps {
  item: VocabularyItem;
  isFlipped: boolean;
  onFlip: () => void;
  isUnknown: boolean;
  isDarkMode?: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ item, isFlipped, onFlip, isUnknown, isDarkMode }) => {
  
  const playAudio = (e: React.MouseEvent, text: string, rate: number = 1) => {
    e.stopPropagation();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate; 
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang === 'en-US' && !v.localService) || voices.find(v => v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full h-[360px] perspective-1000 cursor-pointer group" onClick={onFlip}>
      <div
        className={`relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform-style-3d ${
          isFlipped ? 'rotate-y-180' : 'hover:-translate-y-2'
        }`}
      >
        {/* Front Face */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rounded-[2.5rem] shadow-2xl backdrop-blur-xl border flex flex-col items-center justify-center p-6 overflow-hidden transition-colors duration-500 ${
            isDarkMode 
            ? 'bg-slate-900/80 border-slate-700 shadow-black/50 hover:border-indigo-500/50' 
            : 'bg-white/80 border-white/60 shadow-indigo-500/15 hover:border-indigo-200'
        }`}>
           
           {/* Decoration Background */}
           <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 ${
               isDarkMode ? 'bg-indigo-500/20' : 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10'
           }`} />
           <div className={`absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40 ${
               isDarkMode ? 'bg-violet-500/20' : 'bg-gradient-to-tr from-blue-500/10 to-teal-500/10'
           }`} />

           {isUnknown && (
            <div className="absolute top-8 right-8 px-3 py-1.5 bg-rose-500 text-white text-[10px] uppercase tracking-wider font-bold rounded-full shadow-lg shadow-rose-500/40 animate-pulse z-20">
              Zorlandım
            </div>
          )}
          
          <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
            <h2 className={`text-4xl md:text-6xl font-black text-center leading-tight drop-shadow-sm mb-2 tracking-tight ${
                isDarkMode ? 'text-slate-100' : 'text-slate-800'
            }`}>
                {item.en}
            </h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full opacity-30 mt-4 mb-2"></div>
          </div>
          
          <div className="flex items-center gap-4 z-20">
            <button
                onClick={(e) => playAudio(e, item.en, 0.7)}
                className={`p-3.5 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-110 active:scale-95 border ${
                    isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-indigo-500/50'
                    : 'bg-white border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100'
                }`}
                title="Yavaş Telaffuz"
            >
                <Turtle size={22} />
            </button>
            <button
                onClick={(e) => playAudio(e, item.en, 1)}
                className="p-5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-110 active:scale-95"
                title="Normal Telaffuz"
            >
                <Volume2 size={32} />
            </button>
          </div>

          <p className={`absolute bottom-6 text-xs font-bold uppercase tracking-[0.2em] opacity-50 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Çevirmek için tıkla
          </p>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[2.5rem] shadow-2xl shadow-indigo-900/20 bg-gradient-to-br from-[#4338ca] to-[#7c3aed] text-white p-8 flex flex-col items-center justify-center relative overflow-hidden border border-white/10">
          
          {/* Noise Texture & Glare */}
          <div className="absolute inset-0 bg-white opacity-[0.03] mix-blend-overlay" />
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-b from-white/10 to-transparent opacity-30 pointer-events-none rotate-12" />

          <div className="text-center relative z-10 flex flex-col items-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest mb-6 text-indigo-100 backdrop-blur-md shadow-inner">
                Anlamı
            </span>
            <h3 className="text-3xl md:text-5xl font-extrabold leading-snug tracking-tight drop-shadow-lg mb-4">
                {item.tr}
            </h3>
            
            {item.example && (
                <div className="mt-2 w-full">
                    <div className="h-px w-12 bg-white/20 mx-auto mb-4"></div>
                    <div className="bg-black/10 rounded-xl p-4 backdrop-blur-sm border border-white/5 relative group/example" onClick={(e) => playAudio(e, item.example!)}>
                        <p className="text-sm md:text-base font-medium italic opacity-90 leading-relaxed text-indigo-50">
                            "{item.example}"
                        </p>
                        <div className="absolute -top-2 -right-2 bg-white text-indigo-600 rounded-full p-1.5 shadow-lg opacity-0 group-hover/example:opacity-100 transition-opacity scale-75 hover:scale-100 cursor-pointer">
                           <Volume2 size={14} fill="currentColor" />
                        </div>
                    </div>
                </div>
            )}
          </div>
          
          <div className="absolute bottom-8 right-8 p-2.5 bg-white/10 rounded-full backdrop-blur-sm border border-white/10 opacity-60 hover:opacity-100 transition-opacity">
             <RotateCw className="text-white" size={22} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
