import { Export } from '@/types/exports';

export interface FolderNode {
  name: string;
  children: Record<string, FolderNode>;
  exports: string[];
  isOpen?: boolean;
}

// Helper function to extract filename from URL
const getFileNameFromUrl = (url: string): string => {
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const pathParts = cleanUrl.split('/');
    const fileName = pathParts[pathParts.length - 1];

    if (!fileName || fileName === '') {
      return 'Unknown file';
    }

    const nameWithoutExtension = fileName.split('.')[0];
    return nameWithoutExtension || fileName;
  } catch {
    return 'Unknown file';
  }
};

// Parse export name into folder structure
const parseExportName = (fileName: string): string[] => {
  // Split by underscore
  const parts = fileName.split('_');

  // Remove first two parts (client and campaign) and last part (size)
  // Keep all middle parts for folder structure
  if (parts.length <= 3) {
    return [];
  }

  return parts.slice(2, -1);
};

// Build folder structure from exports
export const buildFolderStructure = (exports: Export[]): FolderNode => {
  const root: FolderNode = {
    name: 'root',
    children: {},
    exports: [],
  };

  exports.forEach(exportItem => {
    if (!exportItem.url) return;

    const fileName = getFileNameFromUrl(exportItem.url);
    const folderPath = parseExportName(fileName);

    if (folderPath.length === 0) {
      // If no folder structure, add to root exports
      root.exports.push(fileName);
      return;
    }

    // Navigate/create folder structure
    let currentNode = root;

    folderPath.forEach((folderName, index) => {
      if (!currentNode.children[folderName]) {
        currentNode.children[folderName] = {
          name: folderName,
          children: {},
          exports: [],
          isOpen: true, // Default to open
        };
      }

      currentNode = currentNode.children[folderName];

      // If this is the last folder in the path, add the export here
      if (index === folderPath.length - 1) {
        currentNode.exports.push(fileName);
      }
    });
  });

  return root;
};

// Get exports for a specific folder path
export const getExportsForPath = (
  exports: Export[],
  path: string[]
): Export[] => {
  if (path.length === 0) {
    // Root level - return all exports
    return exports;
  }

  // Filter exports that match the folder path
  return exports.filter(exportItem => {
    if (!exportItem.url) return false;
    const fileName = getFileNameFromUrl(exportItem.url);
    const folderPath = parseExportName(fileName);

    // Check if the export belongs to this folder path
    if (folderPath.length < path.length) return false;

    return path.every((segment, index) => folderPath[index] === segment);
  });
};

// Get breadcrumb path for navigation
export const getBreadcrumbPath = (
  path: string[]
): Array<{ name: string; path: string[] }> => {
  const breadcrumbs: Array<{ name: string; path: string[] }> = [
    { name: 'Root', path: [] },
  ];

  path.forEach((segment, index) => {
    breadcrumbs.push({
      name: segment,
      path: path.slice(0, index + 1),
    });
  });

  return breadcrumbs;
};
