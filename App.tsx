import React, { useState, useEffect } from 'react';
import { AppView, Language, WordResult } from './types';
import { LanguageSelector } from './components/LanguageSelector';
import { Navigation } from './components/Navigation';
import { ResultView } from './components/ResultView';
import { NotebookView } from './components/NotebookView';
import { FlashcardMode } from './components/FlashcardMode';
import { Loading } from './components/Loading';
import { analyzeText, generateImage } from './services/geminiService';

export default function App() {
  // State
  const [nativeLang, setNativeLang] = useState<Language | null>(null);
  const [targetLang, setTargetLang] = useState<Language | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LANGUAGE_SELECT);
  
  const [inputText, setInputText] = useState('');
  const [currentResult, setCurrentResult] = useState<WordResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [notebook, setNotebook] = useState<WordResult[]>([]);

  // Initialize view based on language selection
  const handleLanguageComplete = (native: Language, target: Language) => {
    setNativeLang(native);
    setTargetLang(target);
    setCurrentView(AppView.SEARCH);
  };

  // Search/Analyze Logic
  const handleSearch = async () => {
    if (!inputText.trim() || !nativeLang || !targetLang) return;
    
    setIsLoading(true);
    setCurrentResult(null);
    setCurrentView(AppView.RESULT);

    try {
      // 1. Text Analysis
      const analysis = await analyzeText(inputText, targetLang.name, nativeLang.name);
      
      // 2. Image Generation (Parallel-ish, but let's wait to keep logic simple for now or better user feedback)
      // We start image generation after text to use the optimized prompt from analysis
      let imageUrl = undefined;
      if (analysis.imagePrompt) {
          const img = await generateImage(analysis.imagePrompt);
          if (img) imageUrl = img;
      }

      const newResult: WordResult = {
        id: Date.now().toString(),
        originalText: inputText,
        targetLang: targetLang.name,
        nativeLang: nativeLang.name,
        definition: analysis.definition,
        examples: analysis.examples,
        usageNotes: analysis.usageNotes,
        imageUrl: imageUrl,
        timestamp: Date.now(),
      };

      setCurrentResult(newResult);
    } catch (error) {
      console.error("Search Failed", error);
      alert("Something went wrong. Please try again.");
      setCurrentView(AppView.SEARCH);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  // Notebook Operations
  const saveToNotebook = (item: WordResult) => {
    if (!notebook.find(w => w.id === item.id)) {
      setNotebook(prev => [item, ...prev]);
    }
  };

  const deleteFromNotebook = (id: string) => {
    setNotebook(prev => prev.filter(w => w.id !== id));
  };

  // Render Logic
  if (currentView === AppView.LANGUAGE_SELECT) {
    return <LanguageSelector onComplete={handleLanguageComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 text-gray-800 font-sans">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary cursor-pointer" onClick={() => setCurrentView(AppView.SEARCH)}>
          LingoSpark
        </h1>
        <div className="flex gap-2 text-2xl">
           <span title={`Native: ${nativeLang?.name}`}>{nativeLang?.flag}</span>
           <span className="text-gray-300">→</span>
           <span title={`Target: ${targetLang?.name}`}>{targetLang?.flag}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-6 pb-24 min-h-[80vh]">
        
        {/* Search View */}
        {currentView === AppView.SEARCH && (
          <div className="flex flex-col h-full justify-center pt-20">
             <div className="mb-10 text-center">
               <h2 className="text-4xl font-black text-dark mb-4">What do you want to say?</h2>
               <p className="text-gray-500">Enter a word, phrase, or sentence.</p>
             </div>
             <div className="relative">
               <textarea
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSearch();
                    }
                 }}
                 placeholder={`Type in ${targetLang?.name || 'target language'}...`}
                 className="w-full h-40 p-6 text-2xl font-bold bg-white rounded-3xl shadow-lg border-2 border-transparent focus:border-primary focus:outline-none resize-none placeholder-gray-300"
               />
               <button 
                 onClick={handleSearch}
                 disabled={!inputText.trim()}
                 className="absolute -bottom-6 right-6 bg-secondary text-white p-4 rounded-full shadow-xl hover:bg-red-500 transition-transform transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
               </button>
             </div>
          </div>
        )}

        {/* Result View (Handling Loading & Display) */}
        {currentView === AppView.RESULT && (
           <>
             {isLoading ? (
               <Loading message="Asking the AI wizard..." />
             ) : currentResult ? (
               <ResultView 
                 result={currentResult} 
                 onSave={saveToNotebook} 
                 isSaved={!!notebook.find(w => w.id === currentResult.id)}
               />
             ) : (
                 // Fallback if result is null but view is result
                 <div className="text-center mt-20">
                     <button onClick={() => setCurrentView(AppView.SEARCH)} className="text-secondary underline">Go Back</button>
                 </div>
             )}
           </>
        )}

        {/* Notebook View */}
        {currentView === AppView.NOTEBOOK && (
            <NotebookView 
                words={notebook} 
                nativeLang={nativeLang?.name || 'English'}
                onSelectWord={(word) => {
                    setCurrentResult(word);
                    setCurrentView(AppView.RESULT);
                }}
                onDeleteWord={deleteFromNotebook}
            />
        )}

        {/* Flashcards View */}
        {currentView === AppView.FLASHCARDS && (
            <FlashcardMode words={notebook} />
        )}

      </main>

      {/* Bottom Nav */}
      <Navigation currentView={currentView} setView={setCurrentView} />
    </div>
  );
}
