import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getApiContext } from "@/lib/api";
import { requireAdminApiAccess } from "@/lib/admin-access";

const UPDATE_IMAGES_BUCKET = "update-images";

export async function POST(request: Request) {
  const adminAuthError = await requireAdminApiAccess();
  const context = await getApiContext();
  const isAdminUnlocked = !adminAuthError;

  if (!isAdminUnlocked && !context.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createAdminClient();
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
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === UPDATE_IMAGES_BUCKET);
    if (!bucketExists) {
      const { error: createBucketError } = await admin.storage.createBucket(UPDATE_IMAGES_BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
      });
      if (createBucketError) throw createBucketError;
    }

    const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "jpg";
    const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
    const ownerSegment = context.organization?.id ?? context.user?.id ?? "admin";
    const objectPath = `${ownerSegment}/${crypto.randomUUID()}.${safeExtension}`;

    const { error: uploadError } = await admin.storage
      .from(UPDATE_IMAGES_BUCKET)
      .upload(objectPath, file, { upsert: false, contentType: file.type });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = admin.storage.from(UPDATE_IMAGES_BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({ ok: true, imageUrl: publicUrlData.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
