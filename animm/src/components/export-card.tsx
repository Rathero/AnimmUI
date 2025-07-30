'use client';

import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Export, ExportStatusEnum } from '@/types/exports';
import ExportPreview from '@/components/export-preview';
import { getFileNameFromUrl } from '@/lib/utils';

interface ExportCardProps {
  exportItem: Export;
}

export default function ExportCard({ exportItem }: ExportCardProps) {
  const getStatusBadge = (status: ExportStatusEnum) => {
    switch (status) {
      case ExportStatusEnum.Pending:
        return (
          <Badge variant="default" className="bg-white text-black">
            Pending
          </Badge>
        );
      case ExportStatusEnum.InProgress:
        return (
          <Badge variant="outline" className="bg-white text-black">
            In progress
          </Badge>
        );
      case ExportStatusEnum.Finished:
        return (
          <Badge variant="outline" className="bg-white text-black">
            Finished
          </Badge>
        );
      case ExportStatusEnum.Failed:
        return (
          <Badge variant="destructive" className="bg-white text-red-600">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-white text-black">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <Card className="overflow-hidden h-70 flex flex-col">
      <CardContent className="p-2 flex-1 flex flex-col">
        <div className="space-y-3 flex-1 flex flex-col">
          {/* Preview - Limited to 70% of card height */}
          <div className="relative h-56 flex-shrink-0">
            {exportItem.status === ExportStatusEnum.Finished &&
            exportItem.url ? (
              <div className="relative w-full h-full bg-muted rounded-md overflow-hidden">
                <ExportPreview url={exportItem.url} width={280} height={200} />
                {/* Status Badge and Action Buttons - Top Right */}
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                  {getStatusBadge(exportItem.status)}
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-white/20"
                      onClick={() => {
                        navigator.clipboard.writeText(exportItem.url);
                        toast.success('URL copied to clipboard');
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-white/20"
                      onClick={() => window.open(exportItem.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full bg-muted rounded-md flex items-center justify-center">
                {/* Status Badge - Top Right */}
                <div className="absolute top-2 right-2 z-10">
                  {getStatusBadge(exportItem.status)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {exportItem.status === ExportStatusEnum.Pending
                    ? 'Pending'
                    : exportItem.status === ExportStatusEnum.InProgress
                    ? 'Processing'
                    : 'No preview'}
                </span>
              </div>
            )}
          </div>

          {/* Name - Guaranteed minimum space */}
          <div className="space-y-2 flex-shrink-0 min-h-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-foreground break-words line-clamp-2 leading-tight">
                {exportItem.url
                  ? getFileNameFromUrl(exportItem.url)
                  : 'No file'}
              </h3>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
