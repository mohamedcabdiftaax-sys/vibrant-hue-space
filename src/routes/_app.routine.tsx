import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/routine")({
  head: () => ({
    meta: [
      { title: "Routine – ia Academy" },
      { name: "description", content: "Weekly class schedule." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Routine" breadcrumb="Home / Routine" />
      
<div className="rounded-2xl bg-card border border-border p-5 shadow-sm overflow-x-auto">
  <table className="w-full text-sm">
    <thead className="text-xs text-muted-foreground uppercase border-b border-border"><tr><th className="text-left py-2">Time</th>{["Mon","Tue","Wed","Thu","Fri"].map(d=> <th key={d} className="text-left">{d}</th>)}</tr></thead>
    <tbody>
      {["08:00","09:00","10:00","11:00","12:00","13:00"].map((t,i)=>(
        <tr key={t} className="border-b border-border/60">
          <td className="py-3 font-medium">{t}</td>
          {["Math","English","Science","History","Physics"].map((s,j)=>(
            <td key={j} className="py-2"><div className={"px-3 py-2 rounded-lg text-xs font-medium "+((i+j)%2?"bg-primary/10 text-primary":"bg-brand-green/15 text-brand-green")}>{s}</div></td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}
