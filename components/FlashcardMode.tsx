import React, { useState } from 'react';
import { WordResult } from '../types';

interface Props {
  words: WordResult[];
}

export const FlashcardMode: React.FC<Props> = ({ words }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (words.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
            <span className="text-6xl mb-4">📇</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Flashcards Yet</h2>
            <p className="text-gray-500">Save words to your notebook to start learning!</p>
        </div>
     );
  }

  const currentWord = words[currentIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 200);
  };
  
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
    }, 200);
  };

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center pb-20">
      <div className="mb-4 text-center">
         <h2 className="text-xl font-bold text-dark">Flashcards</h2>
         <p className="text-sm text-gray-400">{currentIndex + 1} / {words.length}</p>
      </div>

      {/* Card Container */}
      <div 
        className="relative w-full max-w-sm aspect-[3/4] cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
           
           {/* Front */}
           <div className="absolute w-full h-full bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 backface-hidden border-2 border-transparent hover:border-accent">
              <div className="w-40 h-40 mb-6 rounded-full overflow-hidden shadow-inner bg-gray-100">
                {currentWord.imageUrl ? (
                    <img src={currentWord.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
                )}
              </div>
              <h3 className="text-4xl font-extrabold text-dark break-words w-full">{currentWord.originalText}</h3>
              <p className="mt-4 text-sm text-gray-400 font-semibold uppercase tracking-wider">Tap to flip</p>
           </div>

           {/* Back */}
           <div className="absolute w-full h-full bg-gradient-to-br from-secondary to-orange-400 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 backface-hidden rotate-y-180 overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">{currentWord.originalText}</h3>
              <p className="text-lg font-medium mb-6">{currentWord.definition}</p>
              
              <div className="space-y-3 w-full text-left">
                  {currentWord.examples.slice(0, 1).map((ex, i) => (
                      <div key={i} className="bg-white/20 p-3 rounded-xl">
                          <p className="font-semibold text-sm">{ex.target}</p>
                          <p className="text-xs opacity-80 italic">{ex.native}</p>
                      </div>
                  ))}
              </div>
           </div>

        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-8 mt-8">
          <button onClick={handlePrev} className="p-4 bg-white rounded-full shadow-lg text-gray-600 hover:text-accent hover:scale-110 transition-all">
            ⬅️
          </button>
          <button onClick={handleNext} className="p-4 bg-white rounded-full shadow-lg text-gray-600 hover:text-accent hover:scale-110 transition-all">
            ➡️
          </button>
      </div>

    </div>
  );
};
