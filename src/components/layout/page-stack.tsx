import { cn } from "@/lib/utils";
import React from "react";

interface PageStackProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export function PageStack({
  children,
  className,
  as: Component = "div",
  ...props
}: PageStackProps) {
  return (
    <Component
      className={cn("w-full flex flex-col gap-8", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
