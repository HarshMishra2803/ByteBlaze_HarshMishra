'use client';

import styles from './DocumentCard.module.css';
import { FileText, Clock, Download } from 'lucide-react';
import { exportToPDF } from '@/lib/pdfExport';

const typeIcons = {
  nda: '🔒',
  rental: '🏠',
  employment: '💼',
};

const typeNames = {
  nda: 'NDA',
  rental: 'Rental Agreement',
  employment: 'Employment Contract',
};

export default function DocumentCard({ document, onView }) {
  const created = new Date(document.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={`card card-interactive ${styles.card}`} onClick={() => onView?.(document)}>
      <div className={styles.header}>
        <div className={styles.icon}>{typeIcons[document.type] || '📄'}</div>
        <div className={styles.info}>
          <h4 className={styles.title}>{document.title}</h4>
          <div className={styles.meta}>
            <span className={`badge badge-blue`}>
              {typeNames[document.type] || document.type}
            </span>
            <span className={styles.date}>
              <Clock size={12} /> {created}
            </span>
          </div>
        </div>
      </div>
      <p className={styles.preview}>
        {document.content?.substring(0, 120)}...
      </p>
      <div className={styles.actions}>
        <button
          className="btn btn-ghost"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(document);
          }}
        >
          <FileText size={14} /> View
        </button>
        <button
          className="btn btn-ghost"
          onClick={async (e) => {
            e.stopPropagation();
            await exportToPDF(document.title, document.content, document.language);
          }}
        >
          <Download size={14} /> PDF
        </button>
      </div>
    </div>
  );
}
