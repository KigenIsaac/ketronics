import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function StorePage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1400px] px-0 py-2 sm:py-4 lg:py-6", className)}>{children}</div>;
}

export function PageHero({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <section className="relative mb-7 overflow-hidden rounded-2xl bg-[#10152b] px-5 py-7 text-white sm:px-8 sm:py-9 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(34,119,255,.35),transparent_32%),linear-gradient(120deg,#10152b,#132b59)]" />
      <div className="relative max-w-3xl">
        {eyebrow && <p className="mb-2 text-[10px] font-bold uppercase tracking-[.24em] text-white/55">{eyebrow}</p>}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[-.045em] sm:text-4xl lg:text-5xl">{title}</h1>
            {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">{description}</p>}
          </div>
          {action}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description, href, actionLabel = "View all" }: { eyebrow?: string; title: string; description?: string; href?: string; actionLabel?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[.22em] text-muted-foreground">{eyebrow}</p>}
        <h2 className="text-2xl font-bold tracking-[-.04em] text-foreground sm:text-3xl">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {href && <Link href={href} className="shrink-0 text-sm font-bold text-orange-600 hover:text-orange-700">{actionLabel} <ArrowRight className="ml-1 inline h-4 w-4" /></Link>}
    </div>
  );
}

export function Surface({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border bg-card text-card-foreground shadow-[0_8px_30px_rgba(16,24,40,.05)] dark:shadow-[0_12px_36px_rgba(0,0,0,.18)]", className)}>{children}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <Surface className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><PackageOpen className="h-6 w-6 text-muted-foreground" /></div>
      <h2 className="text-xl font-bold tracking-[-.02em]">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </Surface>
  );
}

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: React.ReactNode; hint?: string; icon: React.ComponentType<{ className?: string }> }) {
  return <Surface className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold tracking-[-.04em]">{value}</p>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></div></div></Surface>;
}
