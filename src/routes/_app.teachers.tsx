import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/teachers")({
  head: () => ({
    meta: [
      { title: "Teachers – ia Academy" },
      { name: "description", content: "Browse academy faculty and assignments." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Teachers" breadcrumb="Home / Teachers" />
      
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {Array.from({ length: 9 }).map((_, i) => (
    <div key={i} className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-full bg-gradient-to-br from-primary to-brand-green grid place-items-center text-white font-semibold">T{i+1}</div>
        <div>
          <div className="font-semibold text-primary">Teacher {i+1}</div>
          <div className="text-xs text-muted-foreground">Mathematics • Senior</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div className="p-2 rounded-lg bg-secondary"><div className="text-xs text-muted-foreground">Classes</div><div className="font-semibold text-primary">{12+i}</div></div>
        <div className="p-2 rounded-lg bg-secondary"><div className="text-xs text-muted-foreground">Students</div><div className="font-semibold text-primary">{120+i*3}</div></div>
        <div className="p-2 rounded-lg bg-secondary"><div className="text-xs text-muted-foreground">Rating</div><div className="font-semibold text-brand-green">4.{8-i%3}</div></div>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}
