import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Agnes integration keeps provider secrets server-only and uses OpenAI-compatible endpoint", async () => {
  const source = await readFile("src/lib/agnes.ts", "utf8");
  assert.match(source, /https:\/\/apihub\.agnes-ai\.com\/v1/);
  assert.match(source, /process\.env\.AGNES_API_KEY/);
  assert.doesNotMatch(source, /NEXT_PUBLIC_AGNES_API_KEY/);
  assert.match(source, /Authorization:.*apiKey/);
  assert.match(source, /AbortSignal\.timeout/);
  assert.match(source, /nullable\(\)\.optional\(\)/);
  assert.match(source, /tool_calls/);
});

test("public AI endpoint validates inputs, rate limits shared quota and uses active catalogue products", async () => {
  const source = await readFile("src/app/api/ai/chat/route.ts", "utf8");
  assert.match(source, /messages: z\.array\(messageSchema\)\.min\(1\)\.max\(10\)/);
  assert.match(source, /consumeRateLimit\("agnes:global:chat", 12, 60\)/);
  assert.match(source, /consumeRateLimit\(`agnes:chat:ip:/);
  assert.match(source, /\.eq\("status", "active"\)/);
  assert.match(source, /isCatalogueCountQuestion/);
  assert.match(source, /isGreeting/);
  assert.match(source, /showProducts: false/);
  assert.match(source, /search_products/);
  assert.match(source, /get_product_details/);
  assert.match(source, /get_catalogue_count/);
  assert.match(source, /toolCallingSupported/);
  assert.match(source, /count: "exact", head: true/);
  assert.match(source, /catalogue-count/);
  assert.match(source, /Never invent items, prices, stock or policies/);
  assert.match(source, /Cache-Control.*no-store|Cache-Control/);
  assert.match(source, /imageDataUrl/);
});

test("admin AI endpoint requires active manager/admin and never publishes generated content", async () => {
  const source = await readFile("src/app/api/admin/ai/generate/route.ts", "utf8");
  assert.match(source, /supabase\.auth\.getUser\(\)/);
  assert.match(source, /!profile\?\.is_active/);
  assert.match(source, /\["manager", "admin"\]/);
  assert.match(source, /agnes:global:admin/);
  assert.match(source, /Do not claim to have changed or published anything/);
  assert.match(source, /product-description[\s\S]*seo/);
});

test("customer AI widget is present and accessible from the site layout", async () => {
  const layout = await readFile("src/app/layout.tsx", "utf8");
  const widget = await readFile("src/components/ai/KetronicsAI.tsx", "utf8");
  assert.match(layout, /KetronicsAI/);
  assert.match(widget, /aria-label="Ketronics AI shopping assistant"/);
  assert.match(widget, /function MessageContent/);
  assert.match(widget, /ReactMarkdown/);
  assert.match(widget, /remarkGfm/);
  assert.match(widget, /showProducts && products.length > 0/);
  assert.match(widget, /Attach product image/);
  assert.match(widget, /2 \* 1024 \* 1024/);
  assert.match(widget, /\/api\/ai\/chat/);
});