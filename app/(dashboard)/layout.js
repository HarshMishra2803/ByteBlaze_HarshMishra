'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Providers from '@/components/Providers';
import Sidebar from '@/components/Sidebar';

function DashboardContent({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Providers>
      <DashboardContent>{children}</DashboardContent>
    </Providers>
  );
}
