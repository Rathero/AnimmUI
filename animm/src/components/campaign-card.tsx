import Image from 'next/image';
import { FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExportBatch } from '@/types/exports';

interface CampaignCardProps {
  campaign: string;
  exportBatches: ExportBatch[];
  onClick: () => void;
}

export default function CampaignCard({
  campaign,
  exportBatches,
  onClick,
}: CampaignCardProps) {
  // Get the first finished export image as preview
  const firstFinishedExport = exportBatches
    .flatMap(batch => batch.exports)
    .find(exp => exp.status === 2 && exp.url);

  // Handle both relative and absolute URLs
  let previewImage = '/img/placeholder.svg';
  if (firstFinishedExport?.url) {
    if (firstFinishedExport.url.startsWith('http')) {
      previewImage = firstFinishedExport.url;
    } else {
      previewImage = firstFinishedExport.url.startsWith('/')
        ? firstFinishedExport.url
        : `/${firstFinishedExport.url}`;
    }
  }
  const totalExports = exportBatches.flatMap(batch => batch.exports).length;
  const finishedExports = exportBatches
    .flatMap(batch => batch.exports)
    .filter(exp => exp.status === 2).length;

  return (
    <Card
      className="flex flex-row w-full h-36 overflow-hidden transition-shadow hover:shadow-md hover:shadow-slate-500/10 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-0 w-72 h-full">
        <div className="relative w-full h-full">
          <Image
            src={previewImage}
            alt="Campaign preview"
            priority
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      </CardHeader>
      <CardContent className="w-full p-4 ps-6 h-full">
        <div className="flex justify-between gap-6">
          <div>
            <h2 className="font-medium">{campaign}</h2>
            <p className="text-sm line-clamp-2 text-muted-foreground">
              {totalExports} total exports • {finishedExports} completed
            </p>
          </div>
          <div>
            <div className="rounded-md border border-border p-2">
              <FolderOpen className="w-5 h-5 text-muted-foreground/70" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
