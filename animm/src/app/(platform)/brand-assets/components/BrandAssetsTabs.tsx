"use client";
import { useState } from "react";
import { ImageIcon, Video, Music, Palette, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./UploadModal";
import { BrandAssetsTabsProps, Tab } from "@/types/brandImageRequest";

export function BrandAssetsTabs({ activeTab, setActiveTab, onUploadComplete }: BrandAssetsTabsProps) {
  const tabs: Tab[] = [
    { id: "images", label: "Images", icon: ImageIcon, buttonText: "Upload Image", modalTitle: "Upload Image" },
    { id: "videos", label: "Videos", icon: Video, buttonText: "Upload Video", modalTitle: "Upload Video" },
    { id: "audios", label: "Audios", icon: Music, buttonText: "Upload Audio", modalTitle: "Upload Audio" },
    { id: "colors", label: "Colors", icon: Palette, buttonText: "Upload Color", modalTitle: "Upload Color" },
    { id: "settings", label: "Settings", icon: Settings, buttonText: "Settings", modalTitle: "Settings" },
  ];
  const activeTabConfig = tabs.find(tab => tab.id === activeTab) || tabs[0];
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <nav className="border-b border-border px-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex flex-row-reverse items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          {activeTabConfig.buttonText}
        </Button>
        <UploadModal open={modalOpen} onOpenChange={setModalOpen} activeTabConfig={activeTabConfig} onUploadComplete={onUploadComplete} />
      </div>
    </nav>
  );
}