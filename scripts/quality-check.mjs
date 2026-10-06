import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  settingsMigration: "supabase/migrations/20261006_store_settings_hardening.sql",
  settingsPage: "src/app/admin/settings/page.tsx",
  mpesaCallback: "src/app/api/callbacks/payments/mpesa/route.ts",
  mpesa: "src/lib/mpesa.ts",
  roles: "src/lib/roles.ts",
  storage: "src/lib/storage.ts",
  commerceRls: "supabase/migrations/20261006_commerce_rls_hardening.sql",
  webhook: "src/app/api/callbacks/webhooks/route.ts",
  rateLimit: "src/lib/rateLimit.ts",
  guestOrder: "src/app/api/orders/whatsapp/route.ts",
  contact: "src/app/api/contact/route.ts",
};

const source = {};
for (const [name, path] of Object.entries(files)) {
  source[name] = await readFile(path, "utf8");
}

assert.equal(source.settingsMigration.includes("DROP COLUMN IF EXISTS smtp_password"), true);
assert.equal(source.settingsMigration.includes("ENABLE ROW LEVEL SECURITY"), true);
assert.equal(source.settingsPage.includes("smtpPassword"), false);
assert.equal(source.settingsPage.includes("/api/admin/settings"), true);

assert.equal(source.mpesaCallback.includes("queryStkPush"), true);
assert.equal(source.mpesaCallback.includes("apply_payment_success"), true);
assert.equal(source.mpesa.includes("/mpesa/stkpushquery/v1/query"), true);

assert.equal(source.roles.includes('role === "manager" || role === "admin"'), true);
assert.equal(source.storage.includes("crypto.randomUUID()"), true);
assert.equal(source.storage.includes("5 MB"), true);
assert.equal(source.commerceRls.includes("ENABLE ROW LEVEL SECURITY"), true);
assert.equal(source.commerceRls.includes('REVOKE ALL ON TABLE public.payments'), true);
assert.equal(source.webhook.includes("export async function GET"), false);
assert.equal(source.rateLimit.includes("consume_api_rate_limit"), true);
assert.equal(source.guestOrder.includes("consumeRateLimit"), true);
assert.equal(source.contact.includes("consumeRateLimit"), true);

console.log("Ketronics security/architecture invariants: PASS");
