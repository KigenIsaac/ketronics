"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

const tasks = ["product-description", "seo", "social-caption", "campaign", "support-draft", "insights", "catalogue-audit"] as const;
const taskLabels: Record<(typeof tasks)[number], string> = {
  "product-description": "Product description",
  seo: "SEO title and meta description",
  "social-caption": "Social media captions",
  campaign: "Marketing campaign plan",
  "support-draft": "Customer support reply",
  insights: "Business insights (last 90 days)",
  "catalogue-audit": "AI catalogue quality audit",
};


type BusinessMetrics = {
  periodDays: number;
  generatedAt: string;
  summary: { revenueKes: number; recognizedOrders: number; pendingOrders: number; cancelledOrders: number; averageOrderValueKes: number; activeProducts: number };
  daily: Array<{ date: string; orders: number; revenueKes: number }>;
  topProducts: Array<{ name: string; units: number; revenueKes: number }>;
  lowStock: Array<{ id: string; name: string; stock: number | null; threshold: number | null }>;
  limitations: string[];
};

function money(value: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value);
}

function BusinessIntelligencePanel() {
  const [days, setDays] = useState("30");
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  async function generateActionPlan() {
    setAnalyzing(true);
    setAnalysisError("");
    setActionPlan("");
    try {
      const response = await fetch("/api/admin/ai/business-intelligence/analyze", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate an action plan.");
      setActionPlan(data.analysis || "No analysis was returned.");
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Could not generate an action plan.");
    } finally {
      setAnalyzing(false);
    }
  }

  const loadMetrics = useCallback(async (windowDays: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/ai/business-intelligence?days=${windowDays}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load business metrics.");
      setMetrics(data as BusinessMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load business metrics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadMetrics(days); }, [days, loadMetrics]);

  const maxRevenue = Math.max(1, ...(metrics?.daily.map((day) => day.revenueKes) ?? [0]));
  return <section className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-xl font-bold">Business intelligence</h2><p className="mt-1 text-sm text-neutral-500">Read-only sales, product and inventory signals from your store database.</p></div>
      <div className="flex items-center gap-2">
        <label htmlFor="bi-window" className="text-sm font-medium">Period</label>
        <select id="bi-window" value={days} onChange={(event) => setDays(event.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option>
        </select>
        <button type="button" onClick={() => void loadMetrics(days)} disabled={loading} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">{loading ? "Loading…" : "Refresh"}</button>
      </div>
    </div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h3 className="font-semibold">Ask Agnes for a growth plan</h3><p className="mt-1 text-sm text-neutral-600">Analyze verified sales and inventory signals for prioritized, measurable actions. No changes are made to your store.</p></div>
        <button type="button" onClick={() => void generateActionPlan()} disabled={analyzing} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{analyzing ? "Analyzing…" : "Generate AI action plan"}</button>
      </div>
      {analysisError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{analysisError}</p>}
      {actionPlan && <div className="mt-4 space-y-2 rounded-lg bg-white p-4"><div className="flex items-center justify-between gap-2"><h4 className="font-semibold">Agnes growth recommendations</h4><button type="button" onClick={() => void navigator.clipboard.writeText(actionPlan)} className="rounded-md border px-3 py-1.5 text-xs">Copy plan</button></div><pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{actionPlan}</pre><p className="text-xs text-neutral-500">Recommendations are hypotheses based on bounded store data. Review before acting.</p></div>}
    </div>
    {loading && !metrics && <p className="text-sm text-neutral-500">Loading verified store metrics…</p>}
    {metrics && <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-orange-50 p-4"><p className="text-sm text-neutral-600">Recognized revenue</p><p className="mt-1 text-2xl font-bold">{money(metrics.summary.revenueKes)}</p></div>
        <div className="rounded-xl bg-neutral-50 p-4"><p className="text-sm text-neutral-600">Paid / shipped / delivered orders</p><p className="mt-1 text-2xl font-bold">{metrics.summary.recognizedOrders}</p></div>
        <div className="rounded-xl bg-neutral-50 p-4"><p className="text-sm text-neutral-600">Average order value</p><p className="mt-1 text-2xl font-bold">{money(metrics.summary.averageOrderValueKes)}</p></div>
        <div className="rounded-xl bg-neutral-50 p-4"><p className="text-sm text-neutral-600">Pending orders in window</p><p className="mt-1 text-2xl font-bold">{metrics.summary.pendingOrders}</p></div>
        <div className="rounded-xl bg-neutral-50 p-4"><p className="text-sm text-neutral-600">Cancelled orders in window</p><p className="mt-1 text-2xl font-bold">{metrics.summary.cancelledOrders}</p></div>
        <div className="rounded-xl bg-neutral-50 p-4"><p className="text-sm text-neutral-600">Active products reviewed</p><p className="mt-1 text-2xl font-bold">{metrics.summary.activeProducts}</p></div>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold">Daily recognized revenue</h3>
        <div className="space-y-2">
          {metrics.daily.filter((day) => day.revenueKes > 0 || day.orders > 0).slice(-14).map((day) => <div key={day.date} className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-3 text-xs sm:text-sm">
            <span className="text-neutral-500">{day.date.slice(5)}</span>
            <div className="h-3 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.max(2, day.revenueKes / maxRevenue * 100)}%` }} /></div>
            <span className="min-w-20 text-right font-medium">{money(day.revenueKes)}</span>
          </div>)}
          {!metrics.daily.some((day) => day.revenueKes > 0 || day.orders > 0) && <p className="text-sm text-neutral-500">No recognized revenue in this period.</p>}
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2"><h3 className="font-semibold">Top products by units in recognized orders</h3>
          {metrics.topProducts.length ? metrics.topProducts.map((product, index) => <div key={product.name + index} className="flex items-start justify-between gap-3 border-b py-2 text-sm"><span>{index + 1}. {product.name}</span><span className="shrink-0 text-right"><strong>{product.units} units</strong><br/><span className="text-xs text-neutral-500">{money(product.revenueKes)}</span></span></div>) : <p className="text-sm text-neutral-500">No linked order-item data in this period.</p>}
        </div>
        <div className="space-y-2"><h3 className="font-semibold">Inventory attention</h3>
          {metrics.lowStock.length ? metrics.lowStock.map((product) => <div key={product.id} className="flex items-start justify-between gap-3 border-b py-2 text-sm"><span>{product.name}</span><span className="shrink-0 text-right"><strong>{product.stock ?? "—"} in stock</strong><br/><span className="text-xs text-neutral-500">Threshold: {product.threshold ?? "—"}</span></span></div>) : <p className="text-sm text-neutral-500">No low-stock alerts among tracked active products.</p>}
        </div>
      </div>
      <details className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600"><summary className="cursor-pointer font-semibold">Metric definitions and limitations</summary><ul className="mt-2 list-disc space-y-1 pl-5">{metrics.limitations.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-2">Updated {new Date(metrics.generatedAt).toLocaleString()}</p></details>
    </>}
  </section>;
}


function CampaignStudio() {
  const [goal, setGoal] = useState("sales");
  const [channel, setChannel] = useState("whatsapp");
  const [audience, setAudience] = useState("People in Kenya comparing electronics and value for money");
  const [budgetKes, setBudgetKes] = useState("0");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function generateCampaign(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setDraft("");
    try {
      const response = await fetch("/api/admin/ai/campaign-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, channel, audience, budgetKes: Number(budgetKes) || 0 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate a campaign draft.");
      setDraft(data.draft || "No draft was returned.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate a campaign draft.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
    <div><p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Marketing operator · draft mode</p><h2 className="text-xl font-bold">AI campaign studio</h2><p className="mt-1 text-sm text-neutral-500">Generate channel-ready marketing drafts from active catalogue records. Nothing is published, scheduled or sent.</p></div>
    <form onSubmit={generateCampaign} className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-1 text-sm"><span className="font-medium">Campaign goal</span><select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full rounded-lg border px-3 py-2"><option value="sales">Increase sales</option><option value="awareness">Build awareness</option><option value="clearance">Move selected products</option><option value="bundles">Suggest bundles</option><option value="education">Educate customers</option></select></label>
      <label className="space-y-1 text-sm"><span className="font-medium">Channel</span><select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full rounded-lg border px-3 py-2"><option value="whatsapp">WhatsApp</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="tiktok">TikTok</option><option value="website">Website</option></select></label>
      <label className="space-y-1 text-sm sm:col-span-2"><span className="font-medium">Intended audience</span><input required minLength={3} maxLength={160} value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Who is this campaign for?" /></label>
      <label className="space-y-1 text-sm"><span className="font-medium">Budget ceiling (KSh)</span><input type="number" min="0" max="1000000" step="100" value={budgetKes} onChange={(e) => setBudgetKes(e.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
      <div className="flex items-end"><button type="submit" disabled={busy || audience.trim().length < 3} className="rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Building campaign…" : "Generate campaign draft"}</button></div>
    </form>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {draft && <div className="space-y-3 rounded-xl border p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-semibold">Campaign draft</h3><button type="button" onClick={() => void navigator.clipboard.writeText(draft)} className="rounded-lg border px-3 py-2 text-sm">Copy draft</button></div><pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{draft}</pre><p className="text-xs text-neutral-500">Verify price, tracked stock, product compatibility and all claims before publishing.</p></div>}
  </section>;
}

export default function AdminAIPage() {
  const [task, setTask] = useState<(typeof tasks)[number]>("product-description");
  const [input, setInput] = useState("");
  const [productId, setProductId] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setResult("");
    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, input, ...(productId.trim() ? { productId: productId.trim() } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setResult(data.result);
    } catch (err) { setError(err instanceof Error ? err.message : "Generation failed."); }
    finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-4xl space-y-6">
    <div><p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Ketronics workspace</p><h1 className="text-3xl font-bold">AI business assistant</h1><p className="mt-1 text-sm text-neutral-500">Create sales-focused drafts and analyze business data with Agnes AI. Missing facts should be verified; nothing is published automatically.</p></div>
    <BusinessIntelligencePanel />
    <CampaignStudio />
    <form onSubmit={generate} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
      <label className="block space-y-2"><span className="text-sm font-semibold">Task</span><select value={task} onChange={(e) => setTask(e.target.value as typeof task)} className="w-full rounded-xl border px-3 py-3 text-sm">{tasks.map((item) => <option key={item} value={item}>{taskLabels[item]}</option>)}</select></label>
      <label className="block space-y-2"><span className="text-sm font-semibold">Verified source facts / context</span><textarea required minLength={10} maxLength={5000} rows={7} value={input} onChange={(e) => setInput(e.target.value)} placeholder={task === "insights" ? "What do you want to learn from the last 90 days? Example: identify risks, explain trends, and suggest measurable actions. Database metrics will be added automatically." : task === "catalogue-audit" ? "Describe your audit focus. Example: prioritize missing images, weak descriptions, and duplicate product names. The AI will inspect live catalogue quality metrics." : task === "product-description" ? "Paste verified specifications, included accessories, use cases, and any limitations. The AI will flag missing facts rather than invent them." : task === "support-draft" ? "Paste the customer message and only the confirmed policy/order facts needed for a safe reply. Remove passwords and unnecessary personal data." : "Add verified product facts, audience, campaign goal, or context. Do not include secrets or unsupported claims."} className="w-full rounded-xl border px-3 py-3 text-sm"/></label>
      {["product-description", "seo"].includes(task) && <label className="block space-y-2"><span className="text-sm font-semibold">Optional active product ID (UUID)</span><input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Product UUID for verified catalogue context" className="w-full rounded-xl border px-3 py-3 text-sm"/></label>}
      <button disabled={busy || input.trim().length < 10} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Generating…" : "Generate draft"}</button>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </form>
    {result && <section className="space-y-3 rounded-2xl border bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Generated draft</h2><button type="button" onClick={() => void navigator.clipboard.writeText(result)} className="rounded-lg border px-3 py-2 text-sm">Copy</button></div><pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{result}</pre><p className="text-xs text-neutral-500">Review facts and edit before publishing or sending.</p></section>}
  </div>;
}
