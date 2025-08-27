'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, Download, Settings } from 'lucide-react';
import { videoData, VideoData } from '@/data/videoData';

export default function EditorKoobo() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);

  // Configurable variables array with title, language-specific values, and timestamps
  const configurableVariables = [
    {
      title: 'ROAD TO ICONS',
      timestamp: 15, // 15 seconds
      values: {
        DE: 'ROAD TO ICONS',
        ES: 'CAMINO A LOS ÍCONOS',
        FR: 'LA ROUTE VERS LES ICÔNES',
        IT: 'LA STRADA VERSO LE ICONE',
        PL: 'DROGA DO IKON',
        TR: 'İKONLARA GİDEN YOL',
      },
    },
    {
      title: 'KWANGDONG FREECS',
      timestamp: 45, // 45 seconds
      values: {
        DE: 'KWANGDONG FREECS',
        ES: 'KWANGDONG FREECS',
        FR: 'KWANGDONG FREECS',
        IT: 'KWANGDONG FREECS',
        PL: 'KWANGDONG FREECS',
        TR: 'KWANGDONG FREECS',
      },
    },
    {
      title: 'REGIONAL RECORD',
      timestamp: 90, // 90 seconds
      values: {
        DE: 'REGIONAL REKORD',
        ES: 'RÉCORD REGIONAL',
        FR: 'RECORD RÉGIONAL',
        IT: 'RECORD REGIONALE',
        PL: 'REKORD REGIONALNY',
        TR: 'BÖLGESEL REKOR',
      },
    },
  ];

  useEffect(() => {
    // Find the video based on the ID from the URL
    if (params.id) {
      const video = videoData.find(v => v.id === parseInt(params.id));
      if (video) {
        setCurrentVideo(video);
      }
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Video Not Found
          </h2>
          <p className="text-gray-500 mb-4">
            The requested video could not be found.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#f7f8fa]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2 h-auto"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold">Editor Koobo</span>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <span className="text-sm font-medium text-gray-600">
            {currentVideo.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar: Video Info */}
        <div className="w-[320px] bg-white border-r flex flex-col">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {/* Variables */}
              <div className="space-y-3">
                <div className="space-y-3 pl-3">
                  {/* Configurable Variables */}
                  {configurableVariables.map((variable, index) => (
                    <div key={index} className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded border">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          {variable.title}
                        </label>
                        <input
                          type="text"
                          defaultValue={
                            currentVideo
                              ? variable.values[
                                  currentVideo.locale as keyof typeof variable.values
                                ]
                              : variable.title
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter ${variable.title.toLowerCase()}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Video Player */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0 relative">
          <div className="w-full h-full overflow-hidden p-4">
            <div className="w-full h-full relative rounded-lg border bg-sidebar bg-editor">
              {/* Format and Resolution Info */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded">
                  {currentVideo.format}
                </span>
                <span className="text-sm font-medium text-gray-700 bg-white px-2 py-1 rounded">
                  {currentVideo.locale}
                </span>
              </div>

              {/* Video Player */}
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="flex flex-col items-center max-w-2xl w-full">
                  <video
                    controls
                    className="w-full max-w-full h-auto rounded-lg shadow-lg"
                    style={{ maxHeight: '60vh' }}
                    autoPlay
                    src={currentVideo.url}
                    muted={true}
                    poster={currentVideo.thumbnail}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Language & Resolution Selector */}
        <div className="w-[280px] bg-white border-l flex flex-col">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              Language & Resolution
            </h3>

            {/* Language Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Language
              </h4>
              <div className="space-y-2">
                {['DE', 'ES', 'FR', 'IT', 'PL', 'TR'].map(locale => (
                  <button
                    key={locale}
                    onClick={() => {
                      const video = videoData.find(
                        v =>
                          v.locale === locale &&
                          v.format === currentVideo.format
                      );
                      if (video) {
                        setCurrentVideo(video);
                        router.push(`/editorkoobo/${video.id}`);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      currentVideo.locale === locale
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {locale}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Resolution
              </h4>
              <div className="space-y-2">
                {['16x9', '1x1', '4x5'].map(format => (
                  <button
                    key={format}
                    onClick={() => {
                      const video = videoData.find(
                        v =>
                          v.format === format &&
                          v.locale === currentVideo.locale
                      );
                      if (video) {
                        setCurrentVideo(video);
                        router.push(`/editorkoobo/${video.id}`);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      currentVideo.format === format
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
