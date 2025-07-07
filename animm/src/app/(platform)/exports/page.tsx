'use client';
import { HeaderPage } from '@/components/header-page';
import { ExportsColumns } from './exports-columns';
import { DataTable } from '@/components/table/data-table';
import { useEffect, useState } from 'react';
import { GeneratedAnimation } from '@/types/generatedAnimations';
import useExportsService from '@/app/services/ExportsService';
import { ExportBatch } from '@/types/exports';
import { debug } from 'console';

export default function ExportsPage() {
  const [exportBatches, setExportBatches] = useState<ExportBatch[]>([]);

  const { getAll } = useExportsService();
  const fetch = async () => {
    const exports = await getAll(0);
    setExportBatches(exports?.Result ?? []);
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage title="Exports" desc="Generated exports" />
      <div className="w-full p-4">
        {exportBatches.map(batch => {
          if (batch.exports.length > 0) {
            return (
              <DataTable
                key={batch.id}
                columns={ExportsColumns}
                data={batch.exports}
                showFilter={false}
                exportFunction={() => {}}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
