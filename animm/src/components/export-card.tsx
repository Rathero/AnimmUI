'use client';

import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Export, ExportStatusEnum } from '@/types/exports';
import ExportPreview from '@/components/export-preview';

// Helper function to extract filename from URL
const getFileNameFromUrl = (url: string): string => {
  try {
    // Remove query parameters and hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    // Get the last part of the path
    const pathParts = cleanUrl.split('/');
    const fileName = pathParts[pathParts.length - 1];

    // If no filename found, return a default
    if (!fileName || fileName === '') {
      return 'Unknown file';
    }

    // Remove file extension for cleaner display
    const nameWithoutExtension = fileName.split('.')[0];
    return nameWithoutExtension || fileName;
  } catch {
    return 'Unknown file';
  }
};

interface ExportCardProps {
  exportItem: Export;
}

export default function ExportCard({ exportItem }: ExportCardProps) {
  const getStatusBadge = (status: ExportStatusEnum) => {
    switch (status) {
      case ExportStatusEnum.Pending:
        return <Badge variant="default">Pending</Badge>;
      case ExportStatusEnum.InProgress:
        return <Badge variant="outline">In progress</Badge>;
      case ExportStatusEnum.Finished:
        return <Badge variant="outline">Finished</Badge>;
      case ExportStatusEnum.Failed:
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Preview */}
          <div className="relative">
            {exportItem.status === ExportStatusEnum.Finished &&
            exportItem.url ? (
              <div className="relative">
                <ExportPreview url={exportItem.url} width={280} height={160} />
                {/* Status Badge and Action Buttons - Top Right */}
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                  {getStatusBadge(exportItem.status)}
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
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
                      className="w-8 h-8 p-0"
                      onClick={() => window.open(exportItem.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-40 bg-muted rounded-md flex items-center justify-center">
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

          {/* Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm truncate">
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
