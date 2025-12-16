"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { AnimmModalProps } from "@/types/brandAssets"

export default function AnimmModal({
  open,
  onConfirm,
  onCancel,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  loading = false,
}: AnimmModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? `${confirmText}...` : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
