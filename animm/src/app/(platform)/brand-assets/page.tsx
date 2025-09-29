'use client';
import { useState } from "react";
import { BrandAssetsTabs } from "./components/BrandAssetsTabs";
import { BrandImageUploader } from './components/BrandImageUploader';

export default function BrandAssetsPage() {
  const [activeTab, setActiveTab] = useState("images");
  return (
    <>
      <BrandAssetsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BrandImageUploader buttonText="Upload"></BrandImageUploader>
    </>
  );
}
