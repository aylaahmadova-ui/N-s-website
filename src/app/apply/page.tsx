import { requireRole } from "@/lib/auth";
import { OrganizationApplicationForm } from "@/components/forms/organization-application-form";
import { Card } from "@/components/ui/card";

export default async function ApplyPage() {
  await requireRole(["organization"]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card
        title="Organization verification"
        description="Complete this application to be reviewed by Kindora admins before you publish any public content."
      >
        <OrganizationApplicationForm />
      </Card>
    </div>
  );
}
