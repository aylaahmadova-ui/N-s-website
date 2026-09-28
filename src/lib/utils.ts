import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Returns the URL only when it is a plain http(s) link, otherwise null.
 *
 * Organization websites are self-submitted, so a stored value can carry a
 * `javascript:` or `data:` scheme. Rendering one into an href would run it in
 * the viewer's session — including an admin's. Callers must treat null as
 * "render no link at all" rather than falling back to the raw value.
 */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
