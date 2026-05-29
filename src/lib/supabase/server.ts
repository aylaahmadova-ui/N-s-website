/* eslint-disable @typescript-eslint/no-explicit-any */
import PocketBase from "pocketbase";
import { cookies } from "next/headers";

const PB_AUTH_COOKIE = "pb_auth";
const FALLBACK_PB_URL = "http://127.0.0.1:8090";

type QueryState = {
  table: string;
  select: string;
  countExactHead: boolean;
  filters: Array<{ field: string; value: string | number | boolean }>;
  orLikeTerms: Array<{ field: string; term: string }>;
  orderBy?: { field: string; ascending: boolean };
  limitCount?: number;
  action?: "insert" | "upsert" | "update" | "delete";
  payload?: Record<string, unknown> | Array<Record<string, unknown>>;
  wantSingle?: boolean;
  wantMaybeSingle?: boolean;
};

function pickFields(record: Record<string, unknown>, select: string) {
  if (!select || select.trim() === "*") return record;
  const fields = select
    .split(",")
    .map((f: any) => f.trim())
    .filter((f) => f && !f.includes("("));
  const next: Record<string, unknown> = {};
  for (const key of fields) next[key] = record[key];
  return next;
}

function escapeFilterValue(value: string | number | boolean) {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return `"${String(value).replaceAll('"', '\\"')}"`;
}

function buildFilter(filters: QueryState["filters"]) {
  if (!filters.length) return "";
  return filters.map((f: any) => `${f.field}=${escapeFilterValue(f.value)}`).join(" && ");
}

async function attachOrganizationExpand(pb: PocketBase, rows: Record<string, unknown>[], select: string) {
  if (!select.includes("organizations(")) return rows;
  const match = select.match(/organizations\(([^)]+)\)/);
  const orgFields = match?.[1] ?? "*";
  const orgIds = Array.from(
    new Set(rows.map((r: any) => r.organization_id).filter((id): id is string => typeof id === "string" && id.length > 0)),
  );
  const orgMap = new Map<string, Record<string, unknown>>();

  for (const orgId of orgIds) {
    try {
      const org = await pb.collection("organizations").getOne(orgId);
      orgMap.set(orgId, pickFields(org as unknown as Record<string, unknown>, orgFields));
    } catch {
      orgMap.set(orgId, {});
    }
  }

  return rows.map((row: any) => ({
    ...row,
    organizations: typeof row.organization_id === "string" ? orgMap.get(row.organization_id) ?? null : null,
  }));
}

class QueryBuilder implements PromiseLike<{ data: any; error: { message: string } | null; count?: number | null }> {
  constructor(
    private pb: PocketBase,
    private state: QueryState,
  ) {}

  select(columns: string, opts?: { count?: string; head?: boolean }) {
    this.state.select = columns;
    this.state.countExactHead = opts?.count === "exact" && opts?.head === true;
    return this;
  }

  eq(field: string, value: string | number | boolean) {
    this.state.filters.push({ field, value });
    return this;
  }

  or(raw: string) {
    const terms = raw.split(",").map((part) => part.trim());
    for (const term of terms) {
      const match = term.match(/^([a-zA-Z0-9_]+)\.ilike\.%(.*)%$/);
      if (match) {
        this.state.orLikeTerms.push({ field: match[1], term: match[2].toLowerCase() });
      }
    }
    return this;
  }

  order(field: string, opts?: { ascending?: boolean }) {
    this.state.orderBy = { field, ascending: opts?.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.state.limitCount = count;
    return this;
  }

  insert(payload: Record<string, unknown> | Array<Record<string, unknown>>) {
    this.state.action = "insert";
    this.state.payload = payload;
    return this;
  }

  upsert(payload: Record<string, unknown> | Array<Record<string, unknown>>) {
    this.state.action = "upsert";
    this.state.payload = payload;
    return this;
  }

  update(payload: Record<string, unknown>) {
    this.state.action = "update";
    this.state.payload = payload;
    return this;
  }

  delete() {
    this.state.action = "delete";
    return this;
  }

  single() {
    this.state.wantSingle = true;
    return this;
  }

  maybeSingle() {
    this.state.wantMaybeSingle = true;
    return this;
  }

  async execute() {
    try {
      const table = this.state.table;
      const filter = buildFilter(this.state.filters);
      const sort = this.state.orderBy ? `${this.state.orderBy.ascending ? "" : "-"}${this.state.orderBy.field}` : undefined;

      if (this.state.action === "insert" || this.state.action === "upsert") {
        const payload = Array.isArray(this.state.payload) ? this.state.payload[0] : this.state.payload;
        if (!payload) return { data: null, error: { message: "Missing payload." } };
        const id = typeof payload.id === "string" ? payload.id : undefined;
        const result =
          this.state.action === "upsert" && id
            ? await this.pb.collection(table).update(id, payload)
            : await this.pb.collection(table).create(payload);
        return { data: this.state.wantSingle ? result : [result], error: null };
      }

      if (this.state.action === "update") {
        const rows = await this.pb.collection(table).getFullList({ filter });
        for (const row of rows) {
          await this.pb.collection(table).update((row as { id: string }).id, this.state.payload ?? {});
        }
        return { data: null, error: null };
      }

      if (this.state.action === "delete") {
        const rows = await this.pb.collection(table).getFullList({ filter });
        for (const row of rows) {
          await this.pb.collection(table).delete((row as { id: string }).id);
        }
        return { data: null, error: null };
      }

      const rowsRaw = await this.pb.collection(table).getFullList({
        filter: filter || undefined,
        sort,
      });
      let rows = rowsRaw as unknown as Record<string, unknown>[];
      if (this.state.orLikeTerms.length) {
        rows = rows.filter((row) =>
          this.state.orLikeTerms.some((term) => {
            const value = row[term.field];
            return typeof value === "string" && value.toLowerCase().includes(term.term);
          }),
        );
      }
      rows = await attachOrganizationExpand(this.pb, rows, this.state.select);
      rows = rows.map((r: any) => pickFields(r, this.state.select));

      if (this.state.limitCount) rows = rows.slice(0, this.state.limitCount);
      if (this.state.countExactHead) return { data: null, count: rows.length, error: null };
      if (this.state.wantSingle) return { data: rows[0] ?? null, error: rows[0] ? null : { message: "Not found" } };
      if (this.state.wantMaybeSingle) return { data: rows[0] ?? null, error: null };
      return { data: rows, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database query failed.";
      return { data: null, error: { message } };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: { message: string } | null; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export async function createClient() {
  const cookieStore = await cookies();
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL ?? FALLBACK_PB_URL);
  pb.authStore.loadFromCookie(`${PB_AUTH_COOKIE}=${cookieStore.get(PB_AUTH_COOKIE)?.value ?? ""}`, PB_AUTH_COOKIE);

  const persistCookie = () => {
    try {
      const raw = pb.authStore.exportToCookie({ httpOnly: true }, PB_AUTH_COOKIE);
      const match = raw.match(new RegExp(`${PB_AUTH_COOKIE}=([^;]*)`));
      const value = match?.[1] ?? "";
      cookieStore.set(PB_AUTH_COOKIE, value, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    } catch {
      // Server components can't mutate cookies.
    }
  };

  return {
    pb,
    auth: {
      async getUser() {
        try {
          if (pb.authStore.isValid) {
            await pb.collection("users").authRefresh();
            persistCookie();
            const user = pb.authStore.record;
            return { data: { user: user ? { ...user, email: String(user.email ?? ""), user_metadata: user } : null } };
          }
        } catch {
          pb.authStore.clear();
          persistCookie();
        }
        return { data: { user: null } };
      },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        try {
          const data = await pb.collection("users").authWithPassword(email, password);
          persistCookie();
          return {
            data: { user: { ...data.record, email: String(data.record.email ?? ""), user_metadata: data.record } },
            error: null,
          };
        } catch (error) {
          return { data: null, error: { message: error instanceof Error ? error.message : "Invalid credentials." } };
        }
      },
      async signOut() {
        pb.authStore.clear();
        persistCookie();
        return { error: null };
      },
    },
    from(table: string) {
      return new QueryBuilder(pb, {
        table,
        select: "*",
        countExactHead: false,
        filters: [],
        orLikeTerms: [],
      });
    },
  };
}
