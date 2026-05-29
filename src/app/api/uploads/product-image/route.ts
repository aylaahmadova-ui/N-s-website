import { NextResponse } from "next/server";
import { getApiContext, hasRole } from "@/lib/api";

export async function POST(request: Request) {
  const context = await getApiContext();
  if (!context.user || !hasRole(context.role, ["organization", "admin"]) || !context.organization) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be 5MB or smaller." }, { status: 400 });
  }

  try {
    const record = await context.supabase.pb.collection("product_images").create({
      organization_id: context.organization.id,
      file,
    });
    const imageUrl = context.supabase.pb.files.getURL(record, record.file);
    return NextResponse.json({ ok: true, imageUrl });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `${error.message}. Create a PocketBase collection named product_images with a file field named file.`
            : "Upload failed.",
      },
      { status: 400 },
    );
  }
}
