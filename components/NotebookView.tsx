import React, { useState } from 'react';
import { WordResult } from '../types';
import { generateStory } from '../services/geminiService';
import { Loading } from './Loading';

interface Props {
  words: WordResult[];
  nativeLang: string;
  onSelectWord: (word: WordResult) => void;
  onDeleteWord: (id: string) => void;
}

export const NotebookView: React.FC<Props> = ({ words, nativeLang, onSelectWord, onDeleteWord }) => {
  const [story, setStory] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);

  const handleGenerateStory = async () => {
    if (words.length < 3) return; // Need at least a few words
    setLoadingStory(true);
    setStory(null);
    try {
      const result = await generateStory(words, nativeLang);
      setStory(result);
    } catch (e) {
      console.error(e);
      setStory("Sorry, could not generate a story right now.");
    } finally {
      setLoadingStory(false);
    }
  };

  return (
    <div className="pb-24 space-y-6">
       <div className="flex items-center justify-between">
         <h2 className="text-3xl font-extrabold text-dark">My Notebook</h2>
         <span className="bg-accent/10 text-accent font-bold px-3 py-1 rounded-full text-sm">{words.length} items</span>
       </div>

       {words.length === 0 ? (
         <div className="text-center py-20">
           <p className="text-6xl mb-4">📓</p>
           <p className="text-gray-500 font-medium">Your notebook is empty.</p>
           <p className="text-gray-400 text-sm">Search and save words to fill it up!</p>
         </div>
       ) : (
         <>
           {/* Story Generator */}
           <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-3xl shadow-sm border border-purple-200">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-purple-900">✨ Magic Story Mode</h3>
               <button 
                 onClick={handleGenerateStory}
                 disabled={loadingStory || words.length < 3}
                 className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold shadow hover:bg-purple-700 transition disabled:opacity-50 text-sm"
               >
                 {loadingStory ? 'Weaving...' : 'Create Story'}
               </button>
             </div>
             
             {loadingStory && <Loading message="Weaving your words into a tale..." />}
             
             {!loadingStory && story && (
               <div className="bg-white/80 p-4 rounded-xl text-gray-800 leading-relaxed max-h-60 overflow-y-auto">
                 {/* Render basic markdown/bolding nicely */}
                 {story.split('\n').map((line, i) => (
                    <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<b class="text-purple-700">$1</b>') }}></p>
                 ))}
               </div>
             )}
             {!loadingStory && !story && words.length < 3 && (
                 <p className="text-purple-800/60 text-sm italic">Save at least 3 words to generate a story!</p>
             )}
           </div>

           {/* Word List */}
           <div className="grid gap-3">
             {words.map((word) => (
               <div key={word.id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center group">
                 <div onClick={() => onSelectWord(word)} className="cursor-pointer flex-1">
                   <h4 className="text-xl font-bold text-gray-800">{word.originalText}</h4>
                   <p className="text-gray-500 truncate text-sm">{word.definition}</p>
                 </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteWord(word.id); }}
                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                 </button>
               </div>
             ))}
           </div>
         </>
       )}
    </div>
  );
};
