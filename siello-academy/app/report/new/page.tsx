'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createNewReport, saveReport } from '@/lib/storage';

export default function NewReportPage() {
  const router = useRouter();

  useEffect(() => {
    const report = createNewReport();
    saveReport(report);
    router.replace(`/report/${report.id}`);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
    </div>
  );
}
