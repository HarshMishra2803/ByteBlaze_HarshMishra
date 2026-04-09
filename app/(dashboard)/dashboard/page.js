'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FileText,
  Upload,
  MessageSquare,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  Download,
  Clock,
  ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DocumentCard from '@/components/DocumentCard';
import { exportToPDF } from '@/lib/pdfExport';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ total: 0, byType: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [viewDoc, setViewDoc] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setFetchError('');
    try {
      console.log('Fetching dashboard stats...');
      const res = await fetch('/api/documents/history?stats=true');
      const data = await res.json();
      
      console.log('Dashboard data received:', data);
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect to the vault');
      }

      if (data.stats) {
        setStats(data.stats);
      } else {
        console.warn('API returned success but no stats object found.');
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setFetchError(err.message || 'Unable to retrieve document statistics.');
    } finally {
      setLoading(false);
      console.log('Dashboard loading sequence complete.');
    }
  };

  const statCards = [
    {
      icon: <FileText size={22} />,
      value: stats.total,
      label: 'Total Documents',
      stagger: 'stagger-1',
    },
    {
      icon: <Shield size={22} />,
      value: stats.byType?.find(t => t.type === 'nda')?.count || 0,
      label: 'NDAs Drafted',
      stagger: 'stagger-2',
    },
    {
      icon: <TrendingUp size={22} />,
      value: stats.byType?.find(t => (t.type === 'rental' || t.type === 'lease'))?.count || 0,
      label: 'Agreements',
      stagger: 'stagger-3',
    },
    {
      icon: <Sparkles size={22} />,
      value: stats.byType?.find(t => t.type === 'employment')?.count || 0,
      label: 'Personnel Contracts',
      stagger: 'stagger-4',
    },
  ];

  const quickActions = [
    {
      href: '/generate',
      icon: <FileText size={20} />,
      title: 'Draft New',
      desc: 'Create legal documents',
      color: 'var(--accent-indigo)'
    },
    {
      href: '/analyze',
      icon: <TrendingUp size={20} />,
      title: 'Analyze',
      desc: 'Verify compliance',
      color: 'var(--accent-cyan)'
    },
    {
      href: '/chat',
      icon: <MessageSquare size={20} />,
      title: 'AI Assistant',
      desc: 'Expert legal chat',
      color: 'var(--accent-indigo)'
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="section-title" style={{ fontSize: '2.25rem', marginBottom: 10, fontWeight: 800 }}>
          Welcome, <span style={{ background: 'linear-gradient(135deg, #FFFFFF, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{session?.user?.name?.split(' ')[0] || 'Advocate'}</span>
        </h1>
        <p className="page-subtitle" style={{ color: '#e5e7eb', fontSize: '1.125rem' }}>Your legal automation overview for today.</p>
      </div>

      {/* Stats Grid with Animation */}
      <div className="stat-grid">
        {statCards.map((stat, i) => (
          <div key={i} className={`card card-premium stat-card card-interactive animate-fade-up ${stat.stagger}`}>
            <div className="stat-icon-wrapper">
              {stat.icon}
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        {/* Recent Documents Area */}
        <div>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Recent Activity</h2>
            <Link href="/generate" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }}>
              View History <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
              <p style={{ color: '#e5e7eb' }}>Unlocking your vault...</p>
            </div>
          ) : fetchError ? (
            <div className="auth-error" style={{ padding: 32, textAlign: 'center' }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>{fetchError}</p>
              <button className="btn btn-secondary" onClick={fetchStats} style={{ margin: '0 auto' }}>Retry Connection</button>
            </div>
          ) : stats.recent?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {stats.recent.map((doc, i) => (
                <div key={doc.id} className={`animate-fade-up stagger-${(i % 3) + 1}`}>
                  <DocumentCard document={doc} onView={(d) => setViewDoc(d)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: 60, textAlign: 'center', background: 'transparent', borderStyle: 'dashed' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 8 }}>Empty Vault</h3>
              <p style={{ color: '#e5e7eb', marginBottom: 24 }}>You haven&apos;t generated any documents yet or your items are being processed.</p>
              <Link href="/generate" className="btn btn-primary" style={{ borderRadius: 100 }}>
                Generate Your First Document
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Actions Column */}
        <div className="animate-fade-up stagger-3">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Quick Access</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quickActions.map((action, i) => (
              <Link 
                key={i} 
                href={action.href} 
                className="card card-premium card-interactive" 
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}
                onMouseOver={(e) => {
                  const title = e.currentTarget.querySelector('.action-title');
                  if (title) title.style.color = '#22D3EE';
                }}
                onMouseOut={(e) => {
                  const title = e.currentTarget.querySelector('.action-title');
                  if (title) title.style.color = '#FFFFFF';
                }}
              >
                <div style={{ 
                  width: 44, height: 44, borderRadius: 12, background: 'var(--bg-secondary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color,
                  flexShrink: 0,
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
                }} className="stat-icon-wrapper">
                  {action.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="action-title" style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#FFFFFF', transition: 'color 0.2s' }}>{action.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#D1D5DB' }}>{action.desc}</div>
                </div>
                <ExternalLink size={14} style={{ color: '#e5e7eb' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Glassmorphism Document Viewer Modal */}
      {viewDoc && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
          }}
          onClick={() => setViewDoc(null)}
          className="animate-fade-in"
        >
          <div
            className="card animate-scale-in"
            style={{ maxWidth: 800, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '28px 40px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--bg-secondary)'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{viewDoc.title}</h3>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
                  <span className="badge" style={{ background: '#eef2ff', color: '#4f46e5' }}>Legal Document</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {new Date(viewDoc.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-primary"
                  onClick={async () => await exportToPDF(viewDoc.title, viewDoc.content, viewDoc.language)}
                >
                  <Download size={16} /> Export PDF
                </button>
                <button className="btn btn-secondary" onClick={() => setViewDoc(null)} style={{ padding: 12 }}>✕</button>
              </div>
            </div>
            <div className="result-container markdown-content" style={{ margin: '0 40px 40px', flex: 1, overflow: 'auto', border: '1px solid var(--border-color)', background: '#0B1220', padding: 40, borderRadius: 16, fontSize: '1rem', color: '#E5E7EB' }}>
              <ReactMarkdown>{viewDoc.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
