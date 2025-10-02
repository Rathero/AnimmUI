'use client';
import { useEffect, useRef, useState } from 'react';
import { platformStore } from '@/stores/platformStore';
import { BrandAssetsTabs } from "./components/BrandAssetsTabs";
import { BrandImageUploader } from './components/BrandImageUploader';

export default function BrandAssetsPage() {
  const { setPageTitle } = platformStore(state => state);
  const [activeTab, setActiveTab] = useState("images");
  
  useEffect(() => {
      setPageTitle('Brand Assets');
      return () => setPageTitle(undefined);
    }, [setPageTitle]);
  
  return (
    <>
      <BrandAssetsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
}
