'use client';
import { useEffect, useState } from 'react';
import { platformStore } from '@/stores/platformStore';
import { BrandAssetsTabs } from "./components/BrandAssetsTabs";
import { AssetsGrid } from "./components/AssetsGrid";

export default function BrandAssetsPage() {
  const { setPageTitle } = platformStore(state => state);
  const [activeTab, setActiveTab] = useState("images");
  const [reloadKey, setReloadKey] = useState(0);
  
  useEffect(() => {
    setPageTitle('Brand Assets');
    return () => setPageTitle(undefined);
  }, [setPageTitle]);
  
  const handleUploadComplete = () => setReloadKey(k => k + 1);

  return (
    <div className="flex flex-col">
      <BrandAssetsTabs activeTab={activeTab} setActiveTab={setActiveTab} onUploadComplete={handleUploadComplete} />
      
      <div className="p-6">
        {["images", "videos", "audios"].includes(activeTab) && (
          <AssetsGrid activeTab={activeTab} reloadKey={reloadKey} />
        )}
        {activeTab === "colors" && <p className="text-muted-foreground">No colors yet</p>}
        {activeTab === "settings" && <p className="text-muted-foreground">Settings</p>}
      </div>
    </div>
  );
}

