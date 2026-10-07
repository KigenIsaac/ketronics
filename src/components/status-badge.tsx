import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string,string> = {
 pending:"bg-amber-50 text-amber-700 border-amber-200", confirmed:"bg-blue-50 text-blue-700 border-blue-200",
 paid:"bg-emerald-50 text-emerald-700 border-emerald-200", processing:"bg-indigo-50 text-indigo-700 border-indigo-200",
 shipped:"bg-violet-50 text-violet-700 border-violet-200", delivered:"bg-green-50 text-green-700 border-green-200",
 cancelled:"bg-red-50 text-red-700 border-red-200", refunded:"bg-slate-100 text-slate-700 border-slate-200",
 returned:"bg-orange-50 text-orange-700 border-orange-200", active:"bg-green-50 text-green-700 border-green-200",
 inactive:"bg-slate-100 text-slate-600 border-slate-200", draft:"bg-amber-50 text-amber-700 border-amber-200",
};
export function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold capitalize", styles[status] || "bg-slate-50 text-slate-600")}>{status.replaceAll("_"," ")}</Badge>;
}
