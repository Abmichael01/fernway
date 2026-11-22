/** Only same-site paths are allowed as a post-sign-in destination (no open redirects). */
export function safeNextPath(value: string | null | undefined, fallback: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

/** Where a user lands after signing in: their `next` page if it belongs to their side of the app. */
export function homeFor(role: "customer" | "admin", next?: string | null): string {
  const home = role === "admin" ? "/admin" : "/overview";
  const target = safeNextPath(next, home);
  const isAdminPath = target === "/admin" || target.startsWith("/admin/");
  return (role === "admin") === isAdminPath ? target : home;
}
