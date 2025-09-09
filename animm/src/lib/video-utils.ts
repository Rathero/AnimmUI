import videoConfig from '@/data/VideoConfig.json';

/**
 * Get video source for a template ID
 * @param templateId - The template ID
 * @param customVideoUrl - Optional custom video URL from URL parameters
 * @returns Video URL or null if not found
 */
export function getVideoSource(
  templateId: number,
  customVideoUrl?: string | null
): string | null {
  // Prioritize custom video URL from URL parameters
  if (customVideoUrl) {
    return customVideoUrl;
  }

  // Fall back to video config
  const configVideoUrl = (videoConfig as Record<string, string>)[
    templateId.toString()
  ];
  return configVideoUrl || null;
}

/**
 * Video element props for consistent styling across editor and viewer
 * @param videoSrc - The video source URL
 * @param autoplay - Whether the video should autoplay (default: true)
 */
export const getVideoElementProps = (
  videoSrc: string,
  autoplay: boolean = true
) => ({
  key: videoSrc,
  width: '100%',
  height: '100%',
  autoPlay: autoplay,
  muted: true,
  loop: true,
  id: 'videoBackground',
  style: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    zIndex: -1,
    objectFit: 'cover' as const,
  },
});
