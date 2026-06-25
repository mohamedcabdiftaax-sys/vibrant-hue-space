import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";

export const Route = createFileRoute("/_app/exam")({
  head: () => ({
    meta: [
      { title: "Exam – ia Academy" },
      { name: "description", content: "Upcoming exams and results overview." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-6">
      <PageHeader title="Exam" breadcrumb="Home / Exam" />
      
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
    <div className="font-semibold text-primary mb-4">Upcoming Exams</div>
    <ul className="space-y-3">
      {[{s:"Mathematics",d:"28 Jun"},{s:"English",d:"30 Jun"},{s:"Science",d:"02 Jul"},{s:"History",d:"05 Jul"}].map((e)=>(
        <li key={e.s} className="flex items-center justify-between p-3 rounded-xl bg-secondary"><span className="font-medium">{e.s}</span><span className="text-xs px-3 py-1 rounded-full bg-primary text-primary-foreground">{e.d}</span></li>
      ))}
    </ul>
  </div>
  <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
    <div className="font-semibold text-primary mb-4">Recent Results</div>
    <ul className="space-y-3">
      {[{s:"Final Term 2024",p:"92%"},{s:"Mid Term 2024",p:"88%"},{s:"Quiz 03",p:"79%"}].map((r)=>(
        <li key={r.s} className="flex items-center justify-between p-3 rounded-xl bg-secondary"><span className="font-medium">{r.s}</span><span className="text-brand-green font-bold">{r.p}</span></li>
      ))}
    </ul>
  </div>
</div>

    </div>
  );
}
