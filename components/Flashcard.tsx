import React from 'react';
import { Volume2, RotateCw, Turtle } from 'lucide-react';
import { VocabularyItem } from '../types';

interface FlashcardProps {
  item: VocabularyItem;
  isFlipped: boolean;
  onFlip: () => void;
  isUnknown: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ item, isFlipped, onFlip, isUnknown }) => {
  
  const playAudio = (e: React.MouseEvent, rate: number = 1) => {
    e.stopPropagation();
    
    // Cancel previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(item.en);
    utterance.lang = 'en-US';
    utterance.rate = rate; // 1 is normal, 0.7 is slow
    
    // Select a better voice if available (iOS/Mac usually has good defaults)
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang === 'en-US' && !v.localService) || voices.find(v => v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full h-[320px] perspective-1000 cursor-pointer group" onClick={onFlip}>
      <div
        className={`relative w-full h-full transition-all duration-700 ease-out transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-[2rem] shadow-2xl shadow-indigo-500/15 bg-white/80 backdrop-blur-xl border border-white/60 flex flex-col items-center justify-center p-6 overflow-hidden hover:border-indigo-200 transition-colors">
           
           {/* Decoration Background */}
           <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />
           <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-500/5 to-teal-500/5 rounded-full blur-3xl pointer-events-none" />

           {isUnknown && (
            <div className="absolute top-6 right-6 px-3 py-1.5 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-bold rounded-full shadow-lg shadow-rose-500/20 animate-pulse">
              Zorlandım
            </div>
          )}
          
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 text-center leading-tight drop-shadow-sm mb-1">
                {item.en}
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full opacity-20 mt-4 mb-2"></div>
          </div>
          
          <div className="flex items-center gap-3 z-10">
            <button
                onClick={(e) => playAudio(e, 0.7)}
                className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
                title="Yavaş Telaffuz"
            >
                <Turtle size={20} />
            </button>
            <button
                onClick={(e) => playAudio(e, 1)}
                className="p-4 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 active:scale-95"
                title="Normal Telaffuz"
            >
                <Volume2 size={28} />
            </button>
          </div>

          <p className="absolute bottom-4 text-slate-300 text-xs font-semibold uppercase tracking-widest opacity-60">
            Çevirmek için tıkla
          </p>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[2rem] shadow-2xl shadow-indigo-500/20 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] text-white p-8 flex flex-col items-center justify-center relative overflow-hidden border border-white/10">
          
          {/* Noise Texture & Glare */}
          <div className="absolute inset-0 bg-white opacity-[0.03] mix-blend-overlay" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />

          <div className="text-center relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest mb-4 text-indigo-100 backdrop-blur-sm">
                Anlamı
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold leading-snug">
                {item.tr}
            </h3>
          </div>
          
          <div className="absolute bottom-6 right-6 p-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10 opacity-60">
             <RotateCw className="text-white" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;