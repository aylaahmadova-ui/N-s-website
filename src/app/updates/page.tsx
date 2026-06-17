import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUnlocked } from "@/lib/admin-access";
import { UpdatesClient } from "./updates-client";

export default async function UpdatesPage() {
  const supabase = createAdminClient();
  const adminUnlocked = await isAdminUnlocked();
  const { data: updates } = await supabase
    .from("updates")
    .select("id, title, details, created_at, organizations(display_name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <UpdatesClient updates={updates} adminUnlocked={adminUnlocked} />
  );
}
