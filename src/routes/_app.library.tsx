import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/library")({
  head: () => ({
    meta: [
      { title: "Library – ia Academy" },
      { name: "description", content: "Library catalog and borrow records." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Library" breadcrumb="Home / Library" />
      
<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
  {[{l:"Total Books",v:"12,450"},{l:"Borrowed",v:"1,230"},{l:"Members",v:"8,950"},{l:"Overdue",v:"42"}].map((s)=> (
    <div key={s.l} className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="text-xs text-muted-foreground">{s.l}</div>
      <div className="text-2xl font-bold text-primary mt-1">{s.v}</div>
    </div>
  ))}
</div>
<div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
  <div className="font-semibold text-primary mb-4">Recent Borrows</div>
  <ul className="divide-y divide-border">
    {["Atomic Habits","The Pragmatic Programmer","Sapiens","Clean Code","Deep Work"].map((b,i)=> (
      <li key={b} className="py-3 flex items-center justify-between text-sm">
        <span className="font-medium">{b}</span>
        <span className="text-muted-foreground">Borrowed by Student #{i+1}</span>
        <span className="text-brand-green font-semibold">Active</span>
      </li>
    ))}
  </ul>
</div>

    </div>
  );
}
