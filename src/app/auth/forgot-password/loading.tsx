import { FormContent, FormGroup } from "@/components/layout/form";
import { FormCard } from "@/components/layout/form-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ForgotPasswordLoading() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <FormCard
          title={<h1>Reset Your Password</h1>}
          description={
            <p>
              Type in your email and we&apos;ll send you a link to reset your
              password
            </p>
          }
        >
          <FormContent>
            <FormGroup>
              <Skeleton className="h-4 w-12" /> {/* Label */}
              <Skeleton className="h-10 w-full" /> {/* Input */}
            </FormGroup>

            {/* Submit Button */}
            <Skeleton className="h-10 w-full mt-2" />
          </FormContent>
        </FormCard>
      </div>
    </div>
  );
}
