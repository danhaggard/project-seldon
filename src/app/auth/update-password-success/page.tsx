import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { routes } from "@/config/routes";

export default function Page() {
  return (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Success!</CardTitle>
              <CardDescription>
                You have successfully updated your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 text-center text-sm">
                Click to return{" "}
                <Link href={routes.home} className="underline underline-offset-4">
                  home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
  );
}
