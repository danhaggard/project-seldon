import { RightSidebarShell, SidebarCard } from "@/components/layout/right-sidebar";

export default function DefaultRightSidebar() {
  return (
    <RightSidebarShell>
      <SidebarCard title="About Seldon">
        <p>
          Quantifying the accuracy of public predictions using game theory and
          historical data.
        </p>
      </SidebarCard>
    </RightSidebarShell>
  );
}