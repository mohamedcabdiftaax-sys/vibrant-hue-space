import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { Plus, Search, Calendar, Trash2, Pencil } from "lucide-react";

export const Route = createFileRoute("/_app/students")({
  head: () => ({
    meta: [
      { title: "Students – ia Academy" },
      { name: "description", content: "View, add and manage student records." },
    ],
  }),
  component: StudentsPage,
});

const students = [
  { name: "Eleanor Pena", roll: "#01", address: "TA-107 Newyork", class: "01", dob: "03/05/2001", phone: "+123 5988567" },
  { name: "Jessia Rose", roll: "#10", address: "TA-107 Newyork", class: "02", dob: "03/04/2000", phone: "+123 5988569" },
  { name: "Janny Wilson", roll: "#04", address: "Australia, Sydney", class: "02", dob: "12/05/2001", phone: "+123 7988568" },
  { name: "Guy Hawkins", roll: "#03", address: "TA-107 Newyork", class: "02", dob: "03/05/2001", phone: "+123 5988568" },
  { name: "Jacob Jones", roll: "#15", address: "Australia, Sydney", class: "04", dob: "12/05/2001", phone: "+123 5988568" },
  { name: "Jacob Jones", roll: "#15", address: "Australia, Sydney", class: "04", dob: "12/05/2001", phone: "+123 5988568" },
  { name: "Jane Cooper", roll: "#01", address: "Australia, Sydney", class: "02", dob: "12/03/2001", phone: "+123 5988569" },
  { name: "Floyd Miles", roll: "#01", address: "TA-107 Newyork", class: "03", dob: "03/05/2002", phone: "+123 5988569" },
  { name: "Floyd Miles", roll: "#01", address: "TA-107 Newyork", class: "03", dob: "03/05/2002", phone: "+123 5988569" },
];

const palette = ["bg-primary", "bg-brand-green", "bg-amber-500", "bg-rose-500", "bg-sky-500"];

function StudentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Students List"
        breadcrumb="Home / Students"
        actions={
          <Link
            to="/students"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Plus className="size-4" /> Add Students
          </Link>
        }
      />

      <div className="rounded-2xl bg-card border border-border shadow-sm">
        <div className="p-5 flex flex-wrap items-center justify-between gap-3 border-b border-border">
          <div className="font-semibold text-primary">Students Information</div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Search by name or roll" className="pl-9 pr-3 py-2 rounded-lg bg-secondary text-sm outline-none w-56" />
            </div>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm text-primary">
              <Calendar className="size-4" /> Last 30 days
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase">
              <tr className="border-b border-border">
                <th className="text-left py-3 px-5 font-medium w-10"><input type="checkbox" /></th>
                <th className="text-left py-3 px-2 font-medium">Students Name</th>
                <th className="text-left py-3 px-2 font-medium">Roll</th>
                <th className="text-left py-3 px-2 font-medium">Address</th>
                <th className="text-left py-3 px-2 font-medium">Class</th>
                <th className="text-left py-3 px-2 font-medium">Date of Birth</th>
                <th className="text-left py-3 px-2 font-medium">Phone</th>
                <th className="text-left py-3 px-5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={i} className="border-b border-border/60 hover:bg-secondary/50">
                  <td className="py-3 px-5"><input type="checkbox" /></td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-full grid place-items-center text-white text-xs font-semibold ${palette[i % palette.length]}`}>
                        {s.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{s.roll}</td>
                  <td className="py-3 px-2 text-muted-foreground">{s.address}</td>
                  <td className="py-3 px-2">{s.class}</td>
                  <td className="py-3 px-2 text-muted-foreground">{s.dob}</td>
                  <td className="py-3 px-2 text-muted-foreground">{s.phone}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <button className="size-8 grid place-items-center rounded-lg bg-secondary text-rose-500 hover:bg-rose-50"><Trash2 className="size-4" /></button>
                      <button className="size-8 grid place-items-center rounded-lg bg-secondary text-primary hover:bg-accent"><Pencil className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex items-center justify-center gap-2 text-sm">
          {[1, 2, 3, 4, 5].map((p) => (
            <button key={p} className={`size-8 rounded-lg ${p === 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"}`}>{p}</button>
          ))}
          <span className="text-muted-foreground">…</span>
          <button className="size-8 rounded-lg bg-secondary text-muted-foreground">100</button>
          <select className="ml-2 px-2 py-1.5 rounded-lg bg-secondary text-sm">
            <option>10 / page</option>
            <option>20 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}
