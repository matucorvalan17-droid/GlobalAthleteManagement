'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, PenLine } from 'lucide-react';
import { ScoutingReport } from '@/lib/types';
import { getReport, saveReport } from '@/lib/storage';
import Sidebar from '@/components/layout/Sidebar';
import ReportForm from '@/components/report/ReportForm';
import ReportPreview from '@/components/report/ReportPreview';
import { Lang } from '@/lib/i18n';

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lang, setLang] = useState<Lang>('es');
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const r = getReport(id);
    if (!r) {
      router.push('/');
      return;
    }
    setReport(r);
    setLoading(false);
  }, [id, router]);

  function handleUpdate(updated: ScoutingReport) {
    setReport(updated);
    saveReport(updated);
  }

  if (loading || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar lang={lang} onLangChange={setLang} />

      <main className="flex-1 ml-16 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <motion.button
            whileHover={{ x: -2 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </motion.button>

          <div className="h-4 w-px" style={{ background: 'var(--border)' }} />

          <div className="flex-1 min-w-0">
            <h1 className="font-['Outfit'] font-bold text-base truncate">
              {report.playerName || 'Nuevo Reporte'}
            </h1>
            {report.position && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{report.position}</p>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {[
              { key: 'edit', icon: PenLine, label: 'Editar' },
              { key: 'preview', icon: Eye, label: 'Preview' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setMode(key as 'edit' | 'preview')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{
                  background: mode === key ? 'var(--surface-3)' : 'transparent',
                  color: mode === key ? 'var(--text)' : 'var(--text-muted)',
                  border: mode === key ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {mode === 'edit' ? (
            <div className="h-full overflow-y-auto">
              <ReportForm
                report={report}
                onUpdate={handleUpdate}
                onPreview={() => setMode('preview')}
                lang={lang}
              />
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <ReportPreview report={report} lang={lang} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
