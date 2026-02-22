import { FormContent, FormGroup } from "@/components/layout/form";
import { FormCard } from "@/components/layout/form-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignUpLoading() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <FormCard
          title={<h1>Sign up</h1>}
          description={<p>Create a new account</p>}
        >
          <FormContent>
            {/* Email Field */}
            <FormGroup>
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </FormGroup>

            {/* Password Field */}
            <FormGroup>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </FormGroup>

            {/* Repeat Password Field */}
            <FormGroup>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </FormGroup>

            {/* Submit Button */}
            <Skeleton className="h-10 w-full mt-2" />
          </FormContent>
        </FormCard>
      </div>
    </div>
  );
}
