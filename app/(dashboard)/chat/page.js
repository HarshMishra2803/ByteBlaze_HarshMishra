'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Sparkles, Scale, Info, MessageSquare, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    setHistoryError('');
    try {
      console.log('Fetching legal chat history...');
      const res = await fetch('/api/chat');
      const data = await res.json();
      
      console.log('Chat history data received:', data);
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync with chat vault');
      }

      if (data.history) {
        setMessages(
          data.history.map((h) => ({
            role: h.role,
            content: h.message,
            time: new Date(h.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
      setHistoryError(err.message || 'Unable to retrieve previous consultations.');
    } finally {
      setLoadingHistory(false);
      console.log('Chat history loading complete.');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('Consulting AI with message:', userMessage.content);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      });

      console.log('Consult API response status:', res.status);
      const data = await res.json();
      console.log('Consult data received:', data);

      if (!res.ok) throw new Error(data.error || 'AI responded with an error');

      if (data.response) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        console.log('AI response rendered successfully.');
      }
    } catch (err) {
      console.error('Consultation failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered a discrepancy: ${err.message}. Please try again.`,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
      console.log('Consultation lifecycle complete.');
    }
  };

  const clearChat = async () => {
    if (!confirm('Are you sure you want to clear your entire chat vault? This cannot be undone.')) return;
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  const suggestedQuestions = [
    'What should I check in a rental agreement?',
    'Explain the purpose of an NDA.',
    'What are employee rights in India?',
    'How to terminate a business contract?'
  ];

  return (
    <div style={{ height: 'calc(100vh - 96px)', display: 'flex', flexDirection: 'column', backgroundColor: '#0B1220' }}>
      {/* Premium Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>Legal Assistant</h1>
          <p style={{ color: '#9CA3AF', fontSize: '1rem' }}>Expert AI advice on documents and legal queries.</p>
        </div>
        {messages.length > 0 && (
          <button 
            className="btn" 
            onClick={clearChat} 
            id="clear-chat" 
            style={{ background: 'transparent', border: '1px solid #374151', color: '#EF4444', padding: '8px 16px', borderRadius: 12 }}
          >
            <Trash2 size={15} /> Clear Vault
          </button>
        )}
      </div>

      {/* Modern Chat Container */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden', 
        backgroundColor: '#111827',
        borderRadius: 24,
        border: '1px solid #374151',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Chat History View */}
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          {loadingHistory ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="spinner" style={{ borderColor: '#6366F1' }}></div>
              <p style={{ color: '#9CA3AF', marginTop: 16, fontWeight: 500 }}>Unlocking consultation history...</p>
            </div>
          ) : historyError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Info size={32} />
              </div>
              <p style={{ fontWeight: 600, color: '#F87171', marginBottom: 16, fontSize: '1.125rem' }}>{historyError}</p>
              <button className="btn btn-primary" onClick={fetchHistory} style={{ borderRadius: 12 }}>Retry History Sync</button>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', maxWidth: 700, margin: '60px auto' }}>
              <div style={{ 
                width: 80, height: 80, borderRadius: 24,
                background: 'linear-gradient(135deg, #6366F1, #22D3EE)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                color: 'white',
                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
              }}>
                <Sparkles size={40} />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>How can I assist you today?</h3>
              <p style={{ fontSize: '1.125rem', color: '#9CA3AF', marginBottom: 48, lineHeight: 1.6 }}>
                Your specialized AI legal consultant. Draft documents, identify risks, or clarify complex legal clauses instantly.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    style={{ 
                      padding: '20px', 
                      fontSize: '0.875rem', 
                      textAlign: 'left', 
                      cursor: 'pointer',
                      background: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: 16,
                      color: '#E5E7EB',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  >
                    <div style={{ color: '#6366F1', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                      <Sparkles size={14} /> Suggested Query
                    </div>
                    <div style={{ fontWeight: 500, lineHeight: 1.4 }}>{q}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' 
                  }}
                  className="animate-fade-up"
                >
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: '#6B7280', 
                    marginBottom: 8, 
                    display: 'flex', 
                    alignItems: msg.role === 'user' ? 'row-reverse' : 'row', 
                    gap: 8,
                    padding: '0 4px'
                  }}>
                    <span>{msg.role === 'user' ? 'CLIENT' : 'LEGAL AI'}</span>
                    <span>·</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="markdown-content" style={{ 
                    padding: '16px 24px', 
                    borderRadius: 20, 
                    maxWidth: '80%', 
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    background: msg.role === 'user' ? '#6366F1' : '#1F2937',
                    color: msg.role === 'user' ? '#FFFFFF' : '#E5E7EB',
                    boxShadow: msg.role === 'user' ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                    border: msg.role === 'user' ? '1px solid #4f46e5' : '1px solid #374151',
                  }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: 32 }} className="animate-fade-up">
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>LEGAL AI</div>
              <div style={{ padding: '16px 24px', borderRadius: 20, background: '#1F2937', border: '1px solid #374151' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderThickness: 2, borderColor: '#6366F1' }}></div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#E5E7EB' }}>Analyzing Statutes & Precedents...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Premium Input Area */}
        <div style={{ padding: '24px 40px 32px', borderTop: '1px solid #374151' }}>
          <form 
            onSubmit={sendMessage} 
            style={{ 
              display: 'flex', 
              gap: 16, 
              padding: '6px 6px 6px 20px', 
              alignItems: 'center', 
              backgroundColor: '#111827',
              borderRadius: 100,
              border: '1px solid #374151',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
              transition: 'border-color 0.2s',
            }}
            onFocusCapture={(e) => { e.currentTarget.style.borderColor = '#6366F1'; }}
            onBlurCapture={(e) => { e.currentTarget.style.borderColor = '#374151'; }}
          >
            <div style={{ color: '#6B7280' }}>
              <MessageSquare size={20} />
            </div>
            <input
              ref={inputRef}
              type="text"
              style={{ 
                flex: 1,
                border: 'none', 
                background: 'transparent', 
                padding: '12px 0', 
                fontSize: '1rem',
                color: '#FFFFFF',
                outline: 'none'
              }}
              placeholder="Ask for legal clarity or draft a clause..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              id="chat-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{ 
                padding: '12px 28px', 
                borderRadius: 100,
                background: '#6366F1',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => { if(!loading) e.currentTarget.style.background = '#4F46E5'; }}
              onMouseOut={(e) => { if(!loading) e.currentTarget.style.background = '#6366F1'; }}
            >
              Consult <Send size={16} />
            </button>
          </form>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: '0.8125rem', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Info size={14} /> <span>Drafting assistant only. Not a substitute for professional legal representation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
