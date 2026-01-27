export function signOut() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("authToken");
  } catch {
    /* ignore */
  }
  window.location.href = "/login";
}