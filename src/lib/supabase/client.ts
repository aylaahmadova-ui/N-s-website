import PocketBase from "pocketbase";

export function createClient() {
  return new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090");
}
