import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import useBrandService from '@/app/services/BrandService';
import { BrandAsset } from '@/types/brandAssets';

interface BrandAssetsModalProps {
  TypeAsset: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (url: string) => void;
}

export default function BrandAssetsModal({
    TypeAsset,
    open,
    onOpenChange,
    onSelectImage,
    }: BrandAssetsModalProps) {
    const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { loadAssets } = useBrandService();

    useEffect(() => {
        if (open) {
        fetchBrandAssets();
        }
    }, [open]);

    const fetchBrandAssets = async () => {
        setIsLoading(true);
        try {
        const data = await loadAssets();
        const imageAssets = data.filter((item: BrandAsset) => item.type === 0);
        setBrandAssets(imageAssets);
        } catch (error) {
        console.error('Error loading brand assets:', error);
        } finally {
        setIsLoading(false);
        }
    };

    const handleImageClick = (url: string) => {
        onSelectImage(url);
        onOpenChange(false);
    };

    const getCleanFileName = (url: string) => {
        if (!url) return ""
        const parts = url.split("/")
        const fileName = parts[parts.length - 1]

        const lastDotIndex = fileName.lastIndexOf(".")
        if (lastDotIndex === -1) return fileName

        const name = fileName.substring(0, lastDotIndex)
        const ext = fileName.substring(lastDotIndex)
        const cleanName = name.split("_")[0]

        return cleanName + ext
    }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Brand {TypeAsset}</DialogTitle>
        </DialogHeader>
        <div className="py-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading {TypeAsset}s...
            </div>
          ) : brandAssets.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {brandAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-muted-foreground/30 transition-all duration-200"
                  onClick={() => handleImageClick(asset.url)}
                >
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    <Image
                      src={asset.url}
                      alt={getCleanFileName(asset.url)}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-2 py-1.5 border-t border-border bg-background/50">
                    <p className="text-xs font-medium text-foreground truncate">
                      {getCleanFileName(asset.url)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No brand {TypeAsset}s available.</p>
              <p className="text-sm mt-1">Upload {TypeAsset}s in Brand Assets section.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
);
}
