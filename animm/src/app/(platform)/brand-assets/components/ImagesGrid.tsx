"use client"

import { useEffect, useState } from "react"
import { ImageIcon, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import useBrandService from "@/app/services/BrandService"
import { BrandImage } from "@/types/brandImageRequest"
import AnimmModal from "@/components/AnimmModal"

export function ImageGrid({ reloadKey = 0 }: { reloadKey?: number }) {
  const [images, setImages] = useState<BrandImage[]>([])
  const { loadImages, deleteBrandImage } = useBrandService()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    loadImages().then(setImages)
  }, [reloadKey])

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

  const handleDelete = (imageId: number) => {
    setSelectedId(imageId)
    setModalOpen(true)
  }

  const selectedImage = selectedId != null
    ? images.find((img) => img.id === selectedId) ?? null
    : null

  const confirmDelete = async () => {
    if (selectedId === null) return
    try {
      await deleteBrandImage(selectedId)
      const imagesUpdated = await loadImages()
      setImages(imagesUpdated)
    } catch (err) {
      alert("Error deleting image")
      console.error(err)
    } finally {
      setModalOpen(false)
      setSelectedId(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 p-6">
        {images.length > 0 ? (
          images.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-muted-foreground/30 transition-all duration-200"
            >
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <Image
                  src={item.url || "/placeholder.svg"}
                  alt={getCleanFileName(item.url)}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-background/50">
                <div className="flex items-center gap-2 min-w-0">
                  <ImageIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getCleanFileName(item.url)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">Image</p>
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
          <p className="text-muted-foreground">No images yet</p>
        )}
      </div>

      <AnimmModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete image?"
        description={`This will permanently delete the image "${selectedImage ? getCleanFileName(selectedImage.url) : ""}".`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </>
  )
}