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

// 4. A single Form Error message
export function FormError({
  id,
  errors,
  className,
}: {
  id: string;
  errors?: string[] | string | null;
  className?: string;
}) {
  const errorText = Array.isArray(errors) ? errors[0] : errors;

  return (
    <p
      aria-live="polite"
      id={id}
      className={cn("text-sm text-red-500", className)}
    >
      {errorText}
    </p>
  );
}

// 5. A qualitative help message for a field
export function FormFieldDescription({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <p id={id} className={cn("text-xs text-muted-foreground", className)}>
      {children}
    </p>
  );
}

// 6. A global form alert/error message
export function FormAlert({
  message,
  type = "error",
  className,
}: {
  message?: string | null;
  type?: "error" | "success";
  className?: string;
}) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "text-sm font-medium",
        type === "success" ? "text-green-600" : "text-red-500",
        className,
      )}
      role={type === "success" ? "status" : "alert"}
      aria-live={type === "success" ? "polite" : "assertive"}
    >
      {message}
    </div>
  );
}

// 7. A header for full-page forms
export function FormHeader({
  title,
  description,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-1", className)}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </header>
  );
}
