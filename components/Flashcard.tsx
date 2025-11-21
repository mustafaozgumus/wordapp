import React, { useState } from 'react';
import { Volume2, RotateCw } from 'lucide-react';
import { VocabularyItem } from '../types';

interface FlashcardProps {
  item: VocabularyItem;
  onNext: () => void;
  onPrev: () => void;
  isUnknown: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ item, onNext, onPrev, isUnknown }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(item.en);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Reset flip state when item changes
  React.useEffect(() => {
    setIsFlipped(false);
  }, [item]);

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 h-80 cursor-pointer group" onClick={handleFlip}>
      <div
        className={`relative w-full h-full transition-all duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border border-white/50 p-8 flex flex-col items-center justify-center">
           {isUnknown && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
              Zorlandım
            </div>
          )}
          
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">{item.en}</h2>
          <p className="text-gray-400 text-sm font-medium mt-2">Kartı çevirmek için tıkla</p>
          
          <button
            onClick={playAudio}
            className="absolute bottom-6 right-6 p-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full transition-colors"
            title="Telaffuz et"
          >
            <Volume2 size={24} />
          </button>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl shadow-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-8 flex flex-col items-center justify-center">
          <div className="text-center">
            <span className="block text-sm opacity-70 uppercase tracking-widest mb-2">Anlamı</span>
            <h3 className="text-3xl font-bold">{item.tr}</h3>
          </div>
          <RotateCw className="absolute bottom-6 right-6 opacity-50" size={24} />
        </div>
      </div>
    </div>
  );
};

export default Flashcard;