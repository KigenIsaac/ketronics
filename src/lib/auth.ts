/**
 * Authentication is handled by Supabase sessions.
 * Kept as a compatibility shim for old imports; it does not store credentials.
 */
export function signOut() {
  if (typeof window !== 'undefined') window.location.href = '/auth/login';
}
