import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { Language } from '../types';

interface Props {
  onComplete: (native: Language, target: Language) => void;
}

export const LanguageSelector: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Native, 2: Target
  const [native, setNative] = useState<Language | null>(null);

  const handleSelect = (lang: Language) => {
    if (step === 1) {
      setNative(lang);
      setStep(2);
    } else {
      if (native) {
        onComplete(native, lang);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-light text-dark">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary mb-2">
            LingoSpark AI
          </h1>
          <p className="text-xl font-bold text-gray-700">
            {step === 1 ? "What's your native language?" : "Which language do you want to learn?"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              disabled={step === 2 && lang.code === native?.code} // Prevent selecting same language
              className={`
                p-4 rounded-2xl shadow-sm border-2 border-transparent transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center space-y-2
                ${step === 2 && lang.code === native?.code ? 'opacity-30 cursor-not-allowed grayscale' : 'bg-white hover:border-accent hover:shadow-md'}
              `}
            >
              <span className="text-4xl">{lang.flag}</span>
              <span className="font-semibold text-gray-800">{lang.name}</span>
            </button>
          ))}
        </div>
        
        {step === 2 && (
            <button 
                onClick={() => setStep(1)} 
                className="text-gray-400 underline hover:text-gray-600 text-sm"
            >
                Back to Native Language
            </button>
        )}
      </div>
    </div>
  );
};
