/**
 * Utility functions for media type detection and URL formatting
 */

export interface MediaInfo {
  url: string;
  isVideo: boolean;
  isImage: boolean;
}

/**
 * Formats URL for both relative and absolute URLs
 */
export function formatMediaUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
}

/**
 * Determines media type based on file extension
 */
export function getMediaInfo(url: string): MediaInfo {
  const formattedUrl = formatMediaUrl(url);

  const isVideo =
    formattedUrl.toLowerCase().match(/\.(webm|mp4|avi|mov|mkv)$/) !== null;
  const isImage =
    formattedUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/) !== null;

  return {
    url: formattedUrl,
    isVideo,
    isImage,
  };
}
