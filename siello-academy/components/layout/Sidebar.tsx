'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  History,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { Lang, t } from '@/lib/i18n';

interface SidebarProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

const NAV_ITEMS = [
  { key: 'dashboard', href: '/', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { key: 'new', href: '/report/new', icon: PlusCircle, labelKey: 'newReport' as const },
  { key: 'history', href: '/?tab=history', icon: History, labelKey: 'history' as const },
];

export default function Sidebar({ lang, onLangChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-16 lg:w-60 flex flex-col z-50"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-3 lg:px-5 py-5 border-b"
        style={{ borderColor: 'var(--border)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #F5A623, #D4880A)' }}>
          <span className="font-['Outfit'] font-black text-black text-lg">S</span>
        </div>
        <div className="hidden lg:block">
          <div className="font-['Outfit'] font-bold text-sm leading-tight"
            style={{ color: 'var(--gold)' }}>SIELLO</div>
          <div className="font-['Outfit'] font-light text-xs"
            style={{ color: 'var(--text-muted)' }}>ACADEMY</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href.split('?')[0]);

          return (
            <motion.button
              key={item.key}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative"
              style={{
                background: isActive ? 'rgba(245,166,35,0.08)' : 'transparent',
                color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                border: isActive ? '1px solid rgba(245,166,35,0.15)' : '1px solid transparent',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: 'var(--gold)' }}
                />
              )}
              <Icon size={17} className="shrink-0" />
              <span className="hidden lg:block">{t(lang, item.labelKey)}</span>
              {isActive && <ChevronRight size={13} className="hidden lg:block ml-auto opacity-50" />}
            </motion.button>
          );
        })}
      </nav>

      {/* Language toggle */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 px-2">
          <Globe size={14} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
          <div className="hidden lg:flex items-center gap-1 text-xs">
            {(['es', 'en'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => onLangChange(l)}
                className="px-2 py-1 rounded font-semibold uppercase tracking-wider transition-all"
                style={{
                  background: lang === l ? 'rgba(245,166,35,0.1)' : 'transparent',
                  color: lang === l ? 'var(--gold)' : 'var(--text-muted)',
                  border: lang === l ? '1px solid rgba(245,166,35,0.2)' : '1px solid transparent',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden lg:block mt-4 px-2">
          <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
            Siello Football Group
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
            v1.0 · 2025
          </div>
        </div>
      </div>
    </aside>
  );
}
