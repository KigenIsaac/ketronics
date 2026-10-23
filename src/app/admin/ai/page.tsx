"use client";

import { useState, type FormEvent } from "react";

const tasks = ["product-description", "seo", "social-caption", "campaign", "support-draft", "insights"] as const;

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
    <div><p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Ketronics workspace</p><h1 className="text-3xl font-bold">AI business assistant</h1><p className="mt-1 text-sm text-neutral-500">Draft content and analyze facts with Agnes AI. Nothing is published automatically.</p></div>
    <form onSubmit={generate} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
      <label className="block space-y-2"><span className="text-sm font-semibold">Task</span><select value={task} onChange={(e) => setTask(e.target.value as typeof task)} className="w-full rounded-xl border px-3 py-3 text-sm">{tasks.map((item) => <option key={item} value={item}>{item.replaceAll("-", " ")}</option>)}</select></label>
      <label className="block space-y-2"><span className="text-sm font-semibold">Verified source facts / context</span><textarea required minLength={10} maxLength={5000} rows={7} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste verified product specs, campaign goals, anonymized sales figures or a customer message. Do not include secrets." className="w-full rounded-xl border px-3 py-3 text-sm"/></label>
      {["product-description", "seo"].includes(task) && <label className="block space-y-2"><span className="text-sm font-semibold">Optional active product ID (UUID)</span><input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Product UUID for verified catalogue context" className="w-full rounded-xl border px-3 py-3 text-sm"/></label>}
      <button disabled={busy || input.trim().length < 10} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Generating…" : "Generate draft"}</button>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </form>
    {result && <section className="space-y-3 rounded-2xl border bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Generated draft</h2><button type="button" onClick={() => void navigator.clipboard.writeText(result)} className="rounded-lg border px-3 py-2 text-sm">Copy</button></div><pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">{result}</pre><p className="text-xs text-neutral-500">Review facts and edit before publishing or sending.</p></section>}
  </div>;
}
