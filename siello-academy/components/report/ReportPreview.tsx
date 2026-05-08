'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Cell,
} from 'recharts';
import { ScoutingReport, CoreScores, DetailedAttributes } from '@/lib/types';
import { StatusBadge, ScorePill } from '@/components/ui/Badge';
import { Lang, t } from '@/lib/i18n';
import { exportToPDF } from '@/lib/pdf';

interface Props {
  report: ScoutingReport;
  lang: Lang;
}

function getBarColor(v: number) {
  if (v >= 8) return '#14B8A6';
  if (v >= 6.5) return '#F5A623';
  if (v >= 4.5) return '#FCD34D';
  return '#F87171';
}

function calcAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function HBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const color = getBarColor(value);
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-32 text-right shrink-0" style={{ color: '#9CA3AF' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: '#1F1F28' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}70, ${color})`,
            boxShadow: `0 0 6px ${color}60`,
          }}
        />
      </div>
      <span className="text-xs font-bold w-7 shrink-0" style={{ color }}>{value.toFixed(1)}</span>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #F5A623, transparent)' }} />
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#F5A623' }}>{label}</span>
      <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, #F5A623)' }} />
    </div>
  );
}

function TextBlock({ title, content }: { title: string; content: string }) {
  if (!content) return null;
  return (
    <div className="p-4 rounded-xl" style={{ background: '#13131A', border: '1px solid #1E1E28' }}>
      <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#F5A623' }}>
        {title}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: '#D1D5DB' }}>{content}</p>
    </div>
  );
}

const CORE_LABELS: Record<keyof CoreScores, { es: string; en: string }> = {
  tecnica:         { es: 'Técnica',           en: 'Technical' },
  tactica:         { es: 'Táctica',           en: 'Tactical' },
  fisico:          { es: 'Físico',            en: 'Physical' },
  mentalidad:      { es: 'Mentalidad',        en: 'Mentality' },
  intensidad:      { es: 'Intensidad',        en: 'Intensity' },
  tomaDecisiones:  { es: 'Decisiones',        en: 'Decisions' },
  potencial:       { es: 'Potencial',         en: 'Potential' },
  adaptabilidad:   { es: 'Adaptabilidad',     en: 'Adaptability' },
  juegoSinBalon:   { es: 'Sin Balón',         en: 'Off Ball' },
  juegoConBalon:   { es: 'Con Balón',         en: 'On Ball' },
};

const ATTR_LABELS: Record<keyof DetailedAttributes, { es: string; en: string }> = {
  velocidad:          { es: 'Velocidad',    en: 'Speed' },
  potencia:           { es: 'Potencia',     en: 'Power' },
  resistencia:        { es: 'Resistencia',  en: 'Endurance' },
  aceleracion:        { es: 'Aceleración',  en: 'Acceleration' },
  saltoCabeceo:       { es: 'Salto',        en: 'Jump' },
  controlPase:        { es: 'Control',      en: 'Control' },
  tecnicaDominio:     { es: 'Dominio',      en: 'Mastery' },
  regate:             { es: 'Regate',       en: 'Dribble' },
  finalizacion:       { es: 'Finalización', en: 'Finishing' },
  centros:            { es: 'Centros',      en: 'Crosses' },
  liderazgo:          { es: 'Liderazgo',    en: 'Leadership' },
  presionTrasPerdida: { es: 'Presión',      en: 'Press' },
  concienciaEspacial: { es: 'Espacial',     en: 'Spatial' },
  lecturaJuego:       { es: 'Lectura',      en: 'Reading' },
  personalidad:       { es: 'Personalidad', en: 'Personality' },
  tomaDedecisiones:   { es: 'Decisiones',   en: 'Decisions' },
  posicionamiento:    { es: 'Posición',     en: 'Position' },
  equilibrioDefensivo:{ es: 'Equilibrio',   en: 'Balance' },
  transiciones:       { es: 'Transiciones', en: 'Transitions' },
  presionAlta:        { es: 'Presión Alta', en: 'High Press' },
  coberturas:         { es: 'Coberturas',   en: 'Covers' },
  lecturaEspacios:    { es: 'Espacios',     en: 'Spaces' },
};

export default function ReportPreview({ report, lang }: Props) {
  const [exporting, setExporting] = useState(false);
  const age = calcAge(report.dateOfBirth);

  const radarData = (Object.keys(CORE_LABELS) as (keyof CoreScores)[]).map(key => ({
    subject: CORE_LABELS[key][lang],
    value: report.coreScores[key],
    fullMark: 10,
  }));

  const coreBarData = (Object.keys(CORE_LABELS) as (keyof CoreScores)[]).map(key => ({
    name: CORE_LABELS[key][lang],
    value: report.coreScores[key],
  }));

  const attrKeys = Object.keys(report.attributes) as (keyof DetailedAttributes)[];
  const physKeys: (keyof DetailedAttributes)[] = ['velocidad', 'potencia', 'resistencia', 'aceleracion', 'saltoCabeceo'];
  const techKeys: (keyof DetailedAttributes)[] = ['controlPase', 'tecnicaDominio', 'regate', 'finalizacion', 'centros'];
  const mentKeys: (keyof DetailedAttributes)[] = ['liderazgo', 'presionTrasPerdida', 'concienciaEspacial', 'lecturaJuego', 'personalidad'];
  const tactKeys: (keyof DetailedAttributes)[] = ['posicionamiento', 'equilibrioDefensivo', 'transiciones', 'presionAlta', 'coberturas'];

  async function handleExport() {
    setExporting(true);
    try {
      const name = report.playerName?.replace(/\s+/g, '_') || 'report';
      await exportToPDF('pdf-content', `Siello_${name}_Report.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div>
          <h2 className="font-['Outfit'] font-bold text-base">{t(lang, 'preview')}</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {lang === 'es' ? 'Vista previa del reporte premium' : 'Premium report preview'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-70"
          style={{
            background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
            color: '#000',
          }}
        >
          {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {exporting ? 'Generando...' : t(lang, 'exportPDF')}
        </motion.button>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          id="pdf-content"
          style={{
            background: '#080810',
            fontFamily: "'Inter', sans-serif",
            maxWidth: 900,
            margin: '0 auto',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #1E1E28',
          }}
        >
          {/* ══ HERO SECTION ══ */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, #0A0A12 0%, #0D0D18 60%, #111120 100%)',
            }} />
            {/* Gold accent line top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, #F5A623, transparent)',
            }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch', minHeight: 260 }}>
              {/* Left info */}
              <div style={{ flex: 1, padding: '32px 32px 28px' }}>
                {/* Header logos row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  {/* Siello logo placeholder */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'linear-gradient(135deg, #F5A623, #D4880A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 18, color: '#000',
                  }}>S</div>
                  {report.clubLogo && (
                    <img src={report.clubLogo} alt="Club"
                      style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6 }} />
                  )}
                  <div style={{ flex: 1 }} />
                  {/* Report type label */}
                  <div style={{
                    padding: '4px 10px', borderRadius: 4,
                    background: 'rgba(245,166,35,0.08)',
                    border: '1px solid rgba(245,166,35,0.2)',
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.15em',
                    color: '#F5A623', textTransform: 'uppercase',
                  }}>
                    SCOUTING REPORT · SIELLO ACADEMY
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ marginBottom: 10 }}>
                  <StatusBadge status={report.scoutingStatus} lang={lang} size="sm" />
                </div>

                {/* Player name */}
                <h1 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 36,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                  marginBottom: 12,
                  letterSpacing: '-0.02em',
                }}>
                  {report.playerName || (lang === 'es' ? 'Nombre del Jugador' : 'Player Name')}
                </h1>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {[
                    age ? `${age} años` : null,
                    report.position,
                    report.nationality,
                    report.dominantFoot,
                    report.height ? `${report.height} cm` : null,
                    report.weight ? `${report.weight} kg` : null,
                  ].filter(Boolean).map((tag, i) => (
                    <span key={i} style={{
                      padding: '3px 10px', borderRadius: 20,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      fontSize: 11, color: '#D1D5DB',
                    }}>{tag}</span>
                  ))}
                </div>

                {/* Club + Date */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {report.currentClub && (
                    <div style={{ fontSize: 11, color: '#6B7280' }}>
                      <span style={{ color: '#F5A623', marginRight: 6 }}>●</span>
                      {report.currentClub}
                    </div>
                  )}
                  {report.evaluationDate && (
                    <div style={{ fontSize: 11, color: '#6B7280' }}>
                      <span style={{ marginRight: 4 }}>📅</span>
                      {new Intl.DateTimeFormat(lang === 'es' ? 'es-ES' : 'en-US', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      }).format(new Date(report.evaluationDate))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: player photo */}
              <div style={{
                width: 220, flexShrink: 0, position: 'relative',
                background: 'linear-gradient(135deg, #0F0F1A, #1A1A28)',
              }}>
                {report.playerPhoto ? (
                  <img src={report.playerPhoto} alt={report.playerName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', minHeight: 260,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 8,
                  }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: 'rgba(245,166,35,0.1)',
                      border: '2px solid rgba(245,166,35,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, color: '#F5A623', fontWeight: 900,
                      fontFamily: "'Outfit', sans-serif",
                    }}>
                      {report.playerName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  </div>
                )}
                {/* Score overlay */}
                <div style={{
                  position: 'absolute', bottom: 12, right: 12,
                  background: 'rgba(8,8,16,0.9)',
                  border: '1px solid rgba(245,166,35,0.3)',
                  borderRadius: 10, padding: '6px 10px',
                  backdropFilter: 'blur(8px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 22,
                    color: getBarColor(report.overallScore),
                    lineHeight: 1,
                  }}>{report.overallScore.toFixed(1)}</span>
                  <span style={{ fontSize: 8, color: '#6B7280', letterSpacing: '0.1em', marginTop: 2 }}>
                    OVERALL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div style={{ padding: '32px 32px 40px' }}>

            {/* ══ EXECUTIVE SUMMARY ══ */}
            {report.executiveSummary && (
              <div style={{ marginBottom: 32 }}>
                <SectionHeader label={t(lang, 'executiveSummary')} />
                <div style={{
                  padding: '16px 20px',
                  borderRadius: 10,
                  background: '#0E0E18',
                  border: '1px solid #1A1A28',
                  borderLeft: '3px solid #F5A623',
                }}>
                  <p style={{ fontSize: 12, color: '#D1D5DB', lineHeight: 1.8, margin: 0 }}>
                    {report.executiveSummary}
                  </p>
                </div>
              </div>
            )}

            {/* ══ PERFORMANCE DASHBOARD ══ */}
            <div style={{ marginBottom: 32 }}>
              <SectionHeader label={t(lang, 'performanceDashboard')} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  {
                    label: 'SIELLO INDEX',
                    value: report.overallScore.toFixed(1),
                    sub: 'Score general',
                    color: getBarColor(report.overallScore),
                  },
                  {
                    label: lang === 'es' ? 'POSICIÓN' : 'POSITION',
                    value: report.position || '—',
                    sub: report.dominantFoot || '',
                    color: '#818CF8',
                  },
                  {
                    label: lang === 'es' ? 'CLUB' : 'CLUB',
                    value: report.currentClub || '—',
                    sub: report.nationality || '',
                    color: '#14B8A6',
                  },
                  {
                    label: lang === 'es' ? 'ESTADO' : 'STATUS',
                    value: t(lang, report.scoutingStatus),
                    sub: report.evaluationDate || '',
                    color: '#F5A623',
                  },
                ].map(card => (
                  <div key={card.label} style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: '#0E0E18',
                    border: `1px solid ${card.color}20`,
                  }}>
                    <div style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: '0.15em',
                      color: card.color, marginBottom: 6, textTransform: 'uppercase',
                    }}>{card.label}</div>
                    <div style={{
                      fontFamily: "'Outfit', sans-serif", fontWeight: 800,
                      fontSize: 18, color: card.color, lineHeight: 1.1,
                      wordBreak: 'break-word',
                    }}>{card.value}</div>
                    {card.sub && (
                      <div style={{ fontSize: 9, color: '#4B5563', marginTop: 4 }}>{card.sub}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ══ CORE MATRIX ══ */}
            <div style={{ marginBottom: 32 }}>
              <SectionHeader label={t(lang, 'coreMatrix')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Radar chart */}
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                      <PolarGrid stroke="#1E1E2E" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#6B7280', fontSize: 9, fontFamily: 'Inter' }}
                      />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#F5A623"
                        fill="#F5A623"
                        fillOpacity={0.12}
                        strokeWidth={1.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar chart */}
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={coreBarData}
                      layout="vertical"
                      margin={{ top: 0, right: 30, left: 60, bottom: 0 }}
                      barSize={8}
                    >
                      <XAxis type="number" domain={[0, 10]} hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: '#6B7280', fontSize: 9, fontFamily: 'Inter' }}
                        width={60}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {coreBarData.map((entry, i) => (
                          <Cell key={i} fill={getBarColor(entry.value)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ══ CORE VS SNAPSHOT (horizontal bars) ══ */}
            <div style={{ marginBottom: 32 }}>
              <SectionHeader label={t(lang, 'coreVsSnapshot')} />
              <div style={{
                padding: '20px 24px',
                borderRadius: 12,
                background: '#0C0C16',
                border: '1px solid #1A1A26',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 32px',
              }}>
                {(Object.keys(CORE_LABELS) as (keyof CoreScores)[]).map(key => (
                  <HBar
                    key={key}
                    label={CORE_LABELS[key][lang]}
                    value={report.coreScores[key]}
                  />
                ))}
              </div>
            </div>

            {/* ══ QUICK ASSESSMENT ══ */}
            {(report.playerContext || report.technicalObservations || report.tacticalObservations || report.physicalObservations) && (
              <div style={{ marginBottom: 32 }}>
                <SectionHeader label={t(lang, 'quickAssessment')} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {report.playerContext && (
                    <TextBlock title={t(lang, 'playerContext')} content={report.playerContext} />
                  )}
                  {report.technicalObservations && (
                    <TextBlock title={t(lang, 'technicalObservations')} content={report.technicalObservations} />
                  )}
                  {report.tacticalObservations && (
                    <TextBlock title={t(lang, 'tacticalObservations')} content={report.tacticalObservations} />
                  )}
                  {report.physicalObservations && (
                    <TextBlock title={t(lang, 'physicalObservations')} content={report.physicalObservations} />
                  )}
                  {report.mentalityBehavior && (
                    <TextBlock title={t(lang, 'mentalityBehavior')} content={report.mentalityBehavior} />
                  )}
                </div>
              </div>
            )}

            {/* ══ ROLE FIT + CONCLUSION ══ */}
            {(report.roleFit || report.finalConclusion) && (
              <div style={{ marginBottom: 32 }}>
                <SectionHeader label={`${t(lang, 'roleFit')} & ${t(lang, 'finalConclusion')}`} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {report.roleFit && (
                    <TextBlock title={t(lang, 'roleFit')} content={report.roleFit} />
                  )}
                  {report.finalConclusion && (
                    <TextBlock title={t(lang, 'finalConclusion')} content={report.finalConclusion} />
                  )}
                </div>
              </div>
            )}

            {/* ══ FINAL RECOMMENDATION ══ */}
            {report.finalRecommendation && (
              <div style={{ marginBottom: 32 }}>
                <SectionHeader label={t(lang, 'finalRecommendation')} />
                <div style={{
                  padding: '18px 22px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(245,166,35,0.06), rgba(245,166,35,0.02))',
                  border: '1px solid rgba(245,166,35,0.2)',
                }}>
                  <p style={{ fontSize: 12, color: '#E5E7EB', lineHeight: 1.8, margin: 0 }}>
                    {report.finalRecommendation}
                  </p>
                </div>
              </div>
            )}

            {/* ══ DETAILED ATTRIBUTES ══ */}
            <div style={{ marginBottom: 32 }}>
              <SectionHeader label={lang === 'es' ? 'ATRIBUTOS DETALLADOS' : 'DETAILED ATTRIBUTES'} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { labelEs: 'FÍSICO', labelEn: 'PHYSICAL', keys: physKeys },
                  { labelEs: 'TÉCNICO', labelEn: 'TECHNICAL', keys: techKeys },
                  { labelEs: 'MENTAL', labelEn: 'MENTAL', keys: mentKeys },
                  { labelEs: 'TÁCTICO', labelEn: 'TACTICAL', keys: tactKeys },
                ].map(group => (
                  <div key={group.labelEs} style={{
                    padding: '16px 18px',
                    borderRadius: 10,
                    background: '#0C0C16',
                    border: '1px solid #1A1A26',
                  }}>
                    <div style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.15em',
                      color: '#F5A623', marginBottom: 12, textTransform: 'uppercase',
                    }}>
                      {lang === 'es' ? group.labelEs : group.labelEn}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {group.keys.map(key => (
                        <HBar
                          key={key}
                          label={ATTR_LABELS[key][lang]}
                          value={report.attributes[key]}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ SUGGESTED TEAMS ══ */}
            {report.suggestedTeams.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <SectionHeader label={t(lang, 'suggestedTeams')} />
                <div style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid #1A1A26',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1fr 2fr',
                    padding: '10px 16px',
                    background: '#0E0E18',
                    borderBottom: '1px solid #1A1A26',
                  }}>
                    {[t(lang, 'club'), t(lang, 'category'), t(lang, 'estimatedLevel'), t(lang, 'observations')].map(h => (
                      <div key={h} style={{
                        fontSize: 8, fontWeight: 700, letterSpacing: '0.15em',
                        color: '#F5A623', textTransform: 'uppercase',
                      }}>{h}</div>
                    ))}
                  </div>
                  {report.suggestedTeams.map((team, i) => (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 1fr 2fr',
                      padding: '10px 16px',
                      background: i % 2 === 0 ? '#0A0A14' : '#0C0C18',
                      borderBottom: i < report.suggestedTeams.length - 1 ? '1px solid #151520' : 'none',
                    }}>
                      <div style={{ fontSize: 11, color: '#E5E7EB', fontWeight: 500 }}>{team.club || '—'}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>{team.category || '—'}</div>
                      <div style={{ fontSize: 11, color: '#14B8A6', fontWeight: 600 }}>{team.estimatedLevel || '—'}</div>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>{team.observations || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ FOOTER ══ */}
            <div style={{
              marginTop: 40,
              paddingTop: 20,
              borderTop: '1px solid #1A1A26',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: 'linear-gradient(135deg, #F5A623, #D4880A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 14, color: '#000',
                }}>S</div>
                <div>
                  <div style={{
                    fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 11,
                    color: '#F5A623',
                  }}>SIELLO ACADEMY</div>
                  <div style={{ fontSize: 9, color: '#4B5563' }}>Siello Football Group</div>
                </div>
              </div>
              <div style={{ fontSize: 9, color: '#374151', textAlign: 'right' }}>
                <div>Confidential — Scouting Report</div>
                <div>{new Date().getFullYear()} · siellofootball.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
