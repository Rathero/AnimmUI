"use client";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudUpload, Trash2, Music, Brush } from "lucide-react";
import { cn } from "@/lib/utils";
import { platformStore } from "@/stores/platformStore";
import useBrandService from "@/app/services/BrandService";
import { UploadModalProps, UploadedFile, UploadedColor } from "@/types/brandAssets";

export function UploadModal({ open, onOpenChange, activeTabConfig, onUploadComplete }: UploadModalProps) {

  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadedColors, setUploadedColors] = useState<UploadedColor[]>([]);
  const [colorName, setColorName] = useState<string>("");
  const [colorHex, setColorHex] = useState<string>("#ffffff");
  const { addBrandAssets: addBrandAssets, loadAssets, addBrandColors } = useBrandService();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files).map(file => ({
      id: Date.now().toString(),
      file,
      preview: URL.createObjectURL(file),
    }));
    console.log(filesArray);
    setUploadedFiles(prev => [...prev, ...filesArray]);
    if (hiddenFileInput.current) hiddenFileInput.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    const filesArray = Array.from(files).map(file => ({
      id: Date.now().toString(),
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadedFiles(prev => [...prev, ...filesArray]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleChooseFileClick = () => {
    if (hiddenFileInput.current) hiddenFileInput.current.click();
  };
  const { authenticationResponse, setAuthenticationResponse } = platformStore(
      state => state
  );

  const handleUpload = async () => {
    if (!authenticationResponse) return;
    const userId = authenticationResponse.id;

    const typeMap = {
      images: 0,
      videos: 1,
      audios: 2,
    };

    const type = typeMap[activeTabConfig.id as keyof typeof typeMap];

    if (activeTabConfig.id === "colors") {
      for (const color of uploadedColors) {
        await addBrandColors(userId, color.name, color.hex);
      }
      if (onUploadComplete) onUploadComplete();
      setUploadedColors([]);
      onOpenChange(false);
    }
    else {
      for (const uploadedFile of uploadedFiles) {
        const data = new FormData();
        data.append('UserId', userId.toString());
        data.append('File', uploadedFile.file);
        data.append('Type', type.toString());
        await addBrandAssets(data);
        URL.revokeObjectURL(uploadedFile.preview);
      }

      await loadAssets();
      if (onUploadComplete) onUploadComplete();
      setUploadedFiles([]);
      onOpenChange(false);
    }
  }

  const handleColorUpload = async () => {
    if (!colorName.trim()) return;
      const entry = { id: Date.now().toString(), name: colorName.trim(), hex: colorHex.trim() };
      setUploadedColors(prev => [...prev, entry]);
      setColorName('');
      setColorHex('#ffffff');
  };

  return (
    activeTabConfig.id === "images" ||
    activeTabConfig.id === "videos" ||
    activeTabConfig.id === "audios" ? (
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{activeTabConfig.modalTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <CloudUpload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Drop your {activeTabConfig.id} here</h3>
            <p className="text-muted-foreground mb-4">or click to browse from your computer</p>
            <input
              ref={hiddenFileInput}
              type="file"
              multiple
              accept={
                activeTabConfig.id === "images"
                  ? "image/*"
                  : activeTabConfig.id === "videos"
                  ? "video/*"
                  : activeTabConfig.id === "audios"
                  ? "audio/*"
                  : "*/*"
              }
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              className="cursor-pointer bg-transparent"
              onClick={handleChooseFileClick}
            >
              Choose Files
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Uploading Files</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                        {activeTabConfig.id === "images" && (
                          <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
                        )}
                        {activeTabConfig.id === "videos" && (
                          <video src={file.preview} className="w-full h-full object-cover" muted />
                        )}
                        {activeTabConfig.id === "audios" && (
                          <Music className="w-small h-small object-cover"/>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={uploadedFiles.length === 0}
              onClick={handleUpload}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    ) : activeTabConfig.id === "colors" ? (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{activeTabConfig.modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="col-span-1">
                <label className="block text-sm text-muted-foreground mb-1">Preview</label>
                <div className="w-20 h-12 rounded border overflow-hidden" style={{ backgroundColor: colorHex }} />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm text-muted-foreground mb-1">Color</label>
                <div className="relative">
                  <input
                    ref={colorPickerRef}
                    type="color"
                    value={colorHex}
                    onChange={e => setColorHex(e.target.value)}
                    className="absolute inset-0 w-full h-10 opacity-0 cursor-pointer"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 flex items-center justify-center gap-2 pointer-events-none"
                  >
                    <Brush className="w-4 h-4" />
                    Pick Color
                  </Button>
                </div>
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm text-muted-foreground mb-1">Hex</label>
                <input
                  type="text"
                  value={colorHex}
                  onChange={e => setColorHex(e.target.value)}
                  className="w-full input px-2 py-2 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Name</label>
              <input
                type="text"
                value={colorName}
                onChange={e => setColorName(e.target.value)}
                placeholder="e.g. Primary Blue"                  
                className="w-full input px-2 py-2 border rounded"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  handleColorUpload();
                }}
              >
                Add Color
              </Button>
              <Button variant="ghost" onClick={() => { setColorName(''); setColorHex('#ffffff'); }}>
                Reset
              </Button>
            </div>
            {uploadedColors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Colors to upload</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uploadedColors.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-8 rounded overflow-hidden bg-muted flex-shrink-0" style={{ backgroundColor: c.hex }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.hex}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedColors(prev => prev.filter(x => x.id !== c.id))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button disabled={uploadedColors.length === 0} onClick={handleUpload}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    ) : null
)}