'use client';
import { useEffect, useState } from 'react';
import { platformStore } from '@/stores/platformStore';
import { BrandAssetsTabs } from "./components/BrandAssetsTabs";
import { ImageGrid } from "./components/ImagesGrid";

export default function BrandAssetsPage() {
  const { setPageTitle } = platformStore(state => state);
  const [activeTab, setActiveTab] = useState("images");
  
  useEffect(() => {
    setPageTitle('Brand Assets');
    return () => setPageTitle(undefined);
  }, [setPageTitle]);
  
  return (
    <div className="flex flex-col">
      <BrandAssetsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="p-6">
        {activeTab === "images" && <ImageGrid />}
        {activeTab === "videos" && <p className="text-muted-foreground">No videos yet</p>}
        {activeTab === "audios" && <p className="text-muted-foreground">No audios yet</p>}
        {activeTab === "colors" && <p className="text-muted-foreground">No colors yet</p>}
        {activeTab === "settings" && <p className="text-muted-foreground">Settings</p>}
      </div>
    </div>
  );
}

