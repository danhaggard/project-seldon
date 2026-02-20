import {
  FormCard,
  FormContent,
  FormGroup,
} from "@/components/layout/form-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreatePredictionLoading() {
  return (
    <div className="container">
      <div className="max-w-2xl">
        <FormCard
          className="border-none py-0 shadow-none"
          title={<h1>Log a Prediction</h1>}
          description={<p>Add a new claim to the database to begin tracking it.</p>}
        >
          <FormContent>
            <FormGroup>
               <Skeleton className="h-4 w-32" />
               <Skeleton className="h-10 w-full" />
            </FormGroup>
            <FormGroup>
               <Skeleton className="h-4 w-20" />
               <Skeleton className="h-10 w-full" />
            </FormGroup>
            <div className="grid grid-cols-2 gap-4">
               <FormGroup>
                 <Skeleton className="h-4 w-24" />
                 <Skeleton className="h-10 w-full" />
               </FormGroup>
               <FormGroup>
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-10 w-full" />
               </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FormGroup>
                 <Skeleton className="h-4 w-16" />
                 <Skeleton className="h-10 w-full" />
               </FormGroup>
               <FormGroup>
                 <Skeleton className="h-4 w-40" />
                 <Skeleton className="h-10 w-full" />
               </FormGroup>
            </div>
            <FormGroup>
               <Skeleton className="h-4 w-48" />
               <Skeleton className="h-24 w-full" />
            </FormGroup>
            <div className="flex justify-end gap-4 mt-6">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-40" />
            </div>
          </FormContent>
        </FormCard>
      </div>
    </div>
  );
}
