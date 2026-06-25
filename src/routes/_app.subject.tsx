import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/subject")({
  head: () => ({
    meta: [
      { title: "Subject – ia Academy" },
      { name: "description", content: "Subjects taught across grades." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Subject" breadcrumb="Home / Subject" />
      
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {["Mathematics","English","Science","Computer","History","Geography","Physics","Chemistry","Biology"].map((s,i)=>(
    <div key={s} className="rounded-2xl bg-card border border-border p-5 shadow-sm flex items-center justify-between">
      <div>
        <div className="font-semibold text-primary">{s}</div>
        <div className="text-xs text-muted-foreground mt-1">{12+i} teachers • {200+i*15} students</div>
      </div>
      <div className="size-12 rounded-xl bg-brand-green/15 text-brand-green grid place-items-center font-bold">{s[0]}</div>
    </div>
  ))}
</div>

    </div>
  );
}
