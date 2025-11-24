/**
 * Client-side fetch helper that always forwards cookies/session.
 * Also disables caching to avoid stale admin data.
 */
export function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers ?? undefined);

  return fetch(input, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers,
  });
}
