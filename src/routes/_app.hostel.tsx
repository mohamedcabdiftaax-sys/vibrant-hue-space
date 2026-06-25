import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/hostel")({
  head: () => ({
    meta: [
      { title: "Hostel – ia Academy" },
      { name: "description", content: "Hostel rooms and residents." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Hostel" breadcrumb="Home / Hostel" />
      
<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
  {Array.from({length:24}).map((_,i)=>{
    const full=i%5===0; return (
    <div key={i} className={"rounded-2xl border p-4 text-center "+(full?"bg-rose-50 border-rose-200":"bg-card border-border")}>
      <div className="text-xs text-muted-foreground">Room</div>
      <div className="text-xl font-bold text-primary">A-{100+i}</div>
      <div className={"mt-2 text-xs font-semibold "+(full?"text-rose-500":"text-brand-green")}>{full?"Full":"Available"}</div>
    </div>
  )})}
</div>

    </div>
  );
}
