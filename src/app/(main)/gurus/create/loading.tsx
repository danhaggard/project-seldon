import { FormContent, FormGroup } from "@/components/layout/form";
import { FormCard } from "@/components/layout/form-card";

import { Skeleton } from "@/components/ui/skeleton";

export default function CreateGuruLoading() {
  return (
    <div className="container">
      <div className="max-w-2xl">
        <FormCard
          className="border-none py-0 shadow-none"
          title={<h1>Create a Guru</h1>}
          description={
            <p>
              Add a new individual to the database to begin tracking their
              predictions.
            </p>
          }
        >
          <FormContent>
            {Array.from({ length: 5 }).map((_, i) => (
              <FormGroup key={i}>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </FormGroup>
            ))}
            <div className="flex justify-end gap-4 mt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </FormContent>
        </FormCard>
      </div>
    </div>
  );
}
