import Image from 'next/image';
import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMediaInfo } from '@/lib/media-utils';

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  // Get media info using shared utility
  const mediaInfo = getMediaInfo(url);

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

  if (mediaInfo.isVideo) {
    return (
      <div className="relative group">
        <video
          ref={setVideoRef}
          src={mediaInfo.url}
          width={width}
          height={height}
          autoPlay={true}
          loop={true}
          className="rounded-md object-fill w-full h-full"
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

  if (mediaInfo.isImage) {
    return (
      <div className="relative">
        <Image
          src={mediaInfo.url}
          alt="Export preview"
          width={width}
          height={height}
          className="rounded-md object-fill w-full h-full"
        />
      </div>
    );
  }

  // Fallback for unknown file types
  return (
    <div
      className="rounded-md bg-muted flex items-center justify-center"
      style={{ width, height }}
    >
      <span className="text-xs text-muted-foreground">
        Preview not available
      </span>
    </div>
  );
}
