import { SidebarContent } from "@/components/layout/sidebar";

export default function MainLayout({
  children,
  rightSidebar,
}: Readonly<{
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}>) {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px] gap-6">
      
      {/* Left Sidebar (Desktop) */}
      <aside className="hidden lg:block border-r py-6 sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto pr-6">
        <SidebarContent />
      </aside>

      {/* Main Feed Area */}
      <main className="py-6 min-w-0">{children}</main>

      {/* Right Sidebar Slot */}
      {rightSidebar}
      
    </div>
  );
}