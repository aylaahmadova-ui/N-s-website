import Link from "next/link";
import { SignupForm } from "@/components/forms/signup-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Card
        title="Create a Kindora account"
        description="Supporters can donate and purchase. Organizations can apply, then publish once approved."
      >
        <SignupForm />
        <p className="mt-4 text-sm text-slate-600">
          Already registered? <Link href="/auth/login" className="text-amber-700">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
