import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getAdminSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  if (data.user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }

  return data.user;
}
