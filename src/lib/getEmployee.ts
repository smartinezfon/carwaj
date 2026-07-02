import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";

// Cached for 60 s per user — skips the DB roundtrip on every tab navigation.
// Revalidate by calling revalidateTag("employee") after any employee update.
export const getEmployee = unstable_cache(
  async (authUserId: string) => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("employees")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();
    return data ?? null;
  },
  ["employee-by-user-id"],
  { revalidate: 60, tags: ["employee"] }
);
