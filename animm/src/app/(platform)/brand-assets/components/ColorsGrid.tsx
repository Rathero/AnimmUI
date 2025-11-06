"use client"

import { useEffect, useState } from "react"
import { Palette, MoreVertical, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AnimmModal from "@/components/AnimmModal"
import { Color } from "@/types/brandAssets"
import useBrandService from "@/app/services/BrandService"

export function ColorsGrid({ reloadKey = 0 }: { reloadKey?: number }) {
  const [colors, setColors] = useState<Color[]>([])
  const { loadColors, deleteBrandColor } = useBrandService()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    fetchColors()
  }, [reloadKey]);

  const fetchColors = async () => {
    const data = await loadColors()
    setColors(data)
    return data
  }

  const selectedColor = selectedId != null
    ? colors.find((item) => item.id === selectedId) ?? null
    : null

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = (colorId: number) => {
    setSelectedId(colorId)
    setModalOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedId === null) return
    try {
      await deleteBrandColor(selectedId)
      const colorsUpdated = await fetchColors()
      setColors(colorsUpdated);
    }
    catch (err) {
      alert("Error deleting color")
      console.error(err)
    } finally {
      setModalOpen(false)
      setSelectedId(null)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 p-6">
        {colors.length > 0 ? (
          colors.map((color) => (
            <div
              key={color.id}
              className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-muted-foreground/30 transition-all duration-200"
            >
              <div 
                className="relative aspect-[4/3] overflow-hidden transition-transform duration-300"
                style={{ backgroundColor: color.hex }}
              >
              </div>
              <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-background/50">
                <div className="flex items-center gap-2 min-w-0">
                  <Palette className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {color.name}
                    </p>
                    <button
                      onClick={() => copyToClipboard(color.hex, color.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="font-mono">{color.hex}</span>
                      {copiedId === color.id ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
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
                    <DropdownMenuItem onClick={() => copyToClipboard(color.hex, color.id)}>
                      Copy HEX
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(color.id)}
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
            No colors yet
          </p>
        )}
      </div>
      <AnimmModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Color?"
        description={`This will permanently delete the color "${selectedColor?.name}".`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </>
  )
}

