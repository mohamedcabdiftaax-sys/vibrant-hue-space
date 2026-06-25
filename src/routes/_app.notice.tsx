import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/notice")({
  head: () => ({
    meta: [
      { title: "Notice – ia Academy" },
      { name: "description", content: "Announcements and notices." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Notice" breadcrumb="Home / Notice" />
      
<div className="space-y-3">
  {[{t:"Annual Sports Day",d:"All students are required to participate in the annual sports day on 12 July."},{t:"Parent–Teacher Meeting",d:"PTM scheduled for 5 July at 10:00 AM."},{t:"Library Closure",d:"The library will remain closed on 28 June for inventory."}].map((n)=>(
    <div key={n.t} className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2"><span className="px-3 py-1 rounded-full bg-brand-green/15 text-brand-green text-xs font-semibold">Notice</span><span className="text-xs text-muted-foreground">25 Jun 2026</span></div>
      <div className="font-semibold text-primary">{n.t}</div>
      <div className="text-sm text-muted-foreground mt-1">{n.d}</div>
    </div>
  ))}
</div>

    </div>
  );
}
