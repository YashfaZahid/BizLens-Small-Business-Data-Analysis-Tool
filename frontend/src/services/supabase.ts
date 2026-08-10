/**
 * Supabase integration boundary only.
 *
 * Auth, storage, and database clients are intentionally not initialized in the
 * scaffold. Add them here when the product moves beyond the placeholder pass.
 */
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL ?? '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
};