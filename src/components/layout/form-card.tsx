import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import React, { isValidElement } from "react"; // 1. Import isValidElement

// 1. The Wrapper (Enforces width and card style)
interface FormCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function FormCard({
  title,
  description,
  children,
  footer,
  className,
}: FormCardProps) {
  const isTitleComponent = isValidElement(title);
  const isDescComponent = isValidElement(description);
  return (
    <Card className={cn("w-full mx-auto", className)}>
      <CardHeader className="space-y-1">
        <CardTitle
          asChild={isTitleComponent}
          className="text-3xl font-bold tracking-tight"
        >
          {title}
        </CardTitle>
        {description && (
          <CardDescription asChild={isDescComponent}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter className="flex flex-col gap-4">{footer}</CardFooter>
      )}
    </Card>
  );
}

// 2. The Field Container (Enforces vertical rhythm)
export function FormContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-5", className)}>{children}</div>;
}

// 3. A Single Field Group (Label + Input spacing)
export function FormGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-2", className)}>{children}</div>;
}
