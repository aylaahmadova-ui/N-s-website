import { requireRole } from "@/lib/auth";
import { ApplyClient } from "./apply-client";

export default async function ApplyPage() {
  await requireRole(["organization"]);
  return <ApplyClient />;
}
