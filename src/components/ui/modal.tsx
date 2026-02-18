"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function Modal({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // If the dialog closes, navigate back to the previous context (e.g., Guru page)
      router.back();
    }
  };

  return (
    <Dialog defaultOpen onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-162.5 p-0 overflow-hidden">
        {/* Screen reader requirements */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
