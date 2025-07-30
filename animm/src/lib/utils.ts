import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper function to extract filename from URL
export const getFileNameFromUrl = (url: string): string => {
  try {
    // Remove query parameters and hash
    let cleanUrl = url.split('?')[0].split('#')[0];

    // URL decode the path to handle encoded characters like %5C (/)
    cleanUrl = decodeURIComponent(cleanUrl);

    // Get the last part of the path
    const pathParts = cleanUrl.split('/');
    const fileName = pathParts[pathParts.length - 1];

    // If no filename found, return a default
    if (!fileName || fileName === '') {
      return 'Unknown file';
    }

    // Remove file extension for cleaner display
    const nameWithoutExtension = fileName.split('.')[0];
    return nameWithoutExtension || fileName;
  } catch {
    return 'Unknown file';
  }
};
