import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { sendChatMessage } from '../services/ai';
import { supabase } from '../lib/supabase';
import { Send, Sparkles, RotateCcw, User, Lightbulb, BookOpen, HelpCircle, Zap, Mic, X, AlertCircle, Wand2, Volume2, VolumeX } from 'lucide-react';

const Waveform = () => (
  <div className="flex items-center justify-center gap-1 h-8">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ 
          height: [8, 24, 12, 28, 8],
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 0.8, 
          delay: i * 0.05,
          ease: "easeInOut"
        }}
        className="w-1 bg-[#A0C2D2] rounded-full"
      />
    ))}
  </div>
);

export default function AIChat() {
  const { chatMessages, addChatMessage, setChatLoading, isChatLoading, clearChat, loadChatHistory } = useStudyStore();
  const [input, setInput] = useState('');
  const [isELI5, setIsELI5] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showConfusionAlert, setShowConfusionAlert] = useState(false);
  const [isTTSMode, setIsTTSMode] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const location = window.location; // We will check history state manually or use useLocation

  useEffect(() => {
    const init = async () => {
      await loadChatHistory();
      
      // Handle incoming redirect state (e.g. from Quiz Weakness Report)
      const state = window.history.state?.usr;
      if (state?.initialMsg) {
        // Clear history state to avoid re-triggering on refresh
        window.history.replaceState({}, document.title);
        handleSend(null, state.initialMsg);
      }
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const detectConfusion = (text) => {
     const keywords = ['confused', 'dont understand', 'don\'t understand', 'hard to follow', 'what?', 'explain again', 'not clear', 'complex'];
     return keywords.some(k => text.toLowerCase().includes(k));
  };

  const handleSend = async (e, forcedText = null) => {
    if (e) e.preventDefault();
    const msg = forcedText || input.trim();
    if (!msg || isChatLoading) return;

    if (!forcedText) setInput('');
    setShowConfusionAlert(false);

    // Initial message
    await addChatMessage({ role: 'user', text: msg, timestamp: Date.now() });
    setChatLoading(true);

    // Confusion Check
    if (detectConfusion(msg)) {
       setShowConfusionAlert(true);
    }

    try {
      const promptContext = isELI5 
        ? "Explain this concept to me like I am a 5 year old. Keep it extremely simple, use basic analogies, and avoid complex jargon."
        : "You are EduMesh AI — a friendly, helpful study tutor for college students. Answer clearly with examples. Use markdown formatting for structure. Keep responses concise but thorough.";
        
      // Pass the *entire* history array from the store to cleanly align the Groq memory cache!
      const historySnapshot = useStudyStore.getState().chatMessages;
      
      const reply = await sendChatMessage(`[SYSTEM CONTEXT: ${promptContext}]\n\nStudent's question: ${msg}`, historySnapshot);
      await addChatMessage({ role: 'ai', text: reply, timestamp: Date.now() });
    

      // TTS Playback logic
      if (isTTSMode && 'speechSynthesis' in window) {
        setIsPlayingAudio(true);
        // Stripping markdown syntax so the voice reads purely text
        const cleanText = reply.replace(/(\*|_|#|`)/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }

    } catch (err) {
      await addChatMessage({ role: 'ai', text: '❌ Something went wrong. Please try again.', timestamp: Date.now() });
    }

    setChatLoading(false);
  };

  const activateELI5 = () => {
     setIsELI5(true);
     setShowConfusionAlert(false);
     handleSend(null, "Can you explain that last part much more simply?");
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const saveToNotes = async (content) => {
     alert('Added to your notes data!');
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleNewChat = () => {
    clearChat();
  };

  const quickQuestions = [
    { icon: Lightbulb, text: 'Explain Newton\'s Laws of Motion simply', color: 'text-amber-400' },
    { icon: BookOpen, text: 'What is Object Oriented Programming?', color: 'text-blue-400' },
    { icon: HelpCircle, text: 'How does photosynthesis work?', color: 'text-emerald-400' },
    { icon: Zap, text: 'Explain Big O notation with examples', color: 'text-purple-400' },
  ];

  const renderMessageText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="font-bold text-sm mt-3 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="font-bold mt-3 mb-1">{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="font-bold text-lg mt-3 mb-1">{line.slice(2)}</h1>;
      
      let processed = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      const boldParts = [];
      let lastIdx = 0;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIdx) boldParts.push(line.slice(lastIdx, match.index));
        boldParts.push(<strong key={`b-${i}-${match.index}`} className="font-bold">{match[1]}</strong>);
        lastIdx = match.index + match[0].length;
      }
      if (boldParts.length > 0) {
        if (lastIdx < line.length) boldParts.push(line.slice(lastIdx));
        processed = boldParts;
      }

      if (typeof processed === 'string' && processed.includes('`')) {
        const parts = processed.split(/`([^`]+)`/);
        processed = parts.map((part, j) => 
          j % 2 === 1 ? <code key={`c-${i}-${j}`} className="bg-[#A0C2D2]/10 px-1.5 py-0.5 rounded text-xs font-mono text-[#A0C2D2]">{part}</code> : part
        );
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{typeof processed === 'string' ? line.slice(2) : processed}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">{typeof processed === 'string' ? line.replace(/^\d+\.\s/, '') : processed}</li>;
      }

      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm leading-relaxed mb-1">{Array.isArray(processed) ? processed : processed}</p>;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#050510]">
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-6 sm:py-10">
        {/* Chat Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A0C2D2] to-purple-600 flex items-center justify-center shadow-lg shadow-[#A0C2D2]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>AI Study Chat</h1>
              <p className="text-xs text-gray-400">Ask EduMesh AI any academic question</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10">
               <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">ELI5 Mode</span>
               <button 
                onClick={() => setIsELI5(!isELI5)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isELI5 ? 'bg-[#A0C2D2]' : 'bg-gray-300 dark:bg-white/10'}`}
               >
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isELI5 ? 'left-6' : 'left-1'}`} />
               </button>
             </div>
            <button
              onClick={() => {
                if (isTTSMode && isPlayingAudio) {
                  window.speechSynthesis.cancel();
                  setIsPlayingAudio(false);
                }
                setIsTTSMode(!isTTSMode);
              }}
              className={`p-2.5 rounded-2xl transition-all flex items-center gap-2 ${isTTSMode ? 'bg-[#A0C2D2]/20 text-[#A0C2D2]' : 'bg-black/5 dark:bg-white/5 text-gray-400'}`}
              title="Toggle Read Aloud"
            >
              {isTTSMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {isPlayingAudio && <Waveform />}
            </button>
            <button
              onClick={handleNewChat}
              className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-500 hover:text-[#A0C2D2] transition-colors"
              title="New Chat"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Confusion Alert Overlay */}
        <AnimatePresence>
          {showConfusionAlert && !isChatLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="mb-4 m3-card !bg-amber-500/10 border-amber-500/20 !p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                  <AlertCircle className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Are you feeling confused?</p>
                  <p className="text-xs text-amber-800/60 dark:text-amber-200/50">I detected some difficulty. Would you like a simpler breakdown?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowConfusionAlert(false)}
                  className="px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-200/50 hover:underline"
                >
                  Ignore
                </button>
                <button 
                  onClick={activateELI5}
                  className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Wand2 size={14} /> Simplify (ELI5)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto chat-scrollbar rounded-3xl surface-low border border-gray-100 dark:border-white/5 p-4 sm:p-8 space-y-6 mb-6 shadow-inner relative">
          {chatMessages.length === 0 && !isChatLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 py-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 rounded-3xl bg-[#A0C2D2]/10 flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-[#A0C2D2]" />
              </motion.div>
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold">How can I help you today?</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Get instant explanations, problem solutions, <br /> and deep dives into any study topic.
                </p>
              </div>

              {/* Quick Question Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                {quickQuestions.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => handleQuickQuestion(q.text)}
                    className="m3-card !p-4 !rounded-2xl text-left group border border-transparent hover:border-[#A0C2D2]/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#A0C2D2]/10 transition-colors`}>
                        <q.icon className={`w-5 h-5 ${q.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors leading-snug">
                        {q.text}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-1 shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-[#A0C2D2]' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5'
                    }`}>
                      {msg.role === 'user' 
                        ? <User className="w-5 h-5 text-white" /> 
                        : <Sparkles className="w-5 h-5 text-[#A0C2D2]" />
                      }
                    </div>
                    <div className={`p-5 rounded-3xl text-sm leading-relaxed relative group ${
                      msg.role === 'user'
                        ? 'bg-[#A0C2D2] text-white rounded-tr-sm shadow-md'
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.role === 'ai' ? renderMessageText(msg.text) : msg.text}
                      
                      {msg.role === 'ai' && (
                        <div className="absolute top-2 -right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => saveToNotes(msg.text)}
                            className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-md rounded-full text-gray-400 hover:text-[#A0C2D2] transition-colors"
                            title="Save as study note"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isChatLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 text-[#A0C2D2]" />
                  </div>
                  <div className="p-5 rounded-3xl rounded-tl-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5">
                    <div className="typing-indicator flex gap-1.5">
                      <span className="bg-[#A0C2D2]/50"></span>
                      <span className="bg-[#A0C2D2]/50"></span>
                      <span className="bg-[#A0C2D2]/50"></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="relative">
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute -top-16 left-0 right-0 m3-card !py-2 !px-6 flex items-center justify-between shadow-2xl border-[#A0C2D2]/30 ring-1 ring-[#A0C2D2]/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Listening...</span>
                </div>
                <Waveform />
                <button onClick={() => setIsRecording(false)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400">
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="m3-card !p-2 flex gap-2 items-center shadow-xl border-gray-100 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isRecording ? "" : "Ask me anything about your studies..."}
              className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm placeholder-gray-400 dark:text-white"
              disabled={isChatLoading || isRecording}
            />
            
            <button
              type="button"
              onClick={startVoiceInput}
              className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#A0C2D2]'}`}
              title="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              type="submit"
              disabled={!input.trim() || isChatLoading}
              className="w-12 h-12 rounded-2xl bg-[#A0C2D2] text-white flex items-center justify-center shadow-lg shadow-[#A0C2D2]/30 disabled:opacity-30 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
