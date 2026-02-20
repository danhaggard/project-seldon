"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { StaticAppRoute } from "@/config/routes";

export function GuruToastListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() as StaticAppRoute;

  useEffect(() => {
    // Check if the specific param exists
    if (searchParams.get("status") === "updated") {
      // 1. Fire the Toast
      toast.success("Guru details have been updated.", {
        id: "guru-update-success", // Sonner will deduplicate based on this ID
        position: "top-center",
      });

      // 2. Clean up the URL (remove the ?status=updated param)
      // We create a new URLSearchParams object to preserve other params if they exist
      const params = new URLSearchParams(searchParams.toString());
      params.delete("status");

      // Replace the current URL without reloading the page
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  // This component doesn't render anything visible
  return null;
}
