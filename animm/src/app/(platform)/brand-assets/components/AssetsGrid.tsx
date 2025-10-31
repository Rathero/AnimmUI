"use client"

import { useEffect, useState } from "react"
import { ImageIcon, Video, Music, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import useBrandService from "@/app/services/BrandService"
import { BrandAsset } from "@/types/brandAssets"
import AnimmModal from "@/components/AnimmModal"

export function AssetsGrid({activeTab, reloadKey = 0 }: {activeTab: string; reloadKey?: number }) {
  const [assets, setAssets] = useState<BrandAsset[]>([])
  const { loadAssets, deleteBrandAsset } = useBrandService()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    loadAssets().then((data) => {
      const typeMap: Record<string, number> = {
        images: 0,
        videos: 1,
        audios: 2,
      };

      const filtered = data.filter((item: BrandAsset) => item.type === typeMap[activeTab]);
      setAssets(filtered);
    });
  }, [reloadKey, activeTab]);

  const FileType = activeTab.slice(0, -1)

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

  const handleDelete = (assetId: number) => {
    setSelectedId(assetId)
    setModalOpen(true)
  }

  const selectedAsset = selectedId != null
    ? assets.find((item) => item.id === selectedId) ?? null
    : null

  const confirmDelete = async () => {
    if (selectedId === null) return
    try {
      await deleteBrandAsset(selectedId)
      const assetsUpdated = await loadAssets().then((data) => {
      const typeMap: Record<string, number> = {
        images: 0,
        videos: 1,
        audios: 2,
      };

      const assetsUpdated = data.filter((item: BrandAsset) => item.type === typeMap[activeTab]);
      setAssets(assetsUpdated);
    });
    } catch (err) {
      alert("Error deleting asset")
      console.error(err)
    } finally {
      setModalOpen(false)
      setSelectedId(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 p-6">
        {assets.length > 0 ? (
          assets.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-muted-foreground/30 transition-all duration-200"
            >
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {activeTab === "images" && (
                  <Image
                    src={item.url || "/placeholder.svg"}
                    alt={getCleanFileName(item.url)}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                {activeTab === "videos" && (
                  <video
                    src={item.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
                {activeTab === "audios" && (
                  <audio
                    controls
                    src={item.url}
                    className="w-full p-2"
                  />
                )}
              </div>

              <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-background/50">
                <div className="flex items-center gap-2 min-w-0">
                  {activeTab === "images" && (
                    <ImageIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  {activeTab === "videos" && (
                    <Video className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  {activeTab === "audios" && (
                    <Music className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getCleanFileName(item.url)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate capitalize">
                      {FileType}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a href={item.url} target="_blank">
                        Open
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">
            No {activeTab} yet
          </p>
        )}
      </div>

      <AnimmModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete ${FileType}?`}
        description={`This will permanently delete the ${FileType} "${selectedAsset ? getCleanFileName(selectedAsset.url) : ""}".`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </>
  )
}