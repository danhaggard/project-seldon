import { createClient } from "@/lib/supabase/server";
import { EditGuruForm } from "./_components/edit-guru-form";
import { notFound, redirect } from "next/navigation";
import { getIsAdminModCreator } from "@/lib/supabase/auth-helpers";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditGuruPage({ params }: PageProps) {
  const supabase = await createClient();
  const { slug } = await params;

  // 1. Fetch the Guru
  const { data: guru } = await supabase
    .from("gurus")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!guru) return notFound();

  // 2. Fetch User & Roles for Authorization
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login"); // Should be caught by middleware, but double safety
  }

  const canEdit = getIsAdminModCreator(guru.created_by);
  if (!canEdit) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>You do not have permission to edit this Guru.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <EditGuruForm guru={guru} />
    </div>
  );
}
