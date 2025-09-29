"use client";
import { useState } from "react";
import { ImageIcon, Video, Music, Palette, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./UploadModal";

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface BrandAssetsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BrandAssetsTabs({ activeTab, setActiveTab }: BrandAssetsTabsProps) {
  const tabs: Tab[] = [
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "videos", label: "Videos", icon: Video },
    { id: "audios", label: "Audios", icon: Music },
    { id: "colors", label: "Colors", icon: Palette },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  let buttonText = "Upload";
  if (activeTab === "images") buttonText = "Upload Image";
  else if (activeTab === "videos") buttonText = "Upload Video";
  else if (activeTab === "audios") buttonText = "Upload Audio";
  else if (activeTab === "colors") buttonText = "Upload Color";
  else if (activeTab === "settings") buttonText = "Settings";
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
          {buttonText}
        </Button>
        <UploadModal open={modalOpen} onOpenChange={setModalOpen} activeTab={activeTab} />
      </div>
    </nav>
  );
}