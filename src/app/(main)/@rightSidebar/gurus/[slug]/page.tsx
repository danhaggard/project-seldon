import { RightSidebarShell, SidebarCard } from "@/components/layout/right-sidebar";

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
      
      <SidebarCard title="Similar Gurus">
        { slug }
      </SidebarCard>
    </RightSidebarShell>
  );
}