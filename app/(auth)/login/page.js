'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scale, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-scale-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Scale size={22} />
          </div>
          <span className="auth-logo-text">
            <span className="gradient-text">LegalDoc</span> AI
          </span>
        </div>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 4, textAlign: 'center' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 28 }}>
          Sign in to your account to continue
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            id="login-submit"
            style={{ padding: '14px', borderRadius: '10px' }}
          >
            {loading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
