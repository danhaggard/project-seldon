import {
  FormCard,
  FormContent,
  FormGroup,
} from "@/components/layout/form-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="container">
      <FormCard
        className="border-none py-0 shadow-none"
        title="Profile Settings"
        description="Update your personal information."
      >
        <FormContent>
          {/* Email Skeleton */}
          <FormGroup>
            <Skeleton className="h-4 w-12" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </FormGroup>

          {/* Full Name Skeleton */}
          <FormGroup>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </FormGroup>

          {/* Username Skeleton */}
          <FormGroup>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </FormGroup>

          {/* Website Skeleton */}
          <FormGroup>
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-10 w-full" />
          </FormGroup>

          {/* Button Skeleton */}
          <Skeleton className="h-10 w-full mt-2" />
        </FormContent>
      </FormCard>
    </div>
  );
}
