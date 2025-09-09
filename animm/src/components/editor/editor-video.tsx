import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Upload, Play, Pause } from 'lucide-react';
import { useRef, useState } from 'react';

export default function EditorVideo({
  videoSrc,
  onVideoChange,
}: {
  videoSrc: string | null;
  onVideoChange: (videoSrc: string | null) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const videoUrl = URL.createObjectURL(file);
      onVideoChange(videoUrl);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  if (!videoSrc) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Separator className="my-4" />
      <p className="text-sm">Video</p>
      <div className="ps-2">
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative w-full h-32 bg-gray-100 rounded-md border cursor-pointer overflow-hidden group">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src={videoSrc}
                onEnded={handleVideoEnded}
                muted
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={togglePlayPause}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" className="w-64 p-2">
            <div className="grid gap-1.5">
              <div className="relative w-full h-40 rounded-lg border overflow-hidden bg-sidebar">
                <video
                  className="w-full h-full object-cover"
                  src={videoSrc}
                  controls
                />
              </div>
              <div className="grid gap-1.5">
                <div
                  className="relative w-full rounded-lg border overflow-hidden bg-sidebar cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => {
                    if (hiddenFileInput.current) {
                      hiddenFileInput.current.click();
                    }
                  }}
                >
                  <input
                    ref={hiddenFileInput}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant="secondary"
                    className="w-full h-10 rounded-lg"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Video
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
