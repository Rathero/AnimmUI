'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Inline image preview states
  const [previewStates, setPreviewStates] = useState<{
    [key: string]: { isGenerating: boolean; imageUrl: string | null };
  }>({});

  const [previewPositions, setPreviewPositions] = useState<{
    [key: string]: { x: number; y: number; width: number; height: number };
  }>({});

  // Video control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        videoRef.current.currentTime - 10
      );
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 10
      );
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const openImagePreview = (title: string, type: 'variable' | 'subtitle') => {
    const key = `${type}-${title}`;

    // Get the position of the clicked element
    const element = document.querySelector(`[data-preview="${key}"]`);
    if (element) {
      const rect = element.getBoundingClientRect();
      setPreviewPositions(prev => ({
        ...prev,
        [key]: {
          x: rect.right + 8, // 8px margin
          y: rect.top,
          width: rect.width,
          height: rect.height,
        },
      }));
    }

    setPreviewStates(prev => ({
      ...prev,
      [key]: { isGenerating: true, imageUrl: null },
    }));

    // Simulate image generation with 5 second delay
    setTimeout(() => {
      setPreviewStates(prev => ({
        ...prev,
        [key]: {
          isGenerating: false,
          imageUrl: `https://via.placeholder.com/200x150/${
            type === 'variable' ? '8B5CF6' : '10B981'
          }/FFFFFF?text=${encodeURIComponent(title)}`,
        },
      }));
    }, 5000);
  };

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && videoDuration > 0) {
      const timeline = event.currentTarget;
      const rect = timeline.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const timelineWidth = rect.width;
      const clickTime = (clickX / timelineWidth) * videoDuration;

      videoRef.current.currentTime = Math.max(
        0,
        Math.min(clickTime, videoDuration)
      );
    }
  };

  // Configurable variables array with title, language-specific values, and timestamps
  const configurableVariables = [
    {
      id: 1,
      title: 'ROAD TO ICONS',
      timestamp: 5, // 5 seconds
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
      id: 2,
      title: 'KWANGDONG FREECS',
      timestamp: 10, // 10 seconds
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
      id: 3,
      title: 'REGIONAL RECORD',
      timestamp: 24, // 24 seconds
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

  // Configurable subtitles array with title, start/end timestamps, and language-specific values
  const configurableSubtitles = [
    {
      id: 1,
      startTime: 2,
      endTime: 8,
      values: {
        DE: 'Willkommen bei Road to Icons',
        ES: 'Bienvenidos a Camino a los Íconos',
        FR: 'Bienvenue sur La Route vers les Icônes',
        IT: 'Benvenuti su La Strada verso le Icone',
        PL: 'Witamy w Drodze do Ikon',
        TR: 'İkonlara Giden Yola Hoş Geldiniz',
      },
    },
    {
      id: 2,
      startTime: 12,
      endTime: 18,
      values: {
        DE: 'Das ist das Kwangdong Freecs Team',
        ES: 'Este es el equipo Kwangdong Freecs',
        FR: "Voici l'équipe Kwangdong Freecs",
        IT: 'Questa è la squadra Kwangdong Freecs',
        PL: 'To jest zespół Kwangdong Freecs',
        TR: 'Bu Kwangdong Freecs takımı',
      },
    },
    {
      id: 3,
      startTime: 20,
      endTime: 30,
      values: {
        DE: 'Ein neuer regionaler Rekord wurde aufgestellt',
        ES: 'Se ha establecido un nuevo récord regional',
        FR: 'Un nouveau record régional a été établi',
        IT: 'È stato stabilito un nuovo record regionale',
        PL: 'Ustanowiono nowy rekord regionalny',
        TR: 'Yeni bir bölgesel rekor kırıldı',
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
            <span className="text-lg font-semibold">Editor</span>
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
              {/* Variables Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Variables
                </h3>
                <div className="space-y-3 pl-3">
                  {/* Configurable Variables */}
                  {configurableVariables.map((variable, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="p-3 bg-gray-50 rounded border"
                        data-preview={`variable-${variable.title}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                              {variable.title}
                            </label>
                            <button
                              onClick={() =>
                                openImagePreview(variable.title, 'variable')
                              }
                              className="p-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Preview image"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                          </div>
                          <span className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded">
                            {Math.floor(variable.timestamp / 60)}:
                            {(variable.timestamp % 60)
                              .toString()
                              .padStart(2, '0')}
                          </span>
                        </div>
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

              {/* Subtitles Section */}
              <div className="space-y-3 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Subtitles
                </h3>
                <div className="space-y-3 pl-3">
                  {/* Configurable Subtitles */}
                  {configurableSubtitles.map((subtitle, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="p-3 bg-gray-50 rounded border"
                        data-preview={`subtitle-${subtitle.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                openImagePreview(subtitle.id, 'subtitle')
                              }
                              className="p-1 text-green-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Preview image"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                          </div>
                          <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                            {Math.floor(subtitle.startTime / 60)}:
                            {(subtitle.startTime % 60)
                              .toString()
                              .padStart(2, '0')}{' '}
                            - {Math.floor(subtitle.endTime / 60)}:
                            {(subtitle.endTime % 60)
                              .toString()
                              .padStart(2, '0')}
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          defaultValue={
                            currentVideo
                              ? subtitle.values[
                                  currentVideo.locale as keyof typeof subtitle.values
                                ]
                              : ''
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder={`Enter`}
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
                    ref={videoRef}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setVideoDuration(videoRef.current.duration);
                      }
                    }}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                      }
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full max-w-full h-auto rounded-lg shadow-lg"
                    style={{ maxHeight: '60vh' }}
                    autoPlay
                    src={currentVideo.url}
                    muted={isMuted}
                    poster={currentVideo.thumbnail}
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Custom Timeline */}
                  <div className="w-full mt-4">
                    <div className="relative">
                      {/* Timeline Bar */}
                      <div
                        className="w-full h-2 bg-gray-300 rounded-full relative cursor-pointer hover:bg-gray-400 transition-colors"
                        onClick={handleTimelineClick}
                        title="Click to jump to specific time"
                      >
                        {/* Progress Bar */}
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-100"
                          style={{
                            width: `${(currentTime / videoDuration) * 100}%`,
                          }}
                        />

                        {/* Variable Dots */}
                        {configurableVariables.map((variable, index) => (
                          <div
                            key={index}
                            className="absolute top-0 w-3 h-3 bg-orange-500 rounded-full transform -translate-y-0.5 cursor-pointer hover:scale-125 transition-transform"
                            style={{
                              left: `${
                                (variable.timestamp / videoDuration) * 100
                              }%`,
                              zIndex: 10,
                            }}
                            title={`${variable.title} at ${Math.floor(
                              variable.timestamp / 60
                            )}:${(variable.timestamp % 60)
                              .toString()
                              .padStart(2, '0')}`}
                            onClick={e => {
                              e.stopPropagation(); // Prevent timeline click
                              if (videoRef.current) {
                                videoRef.current.currentTime =
                                  variable.timestamp;
                              }
                            }}
                          />
                        ))}

                        {/* Subtitle Dots */}
                        {configurableSubtitles.map((subtitle, index) => (
                          <div
                            key={`subtitle-${index}`}
                            className="absolute top-0 w-3 h-3 bg-green-500 rounded-full transform -translate-y-0.5 cursor-pointer hover:scale-125 transition-transform"
                            style={{
                              left: `${
                                (subtitle.startTime / videoDuration) * 100
                              }%`,
                              zIndex: 10,
                            }}
                            title={`${subtitle.id} starts at ${Math.floor(
                              subtitle.startTime / 60
                            )}:${(subtitle.startTime % 60)
                              .toString()
                              .padStart(2, '0')}`}
                            onClick={e => {
                              e.stopPropagation(); // Prevent timeline click
                              if (videoRef.current) {
                                videoRef.current.currentTime =
                                  subtitle.startTime;
                              }
                            }}
                          />
                        ))}

                        {/* Current Time Indicator */}
                        <div
                          className="absolute top-0 w-3 h-3 bg-blue-500 rounded-full transform -translate-y-0.5"
                          style={{
                            left: `${(currentTime / videoDuration) * 100}%`,
                            zIndex: 15,
                          }}
                        />
                      </div>

                      {/* Time Display */}
                      <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>
                          {Math.floor(currentTime / 60)}:
                          {(currentTime % 60).toFixed(0).padStart(2, '0')}
                        </span>
                        <span>
                          {Math.floor(videoDuration / 60)}:
                          {(videoDuration % 60).toFixed(0).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Custom Video Controls */}
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <button
                        onClick={skipBackward}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        title="Retroceder 10 segundos"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                      </button>

                      <button
                        onClick={togglePlay}
                        className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        title={isPlaying ? 'Pausar' : 'Reproducir'}
                      >
                        {isPlaying ? (
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={skipForward}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        title="Avanzar 10 segundos"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                        </svg>
                      </button>

                      <button
                        onClick={toggleMute}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        title={isMuted ? 'Activar sonido' : 'Silenciar'}
                      >
                        {isMuted ? (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
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

      {/* Floating Previews - Outside sidebar to avoid overflow issues */}
      {Object.entries(previewStates).map(([key, previewState]) => {
        const position = previewPositions[key];
        if (!position || !previewState) return null;

        return (
          <div
            key={key}
            className="fixed z-[9999] w-24 bg-white rounded border shadow-lg"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              height: `${position.height}px`,
            }}
          >
            {previewState.isGenerating ? (
              <div className="h-full bg-blue-50 rounded border border-blue-200 flex items-center justify-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-xs text-blue-600 text-center">
                    Generating...
                  </span>
                </div>
              </div>
            ) : previewState.imageUrl ? (
              <div className="h-full bg-blue-50 rounded border border-blue-200 p-1">
                <img
                  src={previewState.imageUrl}
                  alt={`Preview of ${key}`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
