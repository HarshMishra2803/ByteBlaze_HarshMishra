import './globals.css';

export const metadata = {
  title: 'LegalDoc AI — AI-Powered Legal Document Automation',
  description: 'Generate, analyze, and understand legal documents with AI. Perfect for small businesses and individuals.',
  keywords: 'legal documents, AI, NDA, rental agreement, employment contract, document automation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
