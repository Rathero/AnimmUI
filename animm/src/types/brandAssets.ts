export interface BrandImageRequest {
  UserId: number;
  File: FormData;
}

export interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonText: string;
  modalTitle: string;
}

export interface BrandAssetsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUploadComplete?: () => void;
}
export interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTabConfig: Tab;
  onUploadComplete?: () => void;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

export interface BrandAsset {
  id: number
  url: string
  userId: number
  type: number
}

export interface AnimmModalProps {
  open: boolean
  onConfirm: () => Promise<void> | void
  onCancel: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: "default" | "destructive" | "outline"
  loading?: boolean
}

export interface Color {
  id: number
  name: string
  hex: string
}

export interface UploadedColor {
  id: string
  name: string 
  hex: string 
}