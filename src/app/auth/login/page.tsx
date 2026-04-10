import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card title="Welcome back" description="Sign in to manage your organization, approvals, and impact updates.">
        <LoginForm />
        <p className="mt-4 text-sm text-slate-600">
          Need an account? <Link href="/auth/signup" className="text-amber-700">Create one</Link>
        </p>
      </Card>
    </div>
  );
}
