/**
 * Client-side fetch helper that always forwards cookies/session.
 * Also disables caching to avoid stale admin data.
 */
export function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(input, {
    cache: "no-store",
    credentials: "include",
    ...init,
    headers: {
      ...(init.headers ?? {}),
    },
  });
}
