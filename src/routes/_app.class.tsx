import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/class")({
  head: () => ({
    meta: [
      { title: "Class – ia Academy" },
      { name: "description", content: "All active classes and grade levels." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Class" breadcrumb="Home / Class" />
      
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
  {Array.from({length:10}).map((_,i)=>(
    <div key={i} className="rounded-2xl bg-card border border-border p-5 shadow-sm text-center">
      <div className="text-xs text-muted-foreground">Class</div>
      <div className="text-3xl font-bold text-primary">{i+1}</div>
      <div className="mt-3 text-xs text-muted-foreground">{120+i*8} students</div>
      <div className="mt-1 text-xs text-brand-green font-semibold">{8+i} sections</div>
    </div>
  ))}
</div>

    </div>
  );
}
