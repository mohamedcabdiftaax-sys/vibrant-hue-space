import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/transport")({
  head: () => ({
    meta: [
      { title: "Transport – ia Academy" },
      { name: "description", content: "Bus routes and drivers." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Transport" breadcrumb="Home / Transport" />
      
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {Array.from({length:6}).map((_,i)=>(
    <div key={i} className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Route {i+1}</div>
          <div className="font-semibold text-primary mt-1">Downtown → School</div>
        </div>
        <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center font-bold">B{i+1}</div>
      </div>
      <div className="mt-4 grid grid-cols-3 text-center text-xs">
        <div><div className="text-muted-foreground">Driver</div><div className="font-medium">John D.</div></div>
        <div><div className="text-muted-foreground">Seats</div><div className="font-medium">{30+i}</div></div>
        <div><div className="text-muted-foreground">Status</div><div className="text-brand-green font-semibold">Active</div></div>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}
