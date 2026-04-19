import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getApiContext, hasRole } from "@/lib/api";

const PRODUCT_IMAGES_BUCKET = "product-images";

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

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: "Upload service is not configured." }, { status: 500 });
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey);

  const { data: buckets } = await adminClient.storage.listBuckets();
  const bucketExists = buckets?.some((bucket) => bucket.name === PRODUCT_IMAGES_BUCKET);

  if (!bucketExists) {
    const { error: createBucketError } = await adminClient.storage.createBucket(PRODUCT_IMAGES_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    });

    if (createBucketError) {
      return NextResponse.json({ error: createBucketError.message }, { status: 400 });
    }
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "jpg";
  const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? extension : "jpg";
  const objectPath = `${context.organization.id}/${crypto.randomUUID()}.${safeExtension}`;

  const { error: uploadError } = await adminClient.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(objectPath, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: publicUrlData } = adminClient.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(objectPath);

  return NextResponse.json({ ok: true, imageUrl: publicUrlData.publicUrl });
}

