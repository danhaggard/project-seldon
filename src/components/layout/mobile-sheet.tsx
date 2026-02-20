"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function MobileSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Site Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      {/* Event Delegation: 
        Any click inside this content area bubbles up. 
        If the click originated from a link (<a>), close the sheet.
      */}
      <SheetContent 
        side="left" 
        className="w-64 p-0"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) {
            setOpen(false);
          }
        }}
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}