import PocketBase from "pocketbase";

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

const baseUrl = process.env.POCKETBASE_URL ?? getArg("--url") ?? "http://127.0.0.1:8090";
const email = process.env.POCKETBASE_ADMIN_EMAIL ?? getArg("--email");
const password = process.env.POCKETBASE_ADMIN_PASSWORD ?? getArg("--password");

if (!email || !password) {
  console.error(
    "Missing admin credentials.\nUsage: node scripts/setup-pocketbase.mjs --email you@example.com --password 'your-password' [--url http://127.0.0.1:8090]",
  );
  process.exit(1);
}

const pb = new PocketBase(baseUrl);

const collections = [
  {
    name: "profiles",
    type: "base",
    fields: [
      { name: "id", type: "text", required: true },
      { name: "full_name", type: "text", required: true },
      { name: "role", type: "text", required: true },
    ],
  },
  {
    name: "organizations",
    type: "base",
    fields: [
      { name: "legal_name", type: "text", required: true },
      { name: "display_name", type: "text", required: true },
      { name: "description", type: "text", required: true },
      { name: "website", type: "url" },
      { name: "contact_email", type: "email", required: true },
      { name: "status", type: "text", required: true },
      { name: "created_by", type: "text", required: true },
    ],
  },
  {
    name: "organization_members",
    type: "base",
    fields: [
      { name: "organization_id", type: "text", required: true },
      { name: "user_id", type: "text", required: true },
      { name: "role", type: "text", required: true },
    ],
  },
  {
    name: "products",
    type: "base",
    fields: [
      { name: "organization_id", type: "text", required: true },
      { name: "title", type: "text", required: true },
      { name: "summary", type: "text", required: true },
      { name: "price", type: "number", required: true },
      { name: "image_url", type: "url" },
      { name: "status", type: "text", required: true },
    ],
  },
  {
    name: "campaigns",
    type: "base",
    fields: [
      { name: "organization_id", type: "text", required: true },
      { name: "title", type: "text", required: true },
      { name: "summary", type: "text", required: true },
      { name: "amount_needed", type: "number", required: true },
      { name: "amount_raised", type: "number", required: true },
      { name: "status", type: "text", required: true },
    ],
  },
  {
    name: "projects",
    type: "base",
    fields: [
      { name: "organization_id", type: "text", required: true },
      { name: "title", type: "text", required: true },
      { name: "summary", type: "text", required: true },
      { name: "amount_needed", type: "number", required: true },
      { name: "amount_raised", type: "number", required: true },
      { name: "status", type: "text", required: true },
    ],
  },
  {
    name: "updates",
    type: "base",
    fields: [
      { name: "organization_id", type: "text", required: true },
      { name: "title", type: "text", required: true },
      { name: "details", type: "text", required: true },
      { name: "status", type: "text", required: true },
    ],
  },
  {
    name: "child_profiles",
    type: "base",
    fields: [
      { name: "organization_id", type: "text", required: true },
      { name: "alias_name", type: "text", required: true },
      { name: "age_range", type: "text", required: true },
      { name: "talents", type: "text", required: true },
      { name: "story_summary", type: "text", required: true },
    ],
  },
  {
    name: "moderation_logs",
    type: "base",
    fields: [
      { name: "moderator_id", type: "text", required: true },
      { name: "table_name", type: "text", required: true },
      { name: "item_id", type: "text", required: true },
      { name: "status", type: "text", required: true },
    ],
  },
  {
    name: "product_images",
    type: "base",
    fields: [
      { name: "organization_id", type: "text", required: true },
      { name: "file", type: "file", required: true, maxSelect: 1 },
    ],
  },
];

async function upsertCollection(definition) {
  const existing = await pb.collections.getList(1, 200, { filter: `name="${definition.name}"` });
  if (existing.items.length > 0) {
    const current = existing.items[0];
    await pb.collections.update(current.id, definition);
    console.log(`Updated collection: ${definition.name}`);
    return;
  }

  await pb.collections.create(definition);
  console.log(`Created collection: ${definition.name}`);
}

async function main() {
  await pb.collection("_superusers").authWithPassword(email, password);
  console.log(`Authenticated to ${baseUrl}`);

  // Allow public user registration via app signup form.
  const usersCollection = await pb.collections.getOne("users");
  await pb.collections.update(usersCollection.id, {
    createRule: "",
  });
  console.log("Updated users collection createRule for public signup.");

  for (const definition of collections) {
    await upsertCollection(definition);
  }

  console.log("PocketBase collections are ready.");
}

main().catch((error) => {
  console.error("Setup failed:", error?.message ?? error);
  process.exit(1);
});
