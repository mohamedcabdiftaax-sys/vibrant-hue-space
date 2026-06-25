import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/account")({
  head: () => ({
    meta: [
      { title: "Account – ia Academy" },
      { name: "description", content: "Finance overview and recent transactions." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Account" breadcrumb="Home / Account" />
      
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {[{l:"Total Revenue",v:"$120.5K",c:"text-brand-green"},{l:"Expenses",v:"$45.2K",c:"text-rose-500"},{l:"Net",v:"$75.3K",c:"text-primary"}].map((s)=>(
    <div key={s.l} className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="text-xs text-muted-foreground">{s.l}</div>
      <div className={"text-2xl font-bold mt-1 "+s.c}>{s.v}</div>
    </div>
  ))}
</div>
<div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
  <div className="font-semibold text-primary mb-4">Transactions</div>
  <table className="w-full text-sm">
    <thead className="text-xs text-muted-foreground uppercase border-b border-border"><tr><th className="text-left py-2">Date</th><th className="text-left">Description</th><th className="text-left">Type</th><th className="text-right">Amount</th></tr></thead>
    <tbody>
      {[{d:"24 Jun",t:"Tuition fee – Class 10",ty:"Income",a:"+$2,400"},{d:"22 Jun",t:"Salary – Faculty",ty:"Expense",a:"-$8,500"},{d:"20 Jun",t:"Library purchase",ty:"Expense",a:"-$1,200"},{d:"18 Jun",t:"Tuition fee – Class 9",ty:"Income",a:"+$1,900"}].map((r,i)=>(
        <tr key={i} className="border-b border-border/60"><td className="py-3">{r.d}</td><td>{r.t}</td><td className="text-muted-foreground">{r.ty}</td><td className={"text-right font-semibold "+(r.a.startsWith("+")?"text-brand-green":"text-rose-500")}>{r.a}</td></tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}
