'use client';
import { HeaderPage } from '@/components/header-page';
import { ExportsColumns } from './exports-columns';
import { DataTable } from '@/components/table/data-table';
import { useEffect, useState } from 'react';
import useExportsService from '@/app/services/ExportsService';
import { Export, ExportBatch } from '@/types/exports';
import JSZip from 'jszip';
import CampaignCard from '@/components/campaign-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ExportsPage() {
  const [exportBatches, setExportBatches] = useState<ExportBatch[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const { getAll } = useExportsService();
  const fetchExports = async () => {
    const exports = await getAll(0);
    setExportBatches(exports?.Result ?? []);
  };

  useEffect(() => {
    fetchExports();
  }, []);

  // Group export batches by campaign
  const campaigns = exportBatches.reduce((acc, batch) => {
    const campaign = batch.campaign || 'Unnamed Campaign';
    if (!acc[campaign]) {
      acc[campaign] = [];
    }
    acc[campaign].push(batch);
    return acc;
  }, {} as Record<string, ExportBatch[]>);

  // Get all exports for a specific campaign
  const getCampaignExports = (campaign: string): Export[] => {
    return campaigns[campaign]?.flatMap(batch => batch.exports) || [];
  };

  // Download all exports as zip
  const handleDownloadAllAsZip = async (exports: Export[]) => {
    const zip = new JSZip();
    const finishedExports = exports.filter(e => e.status === 2 && e.url);
    await Promise.all(
      finishedExports.map(async exp => {
        try {
          const response = await fetch(exp.url);
          if (!response.ok) throw new Error('Failed to fetch file');
          const blob = await response.blob();
          // Extract the path after '/exports' in the URL
          const match = exp.url.match(/\/exports(.+)/i);
          let zipPath = '';
          if (match && match[1]) {
            // Decode URL-encoded path and replace backslashes with slashes
            const decodedPath = decodeURIComponent(match[1])
              .replace(/\\/g, '/')
              .replace(/^\//, '');
            // Remove the first folder (ID)
            const pathParts = decodedPath.split('/');
            if (pathParts.length > 1) {
              zipPath = pathParts.slice(1).join('/');
            } else {
              zipPath = pathParts[0];
            }
          } else {
            // fallback to export_<id> if parsing fails
            const ext = exp.url.split('.').pop()?.split('?')[0] || 'file';
            zipPath = `export_${exp.id}.${ext}`;
          }
          zip.file(zipPath, blob);
        } catch (error) {
          console.error('Error downloading export:', error);
        }
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
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <HeaderPage title="Exports" desc="Generated exports" />
      <div className="w-full p-4 flex flex-col gap-4">
        {selectedCampaign ? (
          // Campaign detail view
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCampaign(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaigns
              </Button>
              <h2 className="text-xl font-semibold">{selectedCampaign}</h2>
            </div>
            <DataTable
              columns={ExportsColumns}
              data={getCampaignExports(selectedCampaign)}
              showFilter={false}
              exportFunction={() =>
                handleDownloadAllAsZip(getCampaignExports(selectedCampaign))
              }
            />
          </div>
        ) : (
          // Campaign cards view
          <div className="grid gap-4">
            {Object.keys(campaigns).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No campaigns found. Create some exports to see them grouped by
                campaign.
              </div>
            ) : (
              Object.entries(campaigns).map(([campaign, batches]) => (
                <CampaignCard
                  key={campaign}
                  campaign={campaign}
                  exportBatches={batches}
                  onClick={() => setSelectedCampaign(campaign)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
