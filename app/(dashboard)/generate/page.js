'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Sparkles,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import LanguageToggle from '@/components/LanguageToggle';
import { exportToPDF } from '@/lib/pdfExport';

const docTypes = [
  // Business
  { id: 'nda', icon: '🔒', label: 'Non-Disclosure Agreement', desc: 'Protect confidential information', category: 'Business' },
  { id: 'employment', icon: '💼', label: 'Employment Contract', desc: 'Hiring terms and conditions', category: 'Business' },
  { id: 'freelance', icon: '🤝', label: 'Freelance Contract', desc: 'Agreement for freelance services', category: 'Business' },
  { id: 'service', icon: '🛠️', label: 'Service Agreement', desc: 'General provider-client agreement', category: 'Business' },
  
  // Personal
  { id: 'rental', icon: '🏠', label: 'Rental Agreement', desc: 'Lease terms for property', category: 'Personal' },
  { id: 'loan', icon: '💰', label: 'Loan Agreement', desc: 'Lending and borrowing terms', category: 'Personal' },

  // Legal
  { id: 'privacy', icon: '🛡️', label: 'Privacy Policy', desc: 'Data collection and usage policy', category: 'Legal' },
  { id: 'terms', icon: '📜', label: 'Terms & Conditions', desc: 'Website or app usage rules', category: 'Legal' },
];

const formFields = {
  nda: [
    { name: 'party1Name', label: 'Disclosing Party Name', placeholder: 'Company or Person name', required: true },
    { name: 'party2Name', label: 'Receiving Party Name', placeholder: 'Company or Person name', required: true },
    { name: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
    { name: 'duration', label: 'Duration', placeholder: '2 years' },
    { name: 'purpose', label: 'Purpose', placeholder: 'Business collaboration' },
    { name: 'jurisdiction', label: 'Jurisdiction', placeholder: 'India' },
    { name: 'additionalTerms', label: 'Additional Terms (Optional)', placeholder: 'Any specific terms...', fullWidth: true, textarea: true },
  ],
  rental: [
    { name: 'landlordName', label: 'Landlord Name', placeholder: 'Full legal name', required: true },
    { name: 'tenantName', label: 'Tenant Name', placeholder: 'Full legal name', required: true },
    { name: 'propertyAddress', label: 'Property Address', placeholder: 'Full property address', required: true, fullWidth: true },
    { name: 'monthlyRent', label: 'Monthly Rent (₹)', placeholder: '15000', required: true },
    { name: 'securityDeposit', label: 'Security Deposit (₹)', placeholder: '45000', required: true },
    { name: 'startDate', label: 'Lease Start Date', type: 'date', required: true },
    { name: 'duration', label: 'Lease Duration', placeholder: '11 months' },
    { name: 'paymentDueDate', label: 'Payment Due Date', placeholder: '1st of each month' },
    { name: 'additionalTerms', label: 'Additional Terms (Optional)', placeholder: 'Any specific terms...', fullWidth: true, textarea: true },
  ],
  employment: [
    { name: 'employerName', label: 'Employer / Company Name', placeholder: 'Company name', required: true },
    { name: 'employeeName', label: 'Employee Name', placeholder: 'Full legal name', required: true },
    { name: 'position', label: 'Position / Title', placeholder: 'Software Engineer', required: true },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'salary', label: 'Annual Salary (₹)', placeholder: '600000', required: true },
    { name: 'workLocation', label: 'Work Location', placeholder: 'Bangalore, India' },
    { name: 'probationPeriod', label: 'Probation Period', placeholder: '3 months' },
    { name: 'noticePeriod', label: 'Notice Period', placeholder: '30 days' },
    { name: 'additionalTerms', label: 'Additional Terms (Optional)', placeholder: 'Any specific terms...', fullWidth: true, textarea: true },
  ],
  freelance: [
    { name: 'clientName', label: 'Client Name', placeholder: 'Company or Individual', required: true },
    { name: 'freelancerName', label: 'Freelancer Name', placeholder: 'Full legal name', required: true },
    { name: 'scopeOfWork', label: 'Scope of Work', placeholder: 'Web development, writing, etc.', required: true, fullWidth: true, textarea: true },
    { name: 'paymentTerms', label: 'Payment Terms', placeholder: '₹50,000 upon completion', required: true },
    { name: 'deadline', label: 'Deadline', type: 'date', required: true },
    { name: 'jurisdiction', label: 'Jurisdiction', placeholder: 'India' },
    { name: 'additionalTerms', label: 'Additional Terms (Optional)', placeholder: 'Any specific terms...', fullWidth: true, textarea: true },
  ],
  privacy: [
    { name: 'companyName', label: 'Company / Website Name', placeholder: 'Legal name', required: true },
    { name: 'websiteURL', label: 'Website URL', placeholder: 'https://example.com', required: true },
    { name: 'dataTypes', label: 'Types of Data Collected', placeholder: 'Email, IP address, etc.', required: true, textarea: true },
    { name: 'collectionPurpose', label: 'Purpose of Collection', placeholder: 'Marketing, analytics, etc.', required: true, textarea: true },
    { name: 'additionalTerms', label: 'Additional Terms (Optional)', placeholder: 'Any specific terms...', fullWidth: true, textarea: true },
  ],
  service: [
    { name: 'providerName', label: 'Provider Name', placeholder: 'Company or Individual', required: true },
    { name: 'clientName', label: 'Client Name', placeholder: 'Company or Individual', required: true },
    { name: 'serviceDescription', label: 'Services Description', placeholder: 'Description of services', required: true, fullWidth: true, textarea: true },
    { name: 'duration', label: 'Duration', placeholder: '6 months' },
    { name: 'fees', label: 'Fees (₹)', placeholder: '100000', required: true },
    { name: 'additionalTerms', label: 'Additional Terms (Optional)', placeholder: 'Any specific terms...', fullWidth: true, textarea: true },
  ],
  terms: [
    { name: 'companyName', label: 'Company Name', placeholder: 'Legal name', required: true },
    { name: 'websiteName', label: 'Website / App Name', placeholder: 'My Awesome App', required: true },
    { name: 'jurisdiction', label: 'Jurisdiction', placeholder: 'India', required: true },
    { name: 'additionalTerms', label: 'Additional Terms (Optional)', placeholder: 'Any specific terms...', fullWidth: true, textarea: true },
  ],
  loan: [
    { name: 'lenderName', label: 'Lender Name', placeholder: 'Full legal name', required: true },
    { name: 'borrowerName', label: 'Borrower Name', placeholder: 'Full legal name', required: true },
    { name: 'principalAmount', label: 'Principal Amount (₹)', placeholder: '500000', required: true },
    { name: 'interestRate', label: 'Annual Interest Rate (%)', placeholder: '12%', required: true },
    { name: 'repaymentSchedule', label: 'Repayment Schedule', placeholder: 'Monthly, EMI, etc.', required: true },
    { name: 'additionalTerms', label: 'Additional Terms (Optional)', placeholder: 'Any specific terms...', fullWidth: true, textarea: true },
  ],
};

export default function GeneratePage() {
  const [selectedType, setSelectedType] = useState(null);
  const [inputs, setInputs] = useState({});
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    setResult(null);

    try {
      console.log('Initiating document generation for type:', selectedType);
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, inputs, language }),
      });

      console.log('Generation API response status:', res.status);
      const data = await res.json();
      console.log('Generation data received:', data);

      if (!res.ok) {
        setError(data.error || 'Failed to generate document');
        console.error('Generation failed:', data.error);
        return;
      }

      setResult(data);
      console.log('Generation successful, result state updated.');
    } catch (err) {
      console.error('Network/Generation error:', err);
      setError('Network error. Our constructor could not be reached. Please try again.');
    } finally {
      setLoading(false);
      console.log('Generation lifecycle complete.');
    }
  };

  const handleReset = () => {
    setSelectedType(null);
    setInputs({});
    setResult(null);
    setError('');
  };

  // Show result
  if (result) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <CheckCircle size={24} style={{ color: 'var(--risk-low)' }} />
            <h1 className="page-title">Document Generated!</h1>
          </div>
          <p className="page-subtitle">{result.title} has been created and saved to your history.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button
            className="btn btn-primary"
            onClick={async () => await exportToPDF(result.title, result.content, result.language)}
          >
            <Download size={16} /> Download as PDF
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            <FileText size={16} /> Generate Another
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '16px 24px', borderBottom: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{result.title}</h3>
            <span className="badge" style={{ background: '#e0f2fe', color: '#0284c7' }}>{language === 'hi' ? 'Hindi' : 'English'}</span>
          </div>
          <div className="markdown-content">
            <ReactMarkdown>{result.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: 8 }}>
              Generate <span className="gradient-text">Vault</span>
            </h1>
            <p className="page-subtitle">Create professional legal documents powered by AI</p>
          </div>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
      </div>

      {/* Step 1: Choose Document Type */}
      {!selectedType ? (
        <>
          {['Business', 'Personal', 'Legal'].map((category) => (
            <div key={category} style={{ marginBottom: 40 }}>
              <h2 className="section-title" style={{ marginBottom: 20 }}>{category} Templates</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {docTypes
                  .filter((type) => type.category === category)
                  .map((type, i) => (
                    <div
                      key={type.id}
                      className="card card-premium animate-fade-up"
                      style={{ padding: 24, cursor: 'pointer', animationDelay: `${i * 0.05}s` }}
                      onClick={() => setSelectedType(type.id)}
                      id={`doc-type-${type.id}`}
                    >
                      <div style={{ 
                        width: 48, height: 48, borderRadius: 12, background: 'var(--bg-secondary)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                        fontSize: '1.25rem' 
                      }}>
                        {type.icon}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>{type.label}</div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{type.desc}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          {/* Step 2: Fill Details */}
          <button className="btn btn-secondary" onClick={() => setSelectedType(null)} style={{ marginBottom: 24, padding: '8px 16px' }}>
            <ArrowLeft size={16} /> Back to Library
          </button>

          <div className="card animate-scale-in" style={{ padding: 40, border: 'none', boxShadow: 'var(--shadow-premium)' }}>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>
                {docTypes.find(t => t.id === selectedType)?.icon}{' '}
                {docTypes.find(t => t.id === selectedType)?.label}
              </h2>
              <p className="text-muted">Fill in the following criteria to construct your legal document.</p>
            </div>

            {error && <div className="auth-error" style={{ marginBottom: 24 }}>{error}</div>}

            <form onSubmit={handleGenerate}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {formFields[selectedType]?.map((field) => (
                  <div
                    key={field.name}
                    className="input-group"
                    style={field.fullWidth ? { gridColumn: '1 / -1' } : {}}
                  >
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                      {field.label} {field.required && <span style={{ color: 'var(--risk-high)' }}>*</span>}
                    </label>
                    {field.textarea ? (
                      <textarea
                        id={field.name}
                        className="textarea"
                        placeholder={field.placeholder}
                        value={inputs[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        rows={4}
                      />
                    ) : (
                      <input
                        id={field.name}
                        type={field.type || 'text'}
                        className="input"
                        placeholder={field.placeholder}
                        value={inputs[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                  id="generate-btn"
                  style={{ borderRadius: 100, padding: '14px 32px' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner" /> Constructing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Generate Professional Draft
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
