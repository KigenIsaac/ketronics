"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Bot, ImagePlus, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Product = { id: string; name: string; price_kes: number; image: string | null; brand: string | null };

function MessageContent({ content }: { content: string }) {
  return (
    <div className="space-y-2 break-words [&_a]:font-medium [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:whitespace-pre-wrap [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-neutral-100 [&_pre]:p-2 [&_strong]:font-semibold [&_table]:w-full [&_td]:border [&_td]:p-1 [&_th]:border [&_th]:p-1">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
      }}>{content}</ReactMarkdown>
    </div>
  );
}

export function KetronicsAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I’m Ketronics AI. Tell me what you’re looking for, your budget in KSh, or upload a product photo and I’ll help you explore our catalogue." },
  ]);
  const [draft, setDraft] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const relevantProducts = showProducts ? products.slice(0, 4) : [];

  async function attachImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError("Choose a PNG, JPEG or WebP image under 2 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(typeof reader.result === "string" ? reader.result : undefined);
    reader.onerror = () => setError("Could not read that image.");
    reader.readAsDataURL(file);
    setError("");
    event.target.value = "";
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim() || (imageDataUrl ? "Please identify this item and find the closest matching products in the Ketronics catalogue." : "");
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10), ...(imageDataUrl ? { imageDataUrl } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The assistant could not respond.");
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
      setProducts(Array.isArray(data.products) ? data.products : []);
      setShowProducts(data.showProducts === true && Array.isArray(data.products) && data.products.length > 0);
      setImageDataUrl(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant could not respond.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-4 z-[80] sm:bottom-6 sm:right-6">
      {open && (
        <section aria-label="Ketronics AI shopping assistant" className="mb-3 flex h-[min(680px,calc(100dvh-110px))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
          <header className="flex items-center gap-3 bg-neutral-950 px-4 py-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500"><Bot size={21}/></span>
            <div className="min-w-0 flex-1"><p className="font-semibold">Ketronics AI</p><p className="text-xs text-white/65">Product finder · Agnes AI</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-lg p-2 hover:bg-white/10"><X size={19}/></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-3" aria-live="polite">
            <p className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-xs text-neutral-600">AI-generated guidance can be imperfect. Verify specifications and stock with Ketronics before ordering.</p>
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" ? "ml-7 whitespace-pre-wrap rounded-2xl rounded-br-sm bg-neutral-900 px-3 py-2.5 text-sm leading-relaxed text-white" : "mr-5 whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-neutral-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-neutral-800"}><MessageContent content={message.content} /></div>
            ))}
            {busy && <div className="flex items-center gap-2 text-sm text-neutral-500"><LoaderCircle className="animate-spin" size={16}/> Thinking…</div>}
            {relevantProducts.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Matching catalogue products</p>{relevantProducts.slice(0,4).map((p) => <div key={p.id} className="flex items-center gap-3 rounded-xl border bg-white p-2">{p.image ? <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-contain" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100"><Bot size={18}/></div>}<div className="min-w-0 flex-1"><p className="line-clamp-2 text-xs font-medium">{p.name}</p><p className="mt-1 text-xs font-semibold text-orange-700">KSh {Number(p.price_kes).toLocaleString("en-KE")}</p></div><a className="text-xs font-semibold underline" href={`/products?search=${encodeURIComponent(p.name)}`}>View product</a></div>)}</div>}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          </div>
          <form onSubmit={submit} className="space-y-2 border-t bg-white p-3">
            {imageDataUrl && <div className="flex items-center justify-between rounded-lg bg-neutral-100 p-2 text-xs"><span>Product image attached</span><button type="button" onClick={() => setImageDataUrl(undefined)} className="underline">Remove</button></div>}
            <div className="flex items-end gap-2">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={attachImage} className="hidden"/>
              <button type="button" aria-label="Attach product image" title="Find a product from a photo" onClick={() => fileRef.current?.click()} className="rounded-xl border p-3 text-neutral-600 hover:bg-neutral-100"><ImagePlus size={18}/></button>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} rows={2} placeholder="Ask about products, prices, specs…" className="min-h-11 flex-1 resize-none rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400" />
              <button disabled={busy || (!draft.trim() && !imageDataUrl)} type="submit" aria-label="Send message" className="rounded-xl bg-orange-500 p-3 text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"><Send size={18}/></button>
            </div>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close Ketronics AI" : "Open Ketronics AI shopping assistant"} className="ml-auto flex h-14 items-center gap-2 rounded-full bg-orange-500 px-5 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-600">
        {open ? <X size={21}/> : <MessageCircle size={21}/>}<span className="text-sm font-semibold">{open ? "Close" : "Ask Ketronics AI"}</span>
      </button>
    </div>
  );
}