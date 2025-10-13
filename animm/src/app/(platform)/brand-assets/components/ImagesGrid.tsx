"use client"

import { useEffect, useState } from "react"
import { ImageIcon, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import useBrandService from "@/app/services/BrandService"
import { BrandImage } from "@/types/brandImageRequest"

export function ImageGrid() {
  const [images, setImages] = useState<BrandImage[]>([])
  const { getBrandImages } = useBrandService()

  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await getBrandImages()
        const imagesArray = Array.isArray(data.Result) ? data.Result : []
        setImages(imagesArray)
      } catch (err) {
        console.error("Error, images not loaded:", err)
        setImages([])
      }
    }

    loadImages()
  }, [getBrandImages])

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 p-6">
      {images.map((item) => (
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
                  <span className="sr-only">Más opciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Open</DropdownMenuItem>
                <DropdownMenuItem>Download</DropdownMenuItem>
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}
