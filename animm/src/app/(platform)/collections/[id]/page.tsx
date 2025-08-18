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

export default function page({ params }: { params: Promise<{ id: string }> }) {
  const [collection, setCollection] = useState<ApiCollection | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const { get } = useCollectionsService();
  const { setPageTitle } = platformStore(state => state);

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

  // Special layout for Road to Icons (collection ID 4)
  const renderRoadToIconsLayout = () => {
    return (
      <div className="w-full">
        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Content Cards */}
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
            <div className="text-center py-12 text-gray-500">
              <Video className="w-12 h-12 mx-auto mb-4" />
              <p>Video content coming soon</p>
            </div>
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
