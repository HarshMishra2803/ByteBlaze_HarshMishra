'use client';

import { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Sparkles,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import LanguageToggle from '@/components/LanguageToggle';

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState('simplify');
  const [language, setLanguage] = useState('en');

  const analysisModes = [
    { 
      id: 'simplify', 
      label: 'Simplify', 
      desc: 'Get a clear, plain-language summary of any document.',
      icon: <FileText size={24} /> 
    },
    { 
      id: 'explain', 
      label: 'Clause Explainer', 
      desc: 'Decode jargon and identify potential liability risks.',
      icon: <Search size={24} /> 
    },
    { 
      id: 'compliance', 
      label: 'Compliance Check', 
      desc: 'Review against common legal standards and scores.',
      icon: <Shield size={24} /> 
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Upload & Analyze</h1>
            <p className="page-subtitle">Simplify, explain, and check compliance of legal documents</p>
          </div>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
      </div>

      {/* Selection Cards Grid */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {analysisModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveTab(mode.id)}
            style={{
              flex: '1 1 300px',
              textAlign: 'left',
              padding: '24px',
              backgroundColor: activeTab === mode.id ? 'rgba(99, 102, 241, 0.1)' : '#1F2937',
              border: `2px solid ${activeTab === mode.id ? '#6366F1' : '#374151'}`,
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => { 
              if (activeTab !== mode.id) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#475569';
              }
            }}
            onMouseOut={(e) => { 
              if (activeTab !== mode.id) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#374151';
              }
            }}
          >
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: activeTab === mode.id ? '#6366F1' : 'rgba(255,255,255,0.05)',
              color: activeTab === mode.id ? '#FFFFFF' : '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}>
              {mode.icon}
            </div>
            <div>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 700, 
                color: '#FFFFFF',
                marginBottom: '4px'
              }}>
                {mode.label}
              </h3>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#9CA3AF',
                lineHeight: 1.5
              }}>
                {mode.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
        {activeTab === 'simplify' && <SimplifyTab language={language} />}
        {activeTab === 'explain' && <ExplainTab language={language} />}
        {activeTab === 'compliance' && <ComplianceTab />}
      </div>
    </div>
  );
}

function SimplifyTab({ language }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleSubmit = async () => {
    if (loading) return;
    setError('');
    setLoading(true);
    setResult('');

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);
        res = await fetch('/api/documents/simplify', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/documents/simplify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setResult(data.result);
    } catch (err) {
      setError('Failed to simplify. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
        Upload a legal document or paste its text to get a simplified, easy-to-understand summary.
      </p>

      <div
        className={`upload-zone ${file ? 'has-file' : ''}`}
        onClick={() => fileRef.current?.click()}
        style={{ marginBottom: 24 }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={40} style={{ color: 'var(--risk-low)' }} />
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{file.name}</span>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '6px 16px' }}
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
            >
              Remove File
            </button>
          </div>
        ) : (
          <div>
            <div style={{ 
              width: 56, height: 56, borderRadius: '50%', background: '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Upload size={24} style={{ color: 'var(--accent-indigo)' }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 6 }}>Drop your document here</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 20 }}>PDF, TXT, DOC up to 10MB</p>
            <button className="btn btn-secondary">Choose File</button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 16 }}>
        — or paste text below —
      </div>

      <div className="input-group" style={{ marginBottom: 24 }}>
        <textarea
          className="textarea custom-textarea"
          placeholder="Paste your legal document text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          id="simplify-text"
        />
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      <button
        className="btn btn-primary btn-lg"
        onClick={handleSubmit}
        disabled={loading || (!text.trim() && !file)}
        id="simplify-btn"
      >
        {loading ? <><span className="spinner" /> Analyzing...</> : <><Sparkles size={16} /> Simplify Document</>}
      </button>

      {result && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>📋 Simplified Summary</h3>
          <div className="result-container markdown-content">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function ExplainTab({ language }) {
  const [clause, setClause] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (loading) return;
    setError('');
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/documents/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clause, language }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setResult(data.result);
    } catch (err) {
      setError('Failed to explain clause. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
        Paste a legal clause below to get a plain-language explanation with potential risks highlighted.
      </p>

      <div className="input-group" style={{ marginBottom: 24 }}>
        <label htmlFor="clause-input" style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 8, display: 'block' }}>Legal Clause</label>
        <textarea
          id="clause-input"
          className="textarea custom-textarea"
          placeholder='e.g., "The party of the first part shall indemnify and hold harmless the party of the second part..."'
          value={clause}
          onChange={(e) => setClause(e.target.value)}
          rows={5}
        />
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      <button
        className="btn btn-primary btn-lg"
        onClick={handleSubmit}
        disabled={loading || clause.trim().length < 10}
        id="explain-btn"
      >
        {loading ? <><span className="spinner" /> Explaining...</> : <><Search size={16} /> Explain Clause</>}
      </button>

      {result && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>💡 Clause Explanation</h3>
          <div className="result-container markdown-content">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function ComplianceTab() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleSubmit = async () => {
    if (loading) return;
    setError('');
    setLoading(true);
    setResult(null);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await fetch('/api/documents/compliance', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/documents/compliance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setResult(data.result);
    } catch (err) {
      setError('Failed to check compliance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const riskColors = {
    low: 'var(--risk-low)',
    medium: 'var(--risk-medium)',
    high: 'var(--risk-high)',
  };

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
        Upload or paste a legal document to analyze for missing clauses, risky terms, and get a risk score.
      </p>

      <div
        className={`upload-zone ${file ? 'has-file' : ''}`}
        onClick={() => fileRef.current?.click()}
        style={{ marginBottom: 24 }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={40} style={{ color: 'var(--risk-low)' }} />
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{file.name}</span>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '6px 16px' }}
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
            >
              Remove File
            </button>
          </div>
        ) : (
          <div>
            <div style={{ 
              width: 56, height: 56, borderRadius: '50%', background: '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Upload size={24} style={{ color: 'var(--accent-indigo)' }} />
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 6 }}>Drop your document for compliance</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 20 }}>PDF, TXT, DOC up to 10MB</p>
            <button className="btn btn-secondary">Choose File</button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 16 }}>
        — or paste text below —
      </div>

      <div className="input-group" style={{ marginBottom: 24 }}>
        <textarea
          className="textarea custom-textarea"
          placeholder="Paste your legal document or contract text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          id="compliance-text"
        />
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      <button
        className="btn btn-primary btn-lg"
        onClick={handleSubmit}
        disabled={loading || (!text.trim() && !file)}
        id="compliance-btn"
      >
        {loading ? <><span className="spinner" /> Analyzing...</> : <><Shield size={16} /> Check Compliance</>}
      </button>

      {result && (
        <div style={{ marginTop: 28 }} className="animate-in">
          {/* Risk Score */}
          <div className="risk-score-display">
            <div
              className={`risk-circle ${result.riskScore}`}
              style={{ '--ring-percent': `${result.riskPercentage || 50}%` }}
            >
              {result.riskPercentage || '?'}%
            </div>
            <div
              className="risk-label"
              style={{ color: riskColors[result.riskScore] || 'var(--text-primary)' }}
            >
              {result.riskScore?.toUpperCase()} RISK
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 500 }}>
              {result.summary}
            </p>
          </div>

          {/* Missing Clauses */}
          {result.missingClauses?.length > 0 && (
            <div className="compliance-section">
              <h3><AlertTriangle size={16} style={{ color: 'var(--risk-medium)' }} /> Missing Clauses</h3>
              {result.missingClauses.map((item, i) => (
                <div key={i} className="compliance-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="item-title">{item.clause}</span>
                    <span className={`badge badge-${item.importance === 'critical' ? 'red' : item.importance === 'important' ? 'yellow' : 'blue'}`}>
                      {item.importance}
                    </span>
                  </div>
                  <div className="item-desc">{item.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Risky Terms */}
          {result.riskyTerms?.length > 0 && (
            <div className="compliance-section">
              <h3><XCircle size={16} style={{ color: 'var(--risk-high)' }} /> Risky Terms</h3>
              {result.riskyTerms.map((item, i) => (
                <div key={i} className="compliance-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="item-title">&ldquo;{item.term}&rdquo;</span>
                    <span className={`badge badge-${item.risk === 'high' ? 'red' : item.risk === 'medium' ? 'yellow' : 'green'}`}>
                      {item.risk} risk
                    </span>
                  </div>
                  <div className="item-desc">{item.explanation}</div>
                </div>
              ))}
            </div>
          )}

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="compliance-section">
              <h3><CheckCircle size={16} style={{ color: 'var(--risk-low)' }} /> Strengths</h3>
              {result.strengths.map((item, i) => (
                <div key={i} className="compliance-item">
                  <div className="item-title" style={{ color: 'var(--risk-low)' }}>✓ {item}</div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="compliance-section">
              <h3><Info size={16} style={{ color: 'var(--accent-blue)' }} /> Recommendations</h3>
              {result.recommendations.map((item, i) => (
                <div key={i} className="compliance-item">
                  <div className="item-desc">{item}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
