'use client';
import useCollectionsService from '@/app/services/CollectionsService';
import TemplateElement from '@/components/template-card';
import { ApiCollection } from '@/types/collections';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { platformStore } from '@/stores/platformStore';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Grid3X3,
  Video,
  Image,
  Download,
  Settings,
  MoreVertical,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function page({ params }: { params: Promise<{ id: string }> }) {
  const [collection, setCollection] = useState<ApiCollection | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const { get } = useCollectionsService();
  const { setPageTitle } = platformStore(state => state);
  const searchParams = useSearchParams();

  // Video data array - easily configurable
  const videoData = [
    {
      id: 1,
      title: 'EP1 Road to Icons - German',
      url: 'https://animmfilesv2.blob.core.windows.net/riot/video/EP1_Road to Icons_DE.mp4',
      locale: 'de_DE',
      format: '16x9',
      thumbnail: '/img/placeholder.svg',
    },
    {
      id: 2,
      title: 'EP1 Road to Icons - Spanish',
      url: 'https://animmfilesv2.blob.core.windows.net/riot/video/EP1_Road to Icons_ES.mp4',
      locale: 'es_ES',
      format: '16x9',
      thumbnail: '/img/placeholder.svg',
    },
    {
      id: 3,
      title: 'EP1 Road to Icons - Spanish (Duplicate)',
      url: 'https://animmfilesv2.blob.core.windows.net/riot/video/EP1_Road to Icons_ES.mp4',
      locale: 'es_ES',
      format: '9x16',
      thumbnail: '/img/placeholder.svg',
    },
    {
      id: 4,
      title: 'EP1 Road to Icons - Italian',
      url: 'https://animmfilesv2.blob.core.windows.net/riot/video/EP1_Road to Icons_IT.mp4',
      locale: 'it_IT',
      format: '1x1',
      thumbnail: '/img/placeholder.svg',
    },
  ];

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const resolvedParams = await params;
      const coll = await get(resolvedParams.id);
      setCollection(coll);

      // Set page title when collection is loaded
      if (coll?.Result?.name) {
        setPageTitle(coll.Result.name);
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set page title
  useEffect(() => {
    setPageTitle('Loading...');
    return () => setPageTitle(undefined);
  }, [setPageTitle]);

  useEffect(() => {
    fetchCollections();
  }, []);

  // Get filtered videos based on URL parameters
  const getFilteredVideos = () => {
    const locale = searchParams.get('locale');
    const format = searchParams.get('format');

    if (!locale && !format) {
      return videoData; // Show all videos if no filters
    }

    return videoData.filter(video => {
      const matchesLocale = !locale || video.locale === locale;
      const matchesFormat = !format || video.format === format;
      return matchesLocale && matchesFormat;
    });
  };

  // Get active tab from URL parameters
  const getActiveTab = () => {
    return searchParams.get('tab') || 'overview';
  };

  // Special layout for Road to Icons (collection ID 4)
  const renderRoadToIconsLayout = () => {
    const filteredVideos = getFilteredVideos();
    const activeTab = getActiveTab();

    return (
      <div className="w-full">
        {/* Navigation Tabs */}
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="h-full flex flex-col">
              <div className="flex-1 p-4">
                <div className="w-full grid grid-cols-1 3xl:grid-cols-6 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-4">
                  {collection!.Result.templates.map(template => (
                    <TemplateElement key={template.id} template={template} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video" className="mt-6">
            {/* Video Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVideos.map(video => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {video.title}
                      </h3>
                      <div className="w-16 h-1 bg-silver-300 mx-auto rounded-full"></div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{video.title}</span>
                      </div>
                      <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Video</p>
                    <div className="mt-2 text-xs text-gray-400">
                      <p>Locale: {video.locale}</p>
                      <p>Format: {video.format}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-4" />
                <p>No videos found for the selected filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            <div className="text-center py-12 text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-4" />
              <p>Images content coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="exports" className="mt-6">
            <div className="text-center py-12 text-gray-500">
              <Download className="w-12 h-12 mx-auto mb-4" />
              <p>Exports content coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="text-center py-12 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4" />
              <p>Settings content coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="h-full flex items-center justify-center">
        No collection found
      </div>
    );
  }

  // Check if this is collection ID 4 (Road to Icons) and render special layout
  if (collection.Result?.id === 4) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4">{renderRoadToIconsLayout()}</div>
      </div>
    );
  }

  if (
    !collection.Result?.templates ||
    collection.Result.templates.length === 0
  ) {
    return (
      <div className="h-full flex items-center justify-center">
        No templates found in this collection
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4">
        <div className="w-full grid grid-cols-1 3xl:grid-cols-6 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-4">
          {collection.Result.templates.map(template => (
            <TemplateElement key={template.id} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
}
