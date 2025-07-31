'use client';
import { HeaderPage } from '@/components/header-page';
import { useEffect, useState } from 'react';
import useExportsService from '@/app/services/ExportsService';
import { Export, ExportBatch } from '@/types/exports';
import JSZip from 'jszip';
import CampaignCard from '@/components/campaign-card';
import ExportCard from '@/components/export-card';
import FolderNavigation from '@/components/folder-navigation';
import BreadcrumbNavigation from '@/components/breadcrumb-navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Download, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  buildFolderStructure,
  getExportsForPath,
  getBreadcrumbPath,
  FolderNode,
} from '@/lib/folder-structure';

export default function ExportsPage() {
  const [exportBatches, setExportBatches] = useState<ExportBatch[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolderPath, setCurrentFolderPath] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folderStructure, setFolderStructure] = useState<FolderNode>({
    name: 'root',
    children: {},
    exports: [],
  });

  const { getAll } = useExportsService();
  const fetchExports = async () => {
    setIsLoading(true);
    try {
      const exports = await getAll(0);
      setExportBatches(exports?.Result ?? []);
    } catch (error) {
      console.error('Error fetching exports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();
  }, []);

  // Build folder structure when exports change
  useEffect(() => {
    if (selectedCampaign) {
      const campaignExports = getCampaignExports(selectedCampaign);
      const structure = buildFolderStructure(campaignExports);
      setFolderStructure(structure);
    }
  }, [selectedCampaign, exportBatches]);

  // Group export batches by campaign
  const campaigns = exportBatches.reduce((acc, batch) => {
    const campaign = batch.campaign || 'Unnamed Campaign';
    if (!acc[campaign]) {
      acc[campaign] = [];
    }
    acc[campaign].push(batch);
    return acc;
  }, {} as Record<string, ExportBatch[]>);

  // Filter out campaigns with no exports or no campaign name
  const filteredCampaigns = Object.entries(campaigns).filter(
    ([campaign, batches]) => {
      // Check if campaign has a valid name (not empty or 'Unnamed Campaign')
      const hasValidName =
        campaign && campaign.trim() !== '' && campaign !== 'Unnamed Campaign';

      // Check if campaign has any exports
      const totalExports = batches.flatMap(batch => batch.exports).length;
      const hasExports = totalExports > 0;

      return hasValidName && hasExports;
    }
  );

  // Get all exports for a specific campaign
  const getCampaignExports = (campaign: string): Export[] => {
    return campaigns[campaign]?.flatMap(batch => batch.exports) || [];
  };

  // Get exports for current folder path
  const getCurrentFolderExports = (campaign: string): Export[] => {
    const campaignExports = getCampaignExports(campaign);
    return getExportsForPath(campaignExports, currentFolderPath);
  };

  // Filter exports based on search query
  const getFilteredExports = (campaign: string): Export[] => {
    const exports = getCurrentFolderExports(campaign);
    if (!searchQuery) return exports;

    // Normalize search query: remove extra spaces and convert to lowercase
    const normalizedQuery = searchQuery
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

    return exports.filter(exp => {
      const fileName = exp.url
        ? exp.url.split('/').pop()?.split('.')[0] || ''
        : '';

      // Normalize filename: remove underscores and convert to lowercase
      const normalizedFileName = fileName.toLowerCase().replace(/_/g, ' ');

      // Check if all search terms are present in the filename
      const searchTerms = normalizedQuery.split(' ');
      return searchTerms.every(term => normalizedFileName.includes(term));
    });
  };

  // Handle folder path change
  const handleFolderPathChange = (path: string[]) => {
    setCurrentFolderPath(path);
    setSearchQuery(''); // Clear search when changing folders
  };

  // Handle folder toggle (expand/collapse)
  const handleFolderToggle = (path: string[]) => {
    const updateFolderStructure = (
      node: FolderNode,
      currentPath: string[]
    ): FolderNode => {
      if (currentPath.length === 0) {
        return {
          ...node,
          children: Object.fromEntries(
            Object.entries(node.children).map(([name, child]) => [
              name,
              updateFolderStructure(child, []),
            ])
          ),
        };
      }

      const [currentSegment, ...remainingPath] = currentPath;
      if (node.children[currentSegment]) {
        return {
          ...node,
          children: {
            ...node.children,
            [currentSegment]: {
              ...node.children[currentSegment],
              isOpen:
                remainingPath.length === 0
                  ? !node.children[currentSegment].isOpen
                  : updateFolderStructure(
                      node.children[currentSegment],
                      remainingPath
                    ).isOpen,
              children:
                remainingPath.length === 0
                  ? node.children[currentSegment].children
                  : updateFolderStructure(
                      node.children[currentSegment],
                      remainingPath
                    ).children,
            },
          },
        };
      }
      return node;
    };

    setFolderStructure(prev => updateFolderStructure(prev, path));
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
      <HeaderPage title="Exports" />
      <div className="w-full p-4 flex flex-col gap-4">
        {selectedCampaign ? (
          // Campaign detail view
          <div className="flex gap-6">
            {/* Folder Navigation Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-4">
                <FolderNavigation
                  folderStructure={folderStructure}
                  currentPath={currentFolderPath}
                  onPathChange={handleFolderPathChange}
                  onToggleFolder={handleFolderToggle}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCampaign(null);
                      setCurrentFolderPath([]);
                      setSearchQuery('');
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Campaigns
                  </Button>
                  <h2 className="text-xl font-semibold">{selectedCampaign}</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownloadAllAsZip(
                      getCurrentFolderExports(selectedCampaign)
                    )
                  }
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as ZIP
                </Button>
              </div>

              {/* Breadcrumb Navigation */}
              <BreadcrumbNavigation
                breadcrumbs={getBreadcrumbPath(currentFolderPath)}
                onPathChange={handleFolderPathChange}
              />

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search exports..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {getFilteredExports(selectedCampaign).map(exportItem => (
                  <ExportCard key={exportItem.id} exportItem={exportItem} />
                ))}
              </div>

              {getFilteredExports(selectedCampaign).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'No exports found matching your search.'
                    : currentFolderPath.length > 0
                    ? 'No exports found in this folder.'
                    : 'No exports found for this campaign.'}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Campaign cards view
          <>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns found. Create some exports to see them grouped by
                  campaign.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCampaigns.map(([campaign, batches]) => (
                  <CampaignCard
                    key={campaign}
                    campaign={campaign}
                    exportBatches={batches}
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setCurrentFolderPath([]); // Reset to root folder
                      setSearchQuery(''); // Clear search
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
