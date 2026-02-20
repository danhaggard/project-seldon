import {
  RightSidebarShell,
  SidebarCard,
} from "@/components/layout/right-sidebar";
import { SmartLink } from "@/components/ui/smart-link";
import { APP_PERMISSION } from "@/lib/definitions/rbac";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { routes } from "@/config/routes";

// This automatically receives the same URL params as your main page!
export default async function GuruRightSidebar({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // You can fetch specific data here, entirely parallel to the main page fetch!

  return (
    <RightSidebarShell>
      <SidebarCard title="Guru Stats">
        <p>Viewing stats for {slug}.</p>
        <ul className="mt-4 list-disc pl-4">
          <li>Accuracy: 84%</li>
          <li>Total Predictions: 42</li>
        </ul>
      </SidebarCard>

      <SidebarCard title="Guru Actions">
        {/* Add Prediction Button */}
        <div className="pb-1">
          <SmartLink
            href={routes.gurus.addPrediction(slug)}
            requiredPermission={APP_PERMISSION.PREDICTIONS_CREATE}
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Prediction
          </SmartLink>
        </div>
      </SidebarCard>
    </RightSidebarShell>
  );
}
