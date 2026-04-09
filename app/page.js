'use client';

import Link from 'next/link';
import { 
  Scale, 
  FileText, 
  Shield, 
  Zap, 
  ArrowRight, 
  Check, 
  Users, 
  Briefcase, 
  User, 
  TrendingUp,
  Globe,
  Code2,
  MessageCircle,
  Mail
} from 'lucide-react';
import styles from './landing.module.css';

export default function LandingPage() {
  return (
    <div className={styles.landingWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <Scale size={28} />
              <span>LegalDoc AI</span>
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <nav style={{ display: 'flex', gap: 20 }}>
                <Link href="#features" className={styles.navLink} style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#4b5563', textDecoration: 'none' }}>Features</Link>
                <Link href="#use-cases" className={styles.navLink} style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#4b5563', textDecoration: 'none' }}>Use Cases</Link>
              </nav>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/login" className="btn btn-secondary">Login</Link>
                <Link href="/signup" className="btn btn-primary">Sign Up</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.trustLine}>Next-Gen Legal Automation</span>
            <h1 className={styles.heroTitle}>
              Professional Legal Docs <br />
              Generated in Seconds
            </h1>
            <p className={styles.heroSubtitle}>
              Draft, analyze, and manage legally-binding documents with the power of specialized AI. 
              Reduce costs and eliminate paperwork friction instantly.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <Link href="/signup" className="btn btn-primary btn-lg" style={{ padding: '16px 32px' }}>
                Join for Free <ArrowRight size={20} style={{ marginLeft: 8 }} />
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img 
              src="/user-hero.png" 
              alt="Legal AI Dashboard" 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Powerful Legal Intelligence</h2>
            <p>Advanced tools designed to simplify complex legal workflows for everyone.</p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} style={{ background: '#eef2ff', color: '#4f46e5' }}><FileText size={24} /></div>
              <h3 className={styles.featureTitle}>Pro Drafting</h3>
              <p className={styles.featureDesc}>Generate NDAs, Rental Agreements, and Employment Contracts using battle-tested AI templates.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} style={{ background: '#fef3c7', color: '#d97706' }}><Zap size={24} /></div>
              <h3 className={styles.featureTitle}>Instant Logic Tabs</h3>
              <p className={styles.featureDesc}>Upload any contract to get a plain-language summary and identify potential liability risks in seconds.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}><Shield size={24} /></div>
              <h3 className={styles.featureTitle}>Compliance Check</h3>
              <p className={styles.featureDesc}>Our AI cross-references your documents against common legal standards to ensure basic compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases section */}
      <section id="use-cases" className={styles.useCases}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Who is it for?</h2>
            <p>Our platform handles documentation tasks for diverse needs across the legal spectrum.</p>
          </div>
          <div className={styles.useCasesGrid}>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}><Briefcase size={28} /></div>
              <h4 style={{ fontWeight: 700 }}>Freelancers</h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 8 }}>Secure your projects with professional service agreements.</p>
            </div>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}><TrendingUp size={28} /></div>
              <h4 style={{ fontWeight: 700 }}>Startups</h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 8 }}>Move fast with quick NDAs and employment contracts for new hires.</p>
            </div>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}><Users size={28} /></div>
              <h4 style={{ fontWeight: 700 }}>Small Businesses</h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 8 }}>Standardize your legal ops without the expensive hourly rates.</p>
            </div>
            <div className={styles.useCaseCard}>
              <div className={styles.useCaseIcon}><User size={28} /></div>
              <h4 style={{ fontWeight: 700 }}>Individuals</h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 8 }}>Draft personal rental agreements or simple loan letters easily.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className={styles.benefits}>
          <div className={styles.benefitsContent}>
            <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>Why Choose LegalDoc AI?</h2>
              <div className={styles.benefitList} style={{ textAlign: 'left' }}>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitCheck}><Check size={14} /></div>
                  <div>
                    <div className={styles.benefitLabel}>Save 90% of your time</div>
                    <p style={{ fontSize: '0.9375rem', opacity: 0.7, marginTop: 4 }}>Stop spending hours drafting and let AI do the heavy lifting.</p>
                  </div>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitCheck}><Check size={14} /></div>
                  <div>
                    <div className={styles.benefitLabel}>Reduce legal costs</div>
                    <p style={{ fontSize: '0.9375rem', opacity: 0.7, marginTop: 4 }}>Handle routine documentation yourself before calling a lawyer.</p>
                  </div>
                </div>
                <div className={styles.benefitItem}>
                  <div className={styles.benefitCheck}><Check size={14} /></div>
                  <div>
                    <div className={styles.benefitLabel}>AI-Powered Accuracy</div>
                    <p style={{ fontSize: '0.9375rem', opacity: 0.7, marginTop: 4 }}>Leverage the latest LLMs trained on millions of legal patterns.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>


      {/* CTA section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaBox}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 20 }}>Ready to automate your legal ops?</h2>
            <p style={{ fontSize: '1.125rem', marginBottom: 40, opacity: 0.9 }}>Join over 10,000+ businesses and individuals using AI to move faster.</p>
            <Link href="/signup" className="btn btn-primary btn-lg" style={{ background: 'white', color: '#4f46e5', padding: '16px 48px', borderRadius: 100 }}>
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Expanded */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerCol}>
              <div className={styles.logo} style={{ marginBottom: 20 }}>
                <Scale size={32} />
                <span style={{ fontSize: '1.5rem' }}>LegalDoc AI</span>
              </div>
              <p style={{ color: '#6b7280', lineHeight: 1.6, fontSize: '0.9375rem' }}>
                Making professional legal documentation accessible to everyone through advanced AI automation. 
                Simple, secure, and accurate.
              </p>
              <div className={styles.socialIcons}>
                <a href="#" title="LinkedIn"><Globe size={20} /></a>
                <a href="#" title="Twitter"><MessageCircle size={20} /></a>
                <a href="#" title="GitHub"><Code2 size={20} /></a>
                <a href="#"><Mail size={20} /></a>
              </div>
            </div>
            <div className={styles.footerCol}>
              <h4>Product</h4>
              <ul className={styles.footerLinks}>
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#use-cases">Use Cases</Link></li>
                <li><Link href="/generate">Generator</Link></li>
                <li><Link href="/analyze">Analyzer</Link></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Company</h4>
              <ul className={styles.footerLinks}>
                <li><Link href="#">About Us</Link></li>
                <li><Link href="#">Contact</Link></li>
                <li><Link href="#">Careers</Link></li>
                <li><Link href="#">Trust Center</Link></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Legal</h4>
              <ul className={styles.footerLinks}>
                <li><Link href="#">Privacy Policy</Link></li>
                <li><Link href="#">Terms of Service</Link></li>
                <li><Link href="#">Cookie Policy</Link></li>
                <li><Link href="#">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
            <p>&copy; 2026 LegalDoc AI Platform. Built with power and precision.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link href="#">Feedback</Link>
              <Link href="#">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
