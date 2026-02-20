import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ChevronLeft, Lock, Home } from "lucide-react";
import { routes } from "@/config/routes";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
      {/* Visual Indicator */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center justify-center animate-pulse opacity-20">
          <ShieldAlert className="h-32 w-32 text-destructive" />
        </div>
        <Lock
          className="relative h-16 w-16 text-destructive"
          strokeWidth={1.5}
        />
      </div>

      {/* Text Content */}
      <h1 className="mb-2 text-4xl font-bold tracking-tight">
        403: Access Denied
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        It looks like you don&apos;t have the necessary permissions to view this
        section of the grid. If you believe this is an error, contact a System
        Administrator.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="default" asChild>
          <Link href={routes.home}>
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={routes.gurus.index}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Gurus
          </Link>
        </Button>
      </div>

      {/* Technical Metadata (Optional/Seldon Style) */}
      <div className="mt-12 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
        Error_Code: ERR_INSUFFICIENT_CLEARANCE_LEVEL
      </div>
    </div>
  );
}
