import React from "react";

export function RightSidebarShell({ children }: { children: React.ReactNode }) {
  return (
    <aside className="hidden xl:block py-6 sticky top-14 h-[calc(100dvh-3.5rem)] overflow-y-auto">
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </aside>
  );
}

export function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold mb-2 text-sm uppercase text-muted-foreground tracking-wider">
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}