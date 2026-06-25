import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance – ia Academy" },
      { name: "description", content: "Daily attendance records." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" breadcrumb="Home / Attendance" />
      
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {[{l:"Present",v:"14,210",c:"text-brand-green"},{l:"Absent",v:"540",c:"text-rose-500"},{l:"Late",v:"250",c:"text-amber-500"},{l:"Total",v:"15,000",c:"text-primary"}].map((s)=>(
    <div key={s.l} className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="text-xs text-muted-foreground">{s.l}</div>
      <div className={"text-2xl font-bold mt-1 "+s.c}>{s.v}</div>
    </div>
  ))}
</div>
<div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
  <div className="font-semibold text-primary mb-4">Today’s Attendance</div>
  <ul className="divide-y divide-border">
    {["Eleanor Pena","Jessia Rose","Janny Wilson","Guy Hawkins","Jacob Jones"].map((n,i)=>(
      <li key={i} className="py-3 flex items-center justify-between text-sm"><span className="font-medium">{n}</span><span className={"px-3 py-1 rounded-full text-xs font-semibold "+(i%4===2?"bg-rose-100 text-rose-600":i%4===3?"bg-amber-100 text-amber-600":"bg-brand-green/15 text-brand-green")}>{i%4===2?"Absent":i%4===3?"Late":"Present"}</span></li>
    ))}
  </ul>
</div>

    </div>
  );
}
