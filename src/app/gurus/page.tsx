import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SmartLink } from "@/components/ui/smart-link";
import { APP_PERMISSION } from "@/lib/definitions/rbac";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic"; // Ensure we get fresh data

export default async function GurusListPage() {
  const supabase = await createClient();

  // Fetch all gurus, ordered by credibility (Highest first)
  const { data: gurus } = await supabase
    .from("gurus")
    .select("*")
    .order("credibility_score", { ascending: false });

  if (!gurus || gurus.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Gurus</h1>
        <p className="mb-4">
          No gurus found. Run the seed script or add one manually!
        </p>
        <SmartLink
          href="/gurus/create"
          requiredPermission={APP_PERMISSION.GURUS_CREATE}
          className={buttonVariants({ variant: "default" })}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Guru
        </SmartLink>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gurus</h1>
          <p className="text-muted-foreground mt-2">
            Track the accuracy of the world&apos;s most vocal experts.
          </p>
        </div>

        {/* Add Guru Button protected by RBAC */}
        <SmartLink
          href="/gurus/create"
          requiredPermission={APP_PERMISSION.GURUS_CREATE}
          className={buttonVariants({ variant: "default" })}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Guru
        </SmartLink>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gurus.map((guru) => (
          <Link
            key={guru.id}
            href={`/gurus/${guru.slug}`}
            className="block group"
          >
            <Card className="h-full hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12 border bg-muted">
                  <AvatarImage
                    src={guru.avatar_url || ""}
                    alt={guru.name}
                    className="object-cover"
                  />
                  <AvatarFallback>{guru.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {guru.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">
                    Score:{" "}
                    <span
                      className={
                        (guru.credibility_score ?? 0) >= 60
                          ? "text-green-600"
                          : (guru.credibility_score ?? 0) >= 40
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {guru.credibility_score ?? "N/A"}
                    </span>
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {guru.bio || "No biography available."}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
