"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudUpload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: string;
}

export function UploadModal({ open, onOpenChange, activeTab }: UploadModalProps) {
  let title = "Upload";
  if (activeTab === "images") title = "Upload Image";
  else if (activeTab === "videos") title = "Upload Video";
  else if (activeTab === "audios") title = "Upload Audio";
  else if (activeTab === "colors") title = "Upload Color";
  else if (activeTab === "settings") title = "Settings";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <CloudUpload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Drop your {activeTab} here</h3>
            <p className="text-muted-foreground mb-4">or click to browse from your computer</p>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer bg-transparent">
                Choose Files
              </Button>
            </label>
          </div>

          {/* Uploaded Files List (estructura vacía) */}
          <div className="space-y-3">
            <h4 className="font-medium">Uploading Files</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {/* Aquí iría la lista de archivos */}
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {/* Imagen preview */}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">File name</p>
                  <p className="text-xs text-muted-foreground">Size</p>
                  {/* Barra de progreso y estado */}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}