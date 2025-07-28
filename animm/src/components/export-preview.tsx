import Image from 'next/image';
import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportPreviewProps {
  url: string;
  width?: number;
  height?: number;
}

export default function ExportPreview({
  url,
  width = 200,
  height = 120,
}: ExportPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Handle URL formatting for both relative and absolute URLs
  const formattedUrl = url.startsWith('http')
    ? url
    : url.startsWith('/')
    ? url
    : `/${url}`;

  // Determine if it's a video based on file extension
  const isVideo = formattedUrl.toLowerCase().match(/\.(webm|mp4|avi|mov|mkv)$/);
  const isImage = formattedUrl
    .toLowerCase()
    .match(/\.(jpg|jpeg|png|gif|webp|svg)$/);

  // Handle video play/pause
  const togglePlay = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video events
  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  if (isVideo) {
    return (
      <div className="relative group w-full h-full">
        <video
          ref={setVideoRef}
          src={formattedUrl}
          className="w-full h-full object-fill rounded-md"
          onEnded={handleVideoEnded}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            onClick={togglePlay}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="relative w-full h-full">
        <Image
          src={formattedUrl}
          alt="Export preview"
          fill
          className="object-fill rounded-md"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    );
  }

  // Fallback for unknown file types
  return (
    <div className="rounded-md bg-muted flex items-center justify-center w-full h-full">
      <span className="text-xs text-muted-foreground">
        Preview not available
      </span>
    </div>
  );
}
