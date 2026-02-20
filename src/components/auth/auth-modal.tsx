"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function AuthModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none w-full max-w-sm sm:max-w-md my-auto">
        <VisuallyHidden>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Log in or sign up to your account.
          </DialogDescription>
        </VisuallyHidden>
        {children}
      </DialogContent>
    </Dialog>
  );
}
