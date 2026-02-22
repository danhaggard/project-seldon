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
      {/* 1. Left Sidebar Column (Owned by Layout) */}
      <aside className="hidden lg:block border-r py-6 sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto pr-6">
        <SidebarContent />
      </aside>

      {/* 2. Main Feed Column (Owned by Layout) */}
      <main className="py-6 min-w-0">{children}</main>

      {/* 3. Right Sidebar Column (Owned by Layout) */}
      {/* We only render the wrapper if the slot has content */}
      {rightSidebar && (
        <aside className="hidden xl:block py-6 sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto">
          {rightSidebar}
        </aside>
      )}
    </div>
  );
}
