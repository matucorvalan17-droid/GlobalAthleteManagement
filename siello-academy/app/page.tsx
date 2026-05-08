'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHome from '@/components/dashboard/DashboardHome';
import { Lang } from '@/lib/i18n';

export default function HomePage() {
  const [lang, setLang] = useState<Lang>('es');

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar lang={lang} onLangChange={setLang} />
      <main className="flex-1 ml-16 lg:ml-60 min-h-screen">
        <DashboardHome lang={lang} />
      </main>
    </div>
  );
}
