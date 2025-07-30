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
      className="flex flex-col w-full h-auto min-h-[144px] overflow-hidden transition-shadow hover:shadow-md hover:shadow-slate-500/10 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-0 h-32 flex-shrink-0">
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
      <CardContent className="flex-1 p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-sm line-clamp-1">{campaign}</h2>
            <p className="text-xs line-clamp-2 text-muted-foreground mt-1">
              {totalExports} total exports • {finishedExports} completed
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="rounded-md border border-border p-1.5">
              <FolderOpen className="w-4 h-4 text-muted-foreground/70" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
