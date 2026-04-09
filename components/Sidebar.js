'use client';

import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  Upload,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Scale,
  User,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generate Document', icon: FileText },
  { href: '/analyze', label: 'Upload & Analyze', icon: Upload },
  { href: '/chat', label: 'Chat Assistant', icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        id="sidebar-toggle"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Scale size={20} />
          </div>
          <div className={styles.logoText}>LegalDoc AI</div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setMobileOpen(false)}
                id={`nav-${item.href.replace('/', '')}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <User size={16} />
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{session?.user?.name || 'User'}</div>
              <div className={styles.userEmail}>{session?.user?.email || ''}</div>
            </div>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={() => signOut({ callbackUrl: '/login' })}
            id="logout-btn"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
