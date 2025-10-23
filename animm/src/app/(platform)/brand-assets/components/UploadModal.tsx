"use client";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudUpload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { platformStore } from '@/stores/platformStore';
import useBrandService from '@/app/services/BrandService';
import { UploadModalProps, UploadedFile } from "@/types/brandImageRequest";

export function UploadModal({ open, onOpenChange, activeTabConfig, onUploadComplete }: UploadModalProps) {

  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { addBrandImage: addBrandImage, loadImages } = useBrandService();

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
    for (const uploadedFile of uploadedFiles) {
      const data = new FormData();
      data.append('UserId', userId.toString());
      data.append('File', uploadedFile.file);
      await addBrandImage(data);
      URL.revokeObjectURL(uploadedFile.preview);
    }
    await loadImages();
    if (onUploadComplete) onUploadComplete();
    setUploadedFiles([]);
    onOpenChange(false);
  }

  return (
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
              accept="image/*"
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
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
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
  );
}