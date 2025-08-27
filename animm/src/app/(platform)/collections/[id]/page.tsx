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
import { videoData } from '@/data/videoData';

export default function page({ params }: { params: Promise<{ id: string }> }) {
  const [collection, setCollection] = useState<ApiCollection | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const { get } = useCollectionsService();
  const { setPageTitle } = platformStore(state => state);
  const searchParams = useSearchParams();

  // Image data array - easily configurable
  const imageData = [
    {
      id: 1,
      title: 'EP1 Road to Icons - DE',
      url: 'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_DE.jpg',
      locale: 'DE',
      thumbnail:
        'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_DE.jpg',
    },
    {
      id: 2,
      title: 'EP1 Road to Icons - ES',
      url: 'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_ES.jpg',
      locale: 'ES',
      thumbnail:
        'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_ES.jpg',
    },
    {
      id: 3,
      title: 'EP1 Road to Icons - FR',
      url: 'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_FR.jpg',
      locale: 'FR',
      thumbnail:
        'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_FR.jpg',
    },
    {
      id: 4,
      title: 'EP1 Road to Icons - IT',
      url: 'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_IT.jpg',
      locale: 'IT',
      thumbnail:
        'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_IT.jpg',
    },
    {
      id: 5,
      title: 'EP1 Road to Icons - PL',
      url: 'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_PL.jpg',
      locale: 'PL',
      thumbnail:
        'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_PL.jpg',
    },
    {
      id: 6,
      title: 'EP1 Road to Icons - TR',
      url: 'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_TR.jpg',
      locale: 'TR',
      thumbnail:
        'https://animmfilesv2.blob.core.windows.net/riot/image/RoadToIcons_Endcard_TR.jpg',
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

  // Get filtered images based on URL parameters
  const getFilteredImages = () => {
    const locale = searchParams.get('locale');

    if (!locale) {
      return imageData; // Show all images if no locale filter
    }

    return imageData.filter(image => {
      const matchesLocale = image.locale === locale;
      return matchesLocale;
    });
  };

  // Get active tab from URL parameters
  const getActiveTab = () => {
    return searchParams.get('tab') || 'overview';
  };

  // Video Modal Component
  const VideoModal = ({
    isOpen,
    onClose,
    video,
  }: {
    isOpen: boolean;
    onClose: () => void;
    video: any;
  }) => {
    if (!isOpen || !video) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{video.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="p-4">
            <video
              controls
              className="w-full h-auto max-h-[70vh]"
              autoPlay
              src={video.url}
            >
              Your browser does not support the video tag.
            </video>
            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Locale:</strong> {video.locale}
              </p>
              <p>
                <strong>Format:</strong> {video.format}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Image Modal Component
  const ImageModal = ({
    isOpen,
    onClose,
    image,
  }: {
    isOpen: boolean;
    onClose: () => void;
    image: any;
  }) => {
    if (!isOpen || !image) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{image.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="p-4 flex justify-center">
            <img
              src={image.url}
              alt={image.title}
              className="max-w-full max-h-[70vh] object-contain"
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.src = '/img/placeholder.svg';
              }}
            />
          </div>
          <div className="p-4 border-t">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Locale:</strong> {image.locale}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Special layout for Road to Icons (collection ID 4)
  const renderRoadToIconsLayout = () => {
    const filteredVideos = getFilteredVideos();
    const activeTab = getActiveTab();

    return (
      <div className="w-full">
        {/* Navigation Tabs */}
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {filteredVideos.map(video => (
                <Card
                  key={video.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setSelectedVideo(video);
                    setIsVideoModalOpen(true);
                  }}
                >
                  <div className="relative h-48">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/img/placeholder.svg';
                      }}
                    />
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
            {/* Images Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {getFilteredImages().map(image => (
                <Card
                  key={image.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setSelectedImage(image);
                    setIsImageModalOpen(true);
                  }}
                >
                  <div className="relative h-48">
                    <img
                      src={image.thumbnail}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/img/placeholder.svg';
                      }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{image.title}</span>
                      </div>
                      <MoreVertical className="w-4 h-4 text-gray-500 cursor-pointer" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Image</p>
                    <div className="mt-2 text-xs text-gray-400">
                      <p>Locale: {image.locale}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {getFilteredImages().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-4" />
                <p>No images found for the selected filters</p>
              </div>
            )}
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

        {/* Video Modal */}
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => {
            setIsVideoModalOpen(false);
            setSelectedVideo(null);
          }}
          video={selectedVideo}
        />

        {/* Image Modal */}
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => {
            setIsImageModalOpen(false);
            setSelectedImage(null);
          }}
          image={selectedImage}
        />
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
