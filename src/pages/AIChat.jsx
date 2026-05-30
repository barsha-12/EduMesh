import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, Trash2, Plus, Mic, Check, Copy, Star,
  Volume2, VolumeX, Paperclip, Bot, FileText, X
} from 'lucide-react';
import { sendChatMessage, sendChatWithDocument } from '../services/ai';
import GlassCard from '../components/ui/GlassCard';

const quickTopics = [
  { label: 'Mathematics', color: 'bg-periwinkle/25' },
  { label: 'Physics', color: 'bg-seafoam/25' },
  { label: 'Chemistry', color: 'bg-lemon/25' },
  { label: 'Biology', color: 'bg-mint/25' },
  { label: 'History', color: 'bg-peach/25' },
  { label: 'Literature', color: 'bg-lilac/25' },
];

export default function AIChat() {
  const { 
    chatMessages, addChatMessage, setChatLoading, 
    isChatLoading, clearChat, toggleBookmarkMessage,
    chatSessions, activeChatSessionId, switchChatSession, createChatSession, loadChatHistory
  } = useStudyStore();
  
  const [inputText, setInputText] = useState('');
  const [streamingMsg, setStreamingMsg] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFileText, setAttachedFileText] = useState('');
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText(prev => (prev + ' ' + finalTranscript).trim());
        }
      };
      recognitionRef.current.onend = () => {
        if (isRecording) {
          try { recognitionRef.current.start(); } catch(e) {}
        }
      };
      recognitionRef.current.onerror = (event) => {
        if (event.error !== 'no-speech') setIsRecording(false);
      };
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      try { recognitionRef.current?.start(); } catch(e) {}
    } else {
      recognitionRef.current?.stop();
    }
  }, [isRecording]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, streamingMsg, isChatLoading]);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const speak = useCallback((text) => {
    if (!isAudioEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [isAudioEnabled]);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachedFile(file);
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedFileText(ev.target.result);
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  const clearAttachedFile = () => {
    setAttachedFile(null);
    setAttachedFileText('');
  };

  const handleClearChat = () => {
    clearChat();
    clearAttachedFile();
  };

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    let msg = inputText.trim();
    if ((!msg && !attachedFileText) || isChatLoading) return;

    if (!activeChatSessionId) {
      await createChatSession(msg.slice(0, 30) || 'Document Chat');
    }

    setInputText('');
    const userMsgText = attachedFile ? `[Attached File: ${attachedFile.name}]\n${msg}` : msg;
    const userMsg = { role: 'user', text: userMsgText, timestamp: Date.now() };
    const updatedMsgs = [...useStudyStore.getState().chatMessages, userMsg];
    
    await addChatMessage(userMsg);
    setChatLoading(true);
    setStreamingMsg('');

    try {
      let finalReply;
      if (attachedFileText) {
        finalReply = await sendChatWithDocument(
          msg || 'Please summarize or analyze this document.',
          attachedFileText,
          updatedMsgs.slice(0, -1),
          (token) => setStreamingMsg(token)
        );
      } else {
        finalReply = await sendChatMessage(
          msg, 
          updatedMsgs.slice(0, -1),
          (token) => setStreamingMsg(token)
        );
      }

      const aiResponse = { role: 'ai', text: finalReply, timestamp: Date.now() };
      await addChatMessage(aiResponse);
      
      setStreamingMsg('');
      if (isAudioEnabled) speak(finalReply);
    } catch (err) {
      const errorMsg = err?.message || '❌ Service error. Please try again.';
      await addChatMessage({ role: 'ai', text: errorMsg, timestamp: Date.now() });
    } finally {
      setChatLoading(false);
      clearAttachedFile();
    }
  };

  const handleQuickTopic = (topic) => {
    setInputText(`Explain ${topic} in simple terms`);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] -m-4 sm:-m-8">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0" style={{ flex: '0 0 70%' }}>
        {/* Chat Header */}
        <GlassCard interactive={false} className="rounded-none border-x-0 border-t-0 flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-seafoam to-mint flex items-center justify-center animate-pulse-soft">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-[1.1rem] text-primary">AI Study Assistant</h1>
              <p className="font-body text-muted text-[0.75rem]">Powered by Groq AI • Llama 3</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAudioEnabled(!isAudioEnabled)} 
              className={`p-2 rounded-lg transition-colors ${isAudioEnabled ? 'bg-[rgba(208,170,255,0.15)] text-lavender' : 'text-muted hover:bg-[rgba(204,204,204,0.1)] hover:text-secondary'}`}
              title={isAudioEnabled ? "Disable Auto Text-to-Speech" : "Enable Auto Text-to-Speech"}
            >
              {isAudioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button 
              onClick={handleClearChat} 
              className="p-2 rounded-lg text-muted hover:bg-[rgba(255,176,176,0.15)] hover:text-rose transition-colors"
              title="Clear Chat"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={() => createChatSession()} 
              className="px-4 py-2 rounded-pill border-[1.5px] border-[rgba(204,204,204,0.5)] text-secondary font-body font-medium text-sm hover:bg-[rgba(204,204,204,0.15)] transition-colors"
            >
              New Chat
            </button>
          </div>
        </GlassCard>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 chat-scroll relative">
          <div className="max-w-[760px] mx-auto flex flex-col gap-5">
            {chatMessages.length === 0 && !streamingMsg && !isChatLoading ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-lavender to-periwinkle flex items-center justify-center mb-4">
                  <Bot size={36} className="text-white" />
                </div>
                <h2 className="font-display font-bold text-xl text-primary mb-2">Ask anything</h2>
                <p className="font-body text-secondary text-sm max-w-sm">Start a conversation with your AI study assistant. Ask questions, get explanations, and learn faster.</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    /* User Bubble */
                    <div className="max-w-[70%] px-[18px] py-3 rounded-[20px_20px_6px_20px] bg-gradient-to-br from-periwinkle to-lavender text-primary shadow-[0_4px_16px_rgba(178,204,255,0.30)] font-body text-[0.95rem] leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  ) : (
                    /* AI Bubble */
                    <div className="max-w-[75%] px-[18px] py-[14px] rounded-[20px_20px_20px_6px] bg-[rgba(255,255,255,0.80)] backdrop-blur-[16px] border-[1.5px] border-[rgba(168,255,236,0.35)] shadow-sm font-body text-[0.95rem] leading-relaxed group relative">
                      <div className="ai-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({children}) => <h1 className="font-display font-bold text-[1.1rem] text-primary mb-2 border-b border-[rgba(204,204,204,0.3)] pb-1">{children}</h1>,
                            h2: ({children}) => <h2 className="font-display font-bold text-base text-primary mb-1.5">{children}</h2>,
                            h3: ({children}) => <h3 className="font-body font-semibold text-sm text-secondary mb-1">{children}</h3>,
                            p: ({children}) => <p className="mb-2.5 leading-[1.7] text-sm">{children}</p>,
                            ul: ({children}) => <ul className="pl-4 mb-2.5 flex flex-col gap-1">{children}</ul>,
                            ol: ({children}) => <ol className="pl-4 mb-2.5 flex flex-col gap-1 list-decimal">{children}</ol>,
                            li: ({children}) => <li className="text-sm leading-relaxed list-disc">{children}</li>,
                            strong: ({children}) => <strong className="font-semibold text-primary bg-[rgba(245,245,168,0.4)] px-0.5">{children}</strong>,
                            code: ({inline, children}) => inline
                              ? <code className="font-mono text-xs bg-[rgba(168,255,236,0.2)] text-primary px-1.5 py-0.5 rounded">{children}</code>
                              : <pre className="bg-[rgba(168,255,236,0.1)] border-l-[3px] border-seafoam rounded-lg p-3 overflow-x-auto mb-3"><code className="font-mono text-xs">{children}</code></pre>,
                            blockquote: ({children}) => <blockquote className="border-l-[3px] border-periwinkle bg-[rgba(208,170,255,0.1)] p-3 mb-3 italic rounded-r-lg">{children}</blockquote>,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                      {/* Hover actions */}
                      <div className="absolute -top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => { window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(msg.text); window.speechSynthesis.speak(utterance); }} className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.9)] shadow-sm border border-[rgba(204,204,204,0.3)] flex items-center justify-center hover:bg-[rgba(208,170,255,0.15)] hover:text-lavender transition-colors">
                          <Volume2 size={12} className="text-secondary" />
                        </button>
                        <button onClick={() => toggleBookmarkMessage(i)} className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.9)] shadow-sm border border-[rgba(204,204,204,0.3)] flex items-center justify-center hover:bg-[rgba(245,245,168,0.3)] transition-colors">
                          <Star size={12} className={msg.isBookmarked ? 'fill-sand text-sand' : 'text-secondary'} />
                        </button>
                        <button onClick={() => handleCopy(msg.text, i)} className="w-7 h-7 rounded-lg bg-[rgba(255,255,255,0.9)] shadow-sm border border-[rgba(204,204,204,0.3)] flex items-center justify-center hover:bg-[rgba(178,255,212,0.3)] transition-colors">
                          {copiedIndex === i ? <Check size={12} className="text-mint" /> : <Copy size={12} className="text-secondary" />}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {/* Typing Indicator */}
            {isChatLoading && !streamingMsg && (
              <div className="flex items-start gap-3">
                <GlassCard interactive={false} className="px-5 py-3 rounded-[20px_20px_20px_6px] border-[1.5px] border-[rgba(168,255,236,0.35)]">
                  <div className="flex gap-1.5 items-center">
                    <motion.div animate={{ scale: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} className="w-2 h-2 rounded-full bg-lavender" />
                    <motion.div animate={{ scale: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-2 h-2 rounded-full bg-lavender" />
                    <motion.div animate={{ scale: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-2 h-2 rounded-full bg-lavender" />
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Streaming message */}
            {streamingMsg && (
              <div className="flex justify-start">
                <div className="max-w-[75%] px-[18px] py-[14px] rounded-[20px_20px_20px_6px] bg-[rgba(255,255,255,0.80)] backdrop-blur-[16px] border-[1.5px] border-[rgba(168,255,236,0.35)] shadow-sm font-body text-sm leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingMsg}</ReactMarkdown>
                  <span className="inline-block w-2 h-4 bg-lavender ml-0.5 animate-pulse rounded-sm"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="px-6 pb-4 relative">
          {/* File Attachment Indicator */}
          {attachedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full mb-2 left-10 bg-[rgba(255,255,255,0.95)] backdrop-blur-md border-[1.5px] border-[rgba(208,170,255,0.3)] px-3 py-1.5 rounded-card flex items-center gap-2 text-sm shadow-sm"
            >
              <FileText size={14} className="text-periwinkle" />
              <span className="truncate max-w-[200px] font-body text-primary font-medium text-xs">{attachedFile.name}</span>
              <button onClick={clearAttachedFile} className="p-1 rounded-md hover:bg-[rgba(255,176,176,0.2)] text-secondary hover:text-rose transition-colors">
                <X size={12} />
              </button>
            </motion.div>
          )}

          <div className="max-w-[760px] mx-auto bg-[rgba(255,255,255,0.90)] backdrop-blur-[12px] border-[1.5px] border-[rgba(208,170,255,0.30)] rounded-pill px-5 py-3 flex items-end gap-3 shadow-sm">
            <label className="cursor-pointer text-muted hover:text-secondary transition-colors pb-0.5 relative" title="Attach text file">
              <Paperclip size={20} />
              <input type="file" accept=".txt,.md,.json,.csv" onChange={handleFileUpload} className="hidden" />
              {attachedFile && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-periwinkle border-2 border-white rounded-full" />}
            </label>
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask your doubt..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onInput={autoResize}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              className="flex-1 resize-none border-none bg-transparent font-body text-base text-primary placeholder:text-muted outline-none max-h-[120px] leading-relaxed py-0.5"
            />
            <button 
              onClick={() => setIsRecording(!isRecording)}
              className={`pb-0.5 transition-colors ${isRecording ? 'text-coral' : 'text-muted hover:text-secondary'}`}
              title="Voice Input"
            >
              <Mic size={20} />
            </button>
            <button 
              onClick={sendMessage}
              disabled={(!inputText.trim() && !attachedFileText) || isChatLoading}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-periwinkle to-lavender flex items-center justify-center text-white shadow-[0_4px_16px_rgba(178,204,255,0.45)] hover:scale-110 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 shrink-0"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Context Panel */}
      <div className="hidden lg:flex flex-col w-[30%] bg-[rgba(242,240,255,0.5)] backdrop-blur-[12px] border-l border-[rgba(208,170,255,0.20)] p-6 overflow-y-auto">
        <h3 className="font-display font-bold text-base text-primary mb-4">Quick Topics</h3>
        <div className="grid grid-cols-2 gap-2 mb-8">
          {quickTopics.map((topic, i) => (
            <button 
              key={i}
              onClick={() => handleQuickTopic(topic.label)}
              className={`${topic.color} border border-[rgba(255,255,255,0.5)] rounded-card px-3 py-3 text-sm font-body font-medium text-primary hover:shadow-md hover:-translate-y-0.5 transition-all text-left`}
            >
              {topic.label}
            </button>
          ))}
        </div>

        <h3 className="font-display font-bold text-base text-primary mb-3">Recent Chats</h3>
        <div className="space-y-2 flex-1">
          {chatSessions.slice(0, 5).map(session => (
            <button
              key={session.id}
              onClick={() => switchChatSession(session.id)}
              className={`w-full text-left px-4 py-3 rounded-[12px] font-body text-sm transition-all truncate ${
                activeChatSessionId === session.id 
                  ? 'bg-[rgba(208,170,255,0.15)] text-primary font-semibold' 
                  : 'text-secondary hover:bg-[rgba(204,204,204,0.15)]'
              }`}
            >
              {session.title || 'Untitled Chat'}
            </button>
          ))}
        </div>

        <p className="font-body text-muted text-[0.7rem] mt-4 text-center">Groq AI responds in ~1s</p>
      </div>
    </div>
  );
}
