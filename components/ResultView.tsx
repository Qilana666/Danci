import React, { useState, useEffect, useRef } from 'react';
import { WordResult, ChatMessage } from '../types';
import { playAudioFromBase64 } from '../services/audioService';
import { generateSpeech, createChatSession } from '../services/geminiService';
import { Chat } from '@google/genai';

interface Props {
  result: WordResult;
  onSave: (result: WordResult) => void;
  isSaved: boolean;
}

export const ResultView: React.FC<Props> = ({ result, onSave, isSaved }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [audioLoading, setAudioLoading] = useState<string | null>(null); // 'main' or index of example
  
  const chatSessionRef = useRef<Chat | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session
  useEffect(() => {
    chatSessionRef.current = createChatSession(
      `Word: ${result.originalText}. Definition: ${result.definition}. Usage: ${result.usageNotes}`,
      result.nativeLang
    );
    // Reset history when result changes
    setChatHistory([]);
  }, [result]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatting]);

  const handlePlayAudio = async (text: string, id: string) => {
    if (audioLoading) return;
    setAudioLoading(id);
    const audioData = await generateSpeech(text);
    if (audioData) {
      await playAudioFromBase64(audioData);
    }
    setAudioLoading(null);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const modelMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: response.text || "Sorry, I couldn't understand that."
      };
      setChatHistory(prev => [...prev, modelMsg]);
    } catch (e) {
      console.error("Chat error", e);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="pb-24 space-y-6 animate-fade-in-up">
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="relative h-64 bg-gray-100">
           {result.imageUrl ? (
             <img src={result.imageUrl} alt={result.originalText} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
           )}
           <div className="absolute top-4 right-4">
             <button
               onClick={() => onSave(result)}
               className={`p-3 rounded-full shadow-lg transition-colors ${isSaved ? 'bg-secondary text-white' : 'bg-white text-gray-400'}`}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
               </svg>
             </button>
           </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-4xl font-extrabold text-dark">{result.originalText}</h2>
            <button 
              onClick={() => handlePlayAudio(result.originalText, 'main')}
              disabled={!!audioLoading}
              className={`p-2 rounded-full bg-primary/20 text-yellow-700 hover:bg-primary/40 ${audioLoading === 'main' ? 'animate-pulse' : ''}`}
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <p className="text-lg text-gray-600 font-medium mb-4">{result.definition}</p>
          
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <div className="flex items-start">
                <span className="text-2xl mr-3">💡</span>
                <p className="text-gray-700 italic leading-relaxed text-sm">{result.usageNotes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-dark ml-2">Examples</h3>
        {result.examples.map((ex, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start">
               <p className="text-lg font-semibold text-gray-800 mb-1">{ex.target}</p>
               <button 
                  onClick={() => handlePlayAudio(ex.target, `ex-${idx}`)}
                  disabled={!!audioLoading}
                  className="text-accent hover:text-teal-600 ml-2"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 11H2.75A.75.75 0 012 10.25v-1.5A.75.75 0 012.75 8h1.836l3.707-5.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
               </button>
             </div>
             <p className="text-gray-500">{ex.native}</p>
          </div>
        ))}
      </div>

      {/* Chat Section */}
      <div className="bg-white rounded-3xl shadow-md p-4 mt-6">
        <h3 className="text-xl font-bold text-dark mb-4 flex items-center">
            <span className="bg-green-100 p-2 rounded-full mr-2 text-xl">💬</span> 
            Ask me anything!
        </h3>
        <div className="bg-gray-50 h-64 rounded-xl p-4 overflow-y-auto mb-4 scrollbar-hide flex flex-col space-y-3">
          {chatHistory.length === 0 && (
             <p className="text-center text-gray-400 text-sm mt-10">
                Curious about this word? Ask for more examples, synonyms, or grammar tips!
             </p>
          )}
          {chatHistory.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-gray-900 rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex justify-start">
               <div className="bg-gray-200 p-3 rounded-2xl rounded-tl-none animate-pulse w-12 h-8"></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="flex gap-2">
           <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ex: Is this formal?"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
           />
           <button 
             onClick={handleSendMessage}
             disabled={!chatInput.trim() || isChatting}
             className="bg-primary text-dark font-bold rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50"
           >
             ➤
           </button>
        </div>
      </div>
    </div>
  );
};
