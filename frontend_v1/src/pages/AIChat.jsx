import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { sendChatMessage, resetChat } from '../services/ai';
import Navbar from '../components/ui/Navbar';
import { Send, Sparkles, RotateCcw, User, Lightbulb, BookOpen, HelpCircle, Zap } from 'lucide-react';

export default function AIChat() {
  const { chatMessages, addChatMessage, setChatLoading, isChatLoading, clearChat, updateStats, addSubjectStudied } = useStudyStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || isChatLoading) return;

    setInput('');
    addChatMessage({ role: 'user', text: msg, timestamp: Date.now() });
    setChatLoading(true);

    try {
      const reply = await sendChatMessage(
        `You are EduMesh AI — a friendly, helpful study tutor for college students. Answer clearly with examples. Use markdown formatting for structure. Keep responses concise but thorough.\n\nStudent's question: ${msg}`
      );
      addChatMessage({ role: 'ai', text: reply, timestamp: Date.now() });
      updateStats({ totalStudyMinutes: (useStudyStore.getState().studyStats.totalStudyMinutes || 0) + 2 });
    } catch (err) {
      addChatMessage({ role: 'ai', text: '❌ Something went wrong. Please try again.', timestamp: Date.now() });
    }

    setChatLoading(false);
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleNewChat = () => {
    clearChat();
    resetChat();
  };

  const quickQuestions = [
    { icon: Lightbulb, text: 'Explain Newton\'s Laws of Motion simply', color: 'text-amber-400' },
    { icon: BookOpen, text: 'What is Object Oriented Programming?', color: 'text-blue-400' },
    { icon: HelpCircle, text: 'How does photosynthesis work?', color: 'text-emerald-400' },
    { icon: Zap, text: 'Explain Big O notation with examples', color: 'text-purple-400' },
  ];

  const renderMessageText = (text) => {
    // Simple markdown rendering
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('### ')) return <h3 key={i} className="font-bold text-sm mt-3 mb-1 text-white">{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="font-bold mt-3 mb-1 text-white">{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="font-bold text-lg mt-3 mb-1 text-white">{line.slice(2)}</h1>;
      
      // Bold text
      let processed = line;
      const boldParts = [];
      let lastIdx = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIdx) boldParts.push(line.slice(lastIdx, match.index));
        boldParts.push(<strong key={`b-${i}-${match.index}`} className="font-bold text-white">{match[1]}</strong>);
        lastIdx = match.index + match[0].length;
      }
      if (boldParts.length > 0) {
        if (lastIdx < line.length) boldParts.push(line.slice(lastIdx));
        processed = boldParts;
      }

      // Inline code
      if (typeof processed === 'string' && processed.includes('`')) {
        const parts = processed.split(/`([^`]+)`/);
        processed = parts.map((part, j) => 
          j % 2 === 1 ? <code key={`c-${i}-${j}`} className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-300">{part}</code> : part
        );
      }

      // Bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{typeof processed === 'string' ? line.slice(2) : processed}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">{typeof processed === 'string' ? line.replace(/^\d+\.\s/, '') : processed}</li>;
      }

      // Empty line
      if (line.trim() === '') return <br key={i} />;

      // Normal paragraph
      return <p key={i} className="text-sm leading-relaxed mb-1">{Array.isArray(processed) ? processed : processed}</p>;
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pt-20 pb-4">
        {/* Chat Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>AI Study Chat</h1>
              <p className="text-xs text-white/40">Ask me anything about your studies</p>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="btn-secondary !px-3 !py-2 flex items-center gap-2 !text-xs"
          >
            <RotateCcw size={14} /> New Chat
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto chat-scrollbar rounded-2xl glass p-4 sm:p-6 space-y-4 mb-4">
          {chatMessages.length === 0 && !isChatLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </motion.div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-white/80">What would you like to learn?</h3>
                <p className="text-sm text-white/30 max-w-sm">
                  I can explain concepts, solve problems, and help you understand any topic.
                </p>
              </div>

              {/* Quick Question Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-4">
                {quickQuestions.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => handleQuickQuestion(q.text)}
                    className="glass-card !p-3 !rounded-xl text-left hover:!border-indigo-500/30 group"
                  >
                    <div className="flex items-start gap-2">
                      <q.icon className={`w-4 h-4 mt-0.5 ${q.color} shrink-0`} />
                      <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                        {q.text}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-500' 
                        : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20'
                    }`}>
                      {msg.role === 'user' 
                        ? <User className="w-3.5 h-3.5 text-white" /> 
                        : <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      }
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-white/5 border border-white/5 text-white/80 rounded-tl-sm'
                    }`}>
                      {msg.role === 'ai' ? renderMessageText(msg.text) : msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isChatLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5">
                    <div className="typing-indicator flex gap-1.5">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your studies..."
            className="input-field flex-1 !rounded-xl !py-3"
            disabled={isChatLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isChatLoading}
            className="btn-primary !px-4 !rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </main>
    </div>
  );
}
