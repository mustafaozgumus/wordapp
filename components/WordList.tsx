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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (items.length === 0) {
    return <div className="text-center p-8 text-gray-500">Bu listede görüntülenecek kelime yok.</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden mt-6 border border-white/40">
      <div className="divide-y divide-gray-100">
        {items.map((item) => {
          const isUnknown = unknownIDs.includes(item.id);
          return (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-4">
                <button 
                    onClick={() => playAudio(item.en)}
                    className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                >
                    <Volume2 size={18} />
                </button>
                <div>
                  <p className={`text-lg font-bold ${isUnknown ? 'text-red-500' : 'text-gray-800'}`}>
                    {item.en}
                  </p>
                  <p className="text-sm text-gray-500">{item.tr}</p>
                </div>
              </div>
              
              <button
                onClick={() => toggleUnknown(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                  isUnknown
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {isUnknown ? (
                  <>
                    <X size={16} /> Zorlandım
                  </>
                ) : (
                  <>
                    <Check size={16} /> Bildim
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WordList;