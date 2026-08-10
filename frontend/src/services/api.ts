/**
 * Portable frontend API boundary.
 *
 * The generated client used by the preview lives in lib/api-client-react.
 * This small helper documents the same-origin contract for a standalone Vite
 * continuation and keeps the API base URL environment-driven.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}