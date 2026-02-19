import { createClient } from "@/lib/supabase/server";
import { Category } from "../definitions/category";

export async function getCategories(): Promise<Category[] | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Database Error (getCategories):", error);
      return null;
    }

    return data as Category[];
  } catch (error) {
    console.error("Unexpected Error (getCategories):", error);
    throw new Error("Failed to fetch categories.");
  }
}
