import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard-layout";
import { Plus, Search, Calendar, Trash2, Pencil, X, Check } from "lucide-react";

export const Route = createFileRoute("/_app/students")({
  head: () => ({
    meta: [
      { title: "Students – ia Academy" },
      { name: "description", content: "View, add and manage student records." },
    ],
  }),
  component: StudentsPage,
});

type Student = {
  id: number;
  name: string;
  roll: string;
  address: string;
  class: string;
  dob: string;
  phone: string;
  createdAt: string; // ISO
};

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};

const initialStudents: Student[] = [
  { id: 1, name: "Eleanor Pena", roll: "#01", address: "TA-107 Newyork", class: "01", dob: "03/05/2001", phone: "+123 5988567", createdAt: daysAgo(2) },
  { id: 2, name: "Jessia Rose", roll: "#10", address: "TA-107 Newyork", class: "02", dob: "03/04/2000", phone: "+123 5988569", createdAt: daysAgo(10) },
  { id: 3, name: "Janny Wilson", roll: "#04", address: "Australia, Sydney", class: "02", dob: "12/05/2001", phone: "+123 7988568", createdAt: daysAgo(20) },
  { id: 4, name: "Guy Hawkins", roll: "#03", address: "TA-107 Newyork", class: "02", dob: "03/05/2001", phone: "+123 5988568", createdAt: daysAgo(45) },
  { id: 5, name: "Jacob Jones", roll: "#15", address: "Australia, Sydney", class: "04", dob: "12/05/2001", phone: "+123 5988568", createdAt: daysAgo(80) },
  { id: 6, name: "Jane Cooper", roll: "#01", address: "Australia, Sydney", class: "02", dob: "12/03/2001", phone: "+123 5988569", createdAt: daysAgo(120) },
  { id: 7, name: "Floyd Miles", roll: "#01", address: "TA-107 Newyork", class: "03", dob: "03/05/2002", phone: "+123 5988569", createdAt: daysAgo(200) },
  { id: 8, name: "Liam Carter", roll: "#22", address: "London, UK", class: "05", dob: "08/11/2003", phone: "+44 7911 123456", createdAt: daysAgo(400) },
];

const palette = ["bg-primary", "bg-brand-green", "bg-amber-500", "bg-rose-500", "bg-sky-500"];

type RangeKey = "30d" | "month" | "year" | "all" | "custom";

const RANGE_LABEL: Record<RangeKey, string> = {
  "30d": "Last 30 days",
  month: "Last month",
  year: "Last year",
  all: "All time",
  custom: "Custom",
};

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<RangeKey>("30d");
  const [showRange, setShowRange] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [editing, setEditing] = useState<Student | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let from: Date | null = null;
    let to: Date | null = null;
    const now = new Date();
    if (range === "30d") { from = new Date(now); from.setDate(now.getDate() - 30); }
    else if (range === "month") { from = new Date(now); from.setMonth(now.getMonth() - 1); }
    else if (range === "year") { from = new Date(now); from.setFullYear(now.getFullYear() - 1); }
    else if (range === "custom") {
      if (customFrom) from = new Date(customFrom);
      if (customTo) to = new Date(customTo);
    }
    return students.filter((s) => {
      if (q) {
        const hay = `${s.name} ${s.roll} ${s.address} ${s.class} ${s.phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const d = new Date(s.createdAt);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [students, query, range, customFrom, customTo]);

  const rangeLabel = range === "custom" && (customFrom || customTo)
    ? `${customFrom || "…"} → ${customTo || "…"}`
    : RANGE_LABEL[range];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students List"
        breadcrumb="Home / Students"
        actions={
          <button
            onClick={() => setEditing({ id: 0, name: "", roll: "", address: "", class: "", dob: "", phone: "", createdAt: iso(new Date()) })}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Plus className="size-4" /> Add Student
          </button>
        }
      />

      <div className="rounded-2xl bg-card border border-border shadow-sm">
        <div className="p-5 flex flex-wrap items-center justify-between gap-3 border-b border-border">
          <div className="font-semibold text-primary">Students Information <span className="text-xs text-muted-foreground font-normal">({filtered.length})</span></div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, roll, phone…"
                className="pl-9 pr-3 py-2 rounded-lg bg-secondary text-sm outline-none w-64 focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowRange((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm text-primary"
              >
                <Calendar className="size-4" /> {rangeLabel}
              </button>
              {showRange && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowRange(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-card border border-border shadow-lg z-20 p-2">
                    {(["30d", "month", "year", "all", "custom"] as RangeKey[]).map((k) => (
                      <button
                        key={k}
                        onClick={() => { setRange(k); if (k !== "custom") setShowRange(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary ${range === k ? "bg-primary/10 text-primary font-medium" : ""}`}
                      >
                        {RANGE_LABEL[k]}
                      </button>
                    ))}
                    {range === "custom" && (
                      <div className="p-2 border-t border-border mt-1 space-y-2">
                        <label className="block text-xs text-muted-foreground">From
                          <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="mt-1 w-full px-2 py-1.5 rounded-lg bg-secondary text-sm outline-none" />
                        </label>
                        <label className="block text-xs text-muted-foreground">To
                          <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="mt-1 w-full px-2 py-1.5 rounded-lg bg-secondary text-sm outline-none" />
                        </label>
                        <button onClick={() => setShowRange(false)} className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-sm">Apply</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
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
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">Wax arday ah lama helin.</td></tr>
              )}
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-b border-border/60 hover:bg-secondary/50">
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
                      <button onClick={() => setConfirmDelete(s)} className="size-8 grid place-items-center rounded-lg bg-secondary text-rose-500 hover:bg-rose-50"><Trash2 className="size-4" /></button>
                      <button onClick={() => setEditing(s)} className="size-8 grid place-items-center rounded-lg bg-secondary text-primary hover:bg-accent"><Pencil className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <StudentDialog
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(s) => {
            setStudents((list) => {
              if (s.id === 0) {
                const id = Math.max(0, ...list.map((x) => x.id)) + 1;
                return [{ ...s, id }, ...list];
              }
              return list.map((x) => (x.id === s.id ? s : x));
            });
            setEditing(null);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Tirtir ardayga?"
          message={`Ma hubtaa inaad tirtirayso ${confirmDelete.name}? Tani lama soo celin karo.`}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            setStudents((list) => list.filter((x) => x.id !== confirmDelete.id));
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}

function StudentDialog({ initial, onClose, onSave }: { initial: Student; onClose: () => void; onSave: (s: Student) => void }) {
  const [form, setForm] = useState<Student>(initial);
  const isNew = initial.id === 0;
  const set = <K extends keyof Student>(k: K, v: Student[K]) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="font-semibold text-primary">{isNew ? "Add Student" : "Edit Student"}</div>
          <button onClick={onClose} className="size-8 grid place-items-center rounded-lg hover:bg-secondary"><X className="size-4" /></button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); if (!form.name.trim()) return; onSave(form); }}
          className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {([
            ["name", "Magaca", "text"],
            ["roll", "Roll", "text"],
            ["class", "Fasalka", "text"],
            ["dob", "Date of Birth", "text"],
            ["phone", "Phone", "text"],
            ["address", "Address", "text"],
          ] as const).map(([key, label, type]) => (
            <label key={key} className={`text-xs text-muted-foreground ${key === "address" ? "sm:col-span-2" : ""}`}>
              {label}
              <input
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
              />
            </label>
          ))}
          <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-secondary text-sm">Cancel</button>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
              <Check className="size-4" /> {isNew ? "Add" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onCancel, onConfirm }: { title: string; message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onCancel}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm border border-border p-5" onClick={(e) => e.stopPropagation()}>
        <div className="font-semibold text-primary">{title}</div>
        <div className="text-sm text-muted-foreground mt-2">{message}</div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-secondary text-sm">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600">Delete</button>
        </div>
      </div>
    </div>
  );
}
