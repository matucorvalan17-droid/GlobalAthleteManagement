'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PlusCircle, FileText, TrendingUp, Users, ChevronRight, Trash2, Eye } from 'lucide-react';
import { ScoutingReport } from '@/lib/types';
import { getReports, deleteReport, createNewReport, saveReport } from '@/lib/storage';
import { StatusBadge, ScorePill } from '@/components/ui/Badge';
import { Lang, t } from '@/lib/i18n';

interface DashboardHomeProps {
  lang: Lang;
}

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function DashboardHome({ lang }: DashboardHomeProps) {
  const router = useRouter();
  const [reports, setReports] = useState<ScoutingReport[]>([]);

  useEffect(() => {
    setReports(getReports());
  }, []);

  const stats = {
    total: reports.length,
    elite: reports.filter(r => r.scoutingStatus === 'ELITE_POTENTIAL').length,
    follow: reports.filter(r => r.scoutingStatus === 'FOLLOW' || r.scoutingStatus === 'SIGN_NOW').length,
  };

  function handleNew() {
    const report = createNewReport();
    saveReport(report);
    router.push(`/report/${report.id}`);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm('¿Eliminar este reporte?')) {
      deleteReport(id);
      setReports(getReports());
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).format(new Date(iso));
    } catch { return iso; }
  };

  return (
    <div className="min-h-screen grid-bg px-4 sm:px-8 py-8">

      {/* Header */}
      <motion.div {...fadeIn} className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--gold)', opacity: 0.7 }}>
            {t(lang, 'welcomeSub')}
          </span>
        </div>
        <h1 className="font-['Outfit'] font-black text-3xl sm:text-4xl text-white mb-1">
          {t(lang, 'welcomeTitle')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {lang === 'es' ? 'Sistema de generación de reportes de scouting' : 'Scouting report generation system'}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-10"
      >
        {[
          { icon: FileText, label: t(lang, 'totalReports'), value: stats.total, color: 'var(--gold)' },
          { icon: TrendingUp, label: t(lang, 'elitePlayers'), value: stats.elite, color: '#14B8A6' },
          { icon: Users, label: t(lang, 'followList'), value: stats.follow, color: '#818CF8' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label}
            className="rounded-xl p-4 sm:p-5"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <div className="font-['Outfit'] font-bold text-2xl sm:text-3xl" style={{ color }}>
              {value}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Reports list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Outfit'] font-semibold text-base" style={{ color: 'var(--text)' }}>
            {t(lang, 'recentActivity')}
          </h2>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
              color: '#000',
            }}
          >
            <PlusCircle size={15} />
            <span className="hidden sm:inline">{t(lang, 'newReport')}</span>
          </motion.button>
        </div>

        {reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-16 text-center"
            style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)' }}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
              <FileText size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <h3 className="font-['Outfit'] font-semibold text-lg mb-2">{t(lang, 'noReports')}</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{t(lang, 'noReportsDesc')}</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNew}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', color: '#000' }}
            >
              {t(lang, 'createFirst')}
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/report/${report.id}`)}
                className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all group"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                }}
                whileHover={{ borderColor: 'rgba(245,166,35,0.2)', backgroundColor: 'var(--surface-3)' }}
              >
                {/* Player photo */}
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0"
                  style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                  {report.playerPhoto ? (
                    <img src={report.playerPhoto} alt={report.playerName}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-['Outfit'] font-bold text-sm" style={{ color: 'var(--gold)' }}>
                        {report.playerName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm truncate">{report.playerName || 'Sin nombre'}</span>
                    <StatusBadge status={report.scoutingStatus} lang={lang} size="sm" />
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {report.position && `${report.position} · `}
                    {report.currentClub && `${report.currentClub} · `}
                    {formatDate(report.updatedAt)}
                  </div>
                </div>

                {/* Score */}
                <ScorePill score={report.overallScore || 0} size="sm" />

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/report/${report.id}`); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    title="Ver reporte"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    onClick={e => handleDelete(report.id, e)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    title="Eliminar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} className="shrink-0 hidden sm:block" />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
