const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const routes = [
  ["/", 200], ["/products", 200], ["/products/00000000-0000-0000-0000-000000000000", 404],
  ["/cart", 200], ["/checkout", 200], ["/auth/login", 200], ["/auth/signup", 200],
  ["/about-us", 200], ["/contact", 200], ["/faq", 200], ["/support", 200],
  ["/privacy-policy", 200], ["/terms-and-conditions", 200], ["/api/health", 200],
  ["/dashboard", 307], ["/orders", 200], ["/profile", 200], ["/settings", 200], ["/admin", 307],
];
for (const [path, expected] of routes) {
  const response = await fetch(base + path, { redirect: "manual" });
  const status = response.status;
  if (status !== expected && !(expected === 307 && status >= 300 && status < 400)) {
    throw new Error(`${path}: expected ${expected}, received ${status}`);
  }
  if (status >= 500) throw new Error(`${path}: server error ${status}`);
  console.log(`PASS ${status} ${path}`);
}
console.log("Ketronics production route smoke test: PASS");
