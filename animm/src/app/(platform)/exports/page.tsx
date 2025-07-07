'use client';
import { HeaderPage } from '@/components/header-page';
import { ExportsColumns } from './exports-columns';
import { DataTable } from '@/components/table/data-table';
import { useEffect, useState } from 'react';
import { GeneratedAnimation } from '@/types/generatedAnimations';
import useExportsService from '@/app/services/ExportsService';
import { Export, ExportBatch } from '@/types/exports';
import { debug } from 'console';
import JSZip from 'jszip';
import useFetchWithAuth from '@/app/services/fetchWithAuth';

export default function ExportsPage() {
  const [exportBatches, setExportBatches] = useState<ExportBatch[]>([]);
  const [downloading, setDownloading] = useState(false);

  const { getAll } = useExportsService();
  const fetchWithAuth = useFetchWithAuth();
  const fetchExports = async () => {
    const exports = await getAll(0);
    setExportBatches(exports?.Result ?? []);
  };

  useEffect(() => {
    fetchExports();
  }, []);

  // Download all exports as zip
  const handleDownloadAllAsZip = async (exports: Export[]) => {
    setDownloading(true);
    const zip = new JSZip();
    const finishedExports = exports.filter(e => e.status === 2 && e.url);
    await Promise.all(
      finishedExports.map(async (exp, idx) => {
        try {
          const response = await fetch(exp.url);
          if (!response.ok) throw new Error('Failed to fetch file');
          const blob = await response.blob();
          const ext = exp.url.split('.').pop()?.split('?')[0] || 'file';
          zip.file(`export_${exp.id}.${ext}`, blob);
        } catch (e) {}
      })
    );
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exports.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage title="Exports" desc="Generated exports" />
      <div className="w-full p-4 flex flex-col gap-4">
        {exportBatches.map(batch => {
          if (batch.exports.length > 0) {
            return (
              <DataTable
                key={batch.id}
                columns={ExportsColumns}
                data={batch.exports}
                showFilter={false}
                exportFunction={() => handleDownloadAllAsZip(batch.exports)}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
