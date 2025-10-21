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
}
export interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTabConfig: Tab;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

export interface BrandImage {
  id: number
  url: string
  userId: number
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
