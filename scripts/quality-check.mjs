import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  settingsMigration: "supabase/migrations/20261006150000_store_settings_hardening.sql",
  settingsPage: "src/app/admin/settings/page.tsx",
  mpesaCallback: "src/app/api/callbacks/payments/mpesa/route.ts",
  mpesa: "src/lib/mpesa.ts",
  roles: "src/lib/roles.ts",
  storage: "src/lib/storage.ts",
  commerceRls: "supabase/migrations/20261006060000_commerce_rls_hardening.sql",
  webhook: "src/app/api/callbacks/webhooks/route.ts",
  rateLimit: "src/lib/rateLimit.ts",
  guestOrder: "src/app/api/orders/whatsapp/route.ts",
  contact: "src/app/api/contact/route.ts",
  orderStateMachine: "supabase/migrations/20261006120000_order_state_machine.sql",
  staffLifecycle: "supabase/migrations/20261007000000_admin_staff_lifecycle.sql",
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

assert.equal(source.staffLifecycle.includes("Only active admins can change staff activation status"), true);
assert.equal(source.staffLifecycle.includes("OLD.role IN ('manager', 'admin')"), true);
assert.equal(source.staffLifecycle.includes("role = 'admin'"), true);

assert.equal(source.orderStateMachine.includes("FOR UPDATE"), true);
assert.equal(source.orderStateMachine.includes("pending' AND p_next_status IN ('confirmed', 'cancelled')"), true);
assert.equal(source.orderStateMachine.includes("confirmed' AND p_next_status IN ('processing', 'cancelled')"), true);
assert.equal(source.orderStateMachine.includes("processing' AND p_next_status IN ('shipped', 'cancelled')"), true);
assert.equal(source.orderStateMachine.includes("shipped' AND p_next_status = 'delivered'"), true);
assert.equal(source.orderStateMachine.includes("delivered' AND p_next_status = 'returned'"), true);
assert.equal(source.orderStateMachine.includes("cancelled' AND p_next_status = 'refunded'"), true);
assert.equal(source.orderStateMachine.includes("release_order_inventory(p_order_id)"), true);
assert.equal(source.orderStateMachine.includes("GRANT EXECUTE ON FUNCTION public.transition_order_status"), true);

console.log("Ketronics security/architecture invariants: PASS");
