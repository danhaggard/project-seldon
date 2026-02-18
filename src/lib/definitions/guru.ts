import { Database } from "@/lib/definitions/database.types";

// 1. Extract the shape of a 'guru' row directly from the generated types
export type Guru = Database["public"]["Tables"]["gurus"]["Row"];
