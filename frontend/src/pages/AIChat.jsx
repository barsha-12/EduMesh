import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, Search, Download, Trash2, 
  Plus, Mic, MicOff, Check, Copy, Star,
  Volume2, VolumeX, MessageCircle
} from 'lucide-react';

const PillToggle = ({ label, active, onToggle }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '8px 16px', background: '#F0F2F5', borderRadius: '30px',
    border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
    userSelect: 'none', transition: 'all 0.2s', height: '40px'
  }} onClick={onToggle}>
    <span style={{ fontSize: '11px', fontWeight: '800', color: '#8A929C', letterSpacing: '0.05em' }}>{label}</span>
    <div style={{
      width: '36px', height: '20px', background: active ? '#E8A2A2' : '#D1D5DB',
      borderRadius: '20px', position: 'relative', transition: 'background 0.3s'
    }}>
      <motion.div
        animate={{ x: active ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '16px', height: '16px', background: 'white',
          borderRadius: '50%', position: 'absolute', top: '2px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  </div>
);

const WaveformPill = ({ active, isSpeaking, isAudioEnabled, onToggleAudio }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '8px 20px', background: '#E3F2FD', borderRadius: '30px',
    border: '1px solid rgba(30,136,229,0.1)', cursor: 'pointer',
    minWidth: '160px', height: '40px'
  }}>
    <div onClick={(e) => { e.stopPropagation(); onToggleAudio(); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      {isAudioEnabled ? <Volume2 size={18} color="#42A5F5" /> : <VolumeX size={18} color="#90CAF9" />}
    </div>
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '20px' }}>
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          animate={(active || isSpeaking) && isAudioEnabled ? {
            height: [6, 18, 10, 22, 6][i % 5],
            opacity: [0.6, 1, 0.6]
          } : { height: 3, opacity: 0.2 }}
          transition={{
            repeat: (active || isSpeaking) && isAudioEnabled ? Infinity : 0,
            duration: 0.7,
            delay: i * 0.05,
            ease: "easeInOut"
          }}
          style={{ width: '2px', background: '#42A5F5', borderRadius: '2px' }}
        />
      ))}
    </div>
  </div>
);

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
  const [isEL15, setIsEL15] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedModel, setSelectedModel] = useState('groq'); // 'groq' or 'gemini'
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    // Initialize Speech Recognition
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
        console.error('Speech recognition error:', event.error);
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

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    let msg = inputText.trim();
    if (!msg || isChatLoading) return;

    if (!activeChatSessionId) {
      const newId = await createChatSession(msg.slice(0, 30));
    }

    if (isEL15) {
      msg = `Explain the following to me like I'm 15 years old, using simple analogies and avoiding jargon where possible. Keep it engaging: ${msg}`;
    }

    setInputText('');
    await addChatMessage({ role: 'user', text: isEL15 ? inputText.trim() : msg, timestamp: Date.now() });
    setChatLoading(true);
    setStreamingMsg('');

    try {
      const historySnapshot = useStudyStore.getState().chatMessages;
      const endpoint = selectedModel === 'gemini' ? '/api/gemini' : '/api/chat';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: historySnapshot.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
          model: selectedModel === 'groq' ? 'llama-3.1-8b-instant' : 'gemini-1.5-flash'
        })
      });

      if (!response.body) throw new Error('No response body');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices[0]?.delta?.content || '';
            accumulated += token;
            setStreamingMsg(accumulated);
          } catch (e) {}
        }
      }

      await addChatMessage({ role: 'ai', text: accumulated, timestamp: Date.now() });
      setStreamingMsg('');
      if (isAudioEnabled) speak(accumulated);
    } catch (err) {
      console.error('Chat error:', err);
      await addChatMessage({ role: 'ai', text: '❌ Service error. Please try again.', timestamp: Date.now() });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', background: 'var(--v-bg)' }}>
      <aside style={{
        width: '260px',
        borderRight: '0.5px solid rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0,0,0,0.02)',
        padding: '16px 12px',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <button 
          onClick={() => createChatSession()}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            background: 'white',
            border: '1px solid rgba(0,0,0,0.1)',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--v-primary)',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} /> New Chat
        </button>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '8px' }}>Recents</p>
          {chatSessions.map(session => (
            <button
              key={session.id}
              onClick={() => switchChatSession(session.id)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: activeChatSessionId === session.id ? 'var(--v-accent)' : 'transparent',
                border: 'none',
                textAlign: 'left',
                fontSize: '13px',
                color: activeChatSessionId === session.id ? 'var(--v-primary)' : 'var(--v-text)',
                cursor: 'pointer',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'all 0.15s'
              }}
            >
              {session.title || 'Untitled Chat'}
            </button>
          ))}
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <header style={{
          height: '60px', padding: '0 24px',
          borderBottom: '0.5px solid rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--v-bg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--v-primary)', fontFamily: 'Outfit' }}>AI Study Chat</h1>
              <p style={{ fontSize: '11px', color: 'var(--gray-400)', letterSpacing: '.05em', fontWeight: 'bold', textTransform: 'uppercase' }}>Premium research studio</p>
            </div>
            
            <div style={{
              display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', padding: '3px', gap: '2px'
            }}>
              <button 
                onClick={() => setSelectedModel('groq')}
                style={{
                  padding: '5px 12px', fontSize: '11px', borderRadius: '7px', cursor: 'pointer', border: 'none',
                  background: selectedModel === 'groq' ? 'white' : 'transparent',
                  color: selectedModel === 'groq' ? 'var(--v-primary)' : 'var(--gray-400)',
                  fontWeight: '600', boxShadow: selectedModel === 'groq' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Groq 3.1
              </button>
              <button 
                onClick={() => setSelectedModel('gemini')}
                style={{
                  padding: '5px 12px', fontSize: '11px', borderRadius: '7px', cursor: 'pointer', border: 'none',
                  background: selectedModel === 'gemini' ? 'white' : 'transparent',
                  color: selectedModel === 'gemini' ? 'var(--v-primary)' : 'var(--gray-400)',
                  fontWeight: '600', boxShadow: selectedModel === 'gemini' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Gemini 1.5
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <PillToggle label="EL15 MODE" active={isEL15} onToggle={() => setIsEL15(!isEL15)} />
            <WaveformPill 
              active={isRecording} 
              isSpeaking={isSpeaking} 
              isAudioEnabled={isAudioEnabled} 
              onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)} 
            />
            <button 
              onClick={clearChat}
              style={{
                width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                background: '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#8A929C'
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {chatMessages.length === 0 ? (
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', opacity: 0.5 }}>
                  <MessageCircle size={48} strokeWidth={1} style={{ marginBottom: '16px' }} />
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>Select a chat or start teaching {selectedModel === 'gemini' ? 'Gemini' : 'Groq'}.</p>
               </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}>
                  {msg.role === 'ai' && (
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%', background: 'var(--v-primary)',
                      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '600', color: 'white'
                    }}>{selectedModel === 'gemini' ? 'G' : 'E'}</div>
                  )}

                  <div style={{
                    maxWidth: msg.role === 'user' ? '70%' : '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                    background: msg.role === 'user' ? 'var(--v-accent)' : 'white',
                    color: 'var(--v-text)',
                    border: '0.5px solid rgba(0,0,0,0.05)',
                    fontSize: '14px', lineHeight: '1.65',
                    position: 'relative'
                  }} className="group">
                    {msg.role === 'ai' ? (
                      <div className="ai-content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({children}) => <h1 style={{fontSize:'17px',fontWeight:'500',marginBottom:'8px',color:'var(--v-text)',borderBottom:'1px solid var(--v-accent)',paddingBottom:'6px'}}>{children}</h1>,
                            h2: ({children}) => <h2 style={{fontSize:'15px',fontWeight:'500',marginBottom:'6px',color:'var(--v-text)'}}>{children}</h2>,
                            h3: ({children}) => <h3 style={{fontSize:'14px',fontWeight:'500',marginBottom:'5px',color:'var(--v-text)'}}>{children}</h3>,
                            p:  ({children}) => <p style={{marginBottom:'10px',lineHeight:'1.7',fontSize:'14px'}}>{children}</p>,
                            ul: ({children}) => <ul style={{paddingLeft:'18px',marginBottom:'10px',display:'flex',flexDirection:'column',gap:'4px'}}>{children}</ul>,
                            ol: ({children}) => <ol style={{paddingLeft:'18px',marginBottom:'10px',display:'flex',flexDirection:'column',gap:'4px'}}>{children}</ol>,
                            li: ({children}) => <li style={{fontSize:'14px',lineHeight:'1.65',listStyleType:'disc',color:'inherit'}}>{children}</li>,
                            strong: ({children}) => <strong style={{fontWeight:'500',color:'var(--v-primary)'}}>{children}</strong>,
                            code: ({inline,children}) => inline
                              ? <code style={{fontFamily:'monospace',fontSize:'12px',background:'var(--v-surface)',color:'var(--v-text)',padding:'1px 5px',borderRadius:'4px'}}>{children}</code>
                              : <pre style={{background:'var(--v-bg)',border:'0.5px solid rgba(0,0,0,0.1)',borderRadius:'8px',padding:'12px 14px',overflowX:'auto',marginBottom:'12px'}}><code style={{fontFamily:'monospace',fontSize:'12.5px'}}>{children}</code></pre>,
                            hr: () => <hr style={{border:'none',borderTop:'0.5px solid rgba(0,0,0,0.1)',margin:'12px 0'}}/>,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}

                    {msg.role === 'ai' && (
                      <div style={{
                        position: 'absolute', top: 0, left: '100%', marginLeft: '8px',
                        display: 'flex', gap: '4px', opacity: 0, transition: 'opacity 0.2s'
                      }} className="group-hover:opacity-100">
                        <button onClick={() => speak(msg.text)} style={{background:'white',border:'0.5px solid rgba(0,0,0,0.1)',borderRadius:'8px',padding:'4px',cursor:'pointer'}}>
                          <Volume2 size={14} />
                        </button>
                        <button onClick={() => toggleBookmarkMessage(chatMessages.indexOf(msg))} style={{background:'white',border:'0.5px solid rgba(0,0,0,0.1)',borderRadius:'8px',padding:'4px',cursor:'pointer'}}>
                          <Star size={14} className={msg.isBookmarked ? 'fill-current text-amber-500' : ''} />
                        </button>
                        <button onClick={() => handleCopy(msg.text, i)} style={{background:'white',border:'0.5px solid rgba(0,0,0,0.1)',borderRadius:'8px',padding:'4px',cursor:'pointer'}}>
                          {copiedIndex === i ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isChatLoading && (
               <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                 <div style={{
                   width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)',
                   flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                 }}>
                   <div className="w-4 h-4 rounded-full border-2 border-v-primary border-t-transparent animate-spin" />
                 </div>
                 <div style={{
                   padding: '12px 18px', borderRadius: '4px 18px 18px 18px',
                   background: 'white', color: 'var(--gray-400)', border: '0.5px solid rgba(0,0,0,0.05)',
                   fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px'
                 }}>
                   Thinking...
                   <span className="flex gap-1">
                     <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>.</motion.span>
                     <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                     <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
                   </span>
                 </div>
               </div>
            )}

            {streamingMsg && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%', background: 'var(--v-primary)',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: '600', color: 'white'
                }}>{selectedModel === 'gemini' ? 'G' : 'E'}</div>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: '4px 18px 18px 18px',
                  background: 'white', color: 'var(--v-text)', border: '0.5px solid rgba(0,0,0,0.05)',
                  fontSize: '14px', lineHeight: '1.65'
                }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingMsg}</ReactMarkdown>
                  <span className="animate-blink" style={{ fontWeight: '300', marginLeft: '2px' }}>▋</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <div style={{
          padding: '10px 12px 10px 16px',
          background: 'white', border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '16px', display: 'flex', alignItems: 'flex-end', gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          maxWidth: '760px', margin: '0 auto 20px auto', width: 'calc(100% - 48px)'
        }}>
          <button onClick={() => {}} title="Attach file" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <Plus size={18} strokeWidth={1.75} color="var(--gray-400)" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1} 
            placeholder="Ask anything about your studies..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onInput={autoResize}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
            style={{ flex: 1, resize: 'none', border: 'none', background: 'transparent',
              fontSize: '14px', lineHeight: '1.6', maxHeight: '120px', outline: 'none',
              padding: '4px 0' }}
          />


          <button 
            onClick={() => setIsRecording(!isRecording)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px',
              color: isRecording ? 'var(--v-primary)' : 'var(--gray-400)' }}
          >
            <Mic size={18} strokeWidth={1.75}/>
          </button>

          <button 
            onClick={sendMessage} 
            disabled={!inputText.trim() || isChatLoading}
            style={{
              padding: '7px 14px', borderRadius: '10px', fontSize: '13px',
              background: inputText.trim() ? 'var(--v-primary)' : 'rgba(0,0,0,0.05)',
              color: inputText.trim() ? 'white' : 'var(--gray-400)',
              transition: 'all .15s', border: 'none', 
              cursor: inputText.trim() ? 'pointer' : 'default',
              fontWeight: '600'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
