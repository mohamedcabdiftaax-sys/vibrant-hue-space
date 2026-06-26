import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { UserCheck, UserX, Wallet, AlertTriangle, Clock } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard – ia Academy" },
      { name: "description", content: "Manage students, teachers, exams and finances from one place." },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Joog (Present)", value: "1,284", sub: "Maanta", icon: UserCheck, color: "bg-brand-green/15 text-brand-green" },
  { label: "Maqan (Absent)", value: "96", sub: "Maanta", icon: UserX, color: "bg-rose-100 text-rose-600" },
  { label: "Lacag La Bixiyay", value: "$12,450", sub: "Bishan", icon: Wallet, color: "bg-primary/10 text-primary" },
  { label: "Deyn Ardayda", value: "$3,820", sub: "24 arday", icon: AlertTriangle, color: "bg-amber-100 text-amber-600" },
];

const attendanceRows = [
  { name: "Eleanor Pena", class: "01", status: "Joog", time: "07:42" },
  { name: "Jessia Rose", class: "02", status: "Joog", time: "07:51" },
  { name: "Janny Wilson", class: "02", status: "Daahay", time: "08:22" },
  { name: "Guy Hawkins", class: "02", status: "Maqan", time: "—" },
  { name: "Jacob Jones", class: "04", status: "Joog", time: "07:35" },
  { name: "Floyd Miles", class: "03", status: "Maqan", time: "—" },
];

const payments = [
  { name: "Eleanor Pena", class: "01", amount: 120, status: "La bixiyay" },
  { name: "Jessia Rose", class: "02", amount: 120, status: "La bixiyay" },
  { name: "Janny Wilson", class: "02", amount: 120, status: "Deyn" },
  { name: "Jacob Jones", class: "04", amount: 150, status: "Qayb" },
  { name: "Floyd Miles", class: "03", amount: 120, status: "Deyn" },
];

const complaints = [
  { name: "Guy Hawkins", title: "Buug la waayey", note: "Maktabada lagama helin buugga xisaabta.", time: "10 daqiiqo" },
  { name: "Jessia Rose", title: "Macalin daahay", note: "Casharka 3aad wuxuu daahay 20 daqiiqo.", time: "Saakay" },
  { name: "Eleanor Pena", title: "Cunto xun", note: "Quraacda maanta cabasho leh.", time: "Shalay" },
];

const updates = [
  { title: "Liiska natiijada imtixaanka la daabacay", time: "2 daqiiqo ka hor" },
  { title: "Arday cusub oo la diiwaan geliyay – Liam Carter", time: "25 daqiiqo ka hor" },
  { title: "Macalin Asha lacagta mushaharka la siiyay", time: "Saakay 09:12" },
  { title: "Fasalka 4-aad routine cusub", time: "Shalay" },
];

const statusTone: Record<string, string> = {
  Joog: "bg-brand-green/10 text-brand-green",
  Maqan: "bg-rose-100 text-rose-600",
  Daahay: "bg-amber-100 text-amber-600",
  "La bixiyay": "bg-brand-green/10 text-brand-green",
  Deyn: "bg-rose-100 text-rose-600",
  Qayb: "bg-amber-100 text-amber-600",
};

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" breadcrumb="Home / Guudmar" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border border-border p-5 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-bold text-primary mt-1">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>
            </div>
            <div className={`size-12 rounded-xl grid place-items-center ${s.color}`}>
              <s.icon className="size-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-primary">Xaalada Maqnaashaha Ardayda</div>
              <div className="text-xs text-muted-foreground">Diiwaanka maanta</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground uppercase">
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Magaca</th>
                  <th className="text-left py-2 font-medium">Fasalka</th>
                  <th className="text-left py-2 font-medium">Xaalada</th>
                  <th className="text-left py-2 font-medium">Saac</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.map((r) => (
                  <tr key={r.name} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium">{r.name}</td>
                    <td className="py-3 text-muted-foreground">{r.class}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusTone[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="py-3 text-muted-foreground">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-primary">Cabashooyinka Ardayda</div>
            <span className="text-xs text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">{complaints.length} cusub</span>
          </div>
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.title} className="p-3 rounded-xl bg-secondary">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold text-primary">{c.title}</div>
                  <div className="text-[11px] text-muted-foreground whitespace-nowrap">{c.time}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{c.note}</div>
                <div className="text-[11px] text-primary mt-1">— {c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4">Lacagaha Ardayda</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground uppercase">
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Ardayga</th>
                  <th className="text-left py-2 font-medium">Fasalka</th>
                  <th className="text-left py-2 font-medium">Qiimaha</th>
                  <th className="text-left py-2 font-medium">Xaalada</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.name} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium">{p.name}</td>
                    <td className="py-3 text-muted-foreground">{p.class}</td>
                    <td className="py-3">${p.amount}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusTone[p.status]}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4">Wax Cusub ee Bogga</div>
          <div className="space-y-3">
            {updates.map((u) => (
              <div key={u.title} className="flex items-start gap-3 p-3 rounded-xl bg-secondary">
                <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <Clock className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary">{u.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{u.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
