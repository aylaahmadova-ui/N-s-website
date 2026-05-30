import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DONATION_RECEIPTS_BUCKET = "donation-receipts";

export async function POST(request: Request) {
  const admin = createAdminClient();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Allowed file types: PNG, JPG, WEBP, GIF, PDF." }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Receipt must be 10MB or smaller." }, { status: 400 });
  }

  try {
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === DONATION_RECEIPTS_BUCKET);
    if (!bucketExists) {
      const { error: createBucketError } = await admin.storage.createBucket(DONATION_RECEIPTS_BUCKET, {
        public: false,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: allowedTypes,
      });
      if (createBucketError) throw createBucketError;
    }

    const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "bin";
    const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? extension : "bin";
    const objectPath = `receipts/${crypto.randomUUID()}.${safeExtension}`;

    const { error: uploadError } = await admin.storage
      .from(DONATION_RECEIPTS_BUCKET)
      .upload(objectPath, file, { upsert: false, contentType: file.type });

    if (uploadError) throw uploadError;

    return NextResponse.json({ ok: true, receiptPath: objectPath });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
