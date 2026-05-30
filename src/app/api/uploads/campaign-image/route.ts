import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminApiAccess } from "@/lib/admin-access";

const CAMPAIGN_IMAGES_BUCKET = "campaign-images";

export async function POST(request: Request) {
  const authError = await requireAdminApiAccess();
  if (authError) return authError;
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
    const bucketExists = buckets?.some((bucket) => bucket.name === CAMPAIGN_IMAGES_BUCKET);
    if (!bucketExists) {
      const { error: createBucketError } = await admin.storage.createBucket(CAMPAIGN_IMAGES_BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
      });
      if (createBucketError) throw createBucketError;
    }

    const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "jpg";
    const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
    const objectPath = `admin/${crypto.randomUUID()}.${safeExtension}`;

    const { error: uploadError } = await admin.storage
      .from(CAMPAIGN_IMAGES_BUCKET)
      .upload(objectPath, file, { upsert: false, contentType: file.type });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = admin.storage.from(CAMPAIGN_IMAGES_BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({ ok: true, imageUrl: publicUrlData.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
