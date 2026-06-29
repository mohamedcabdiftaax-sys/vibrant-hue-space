import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Bus, Wallet, AlertTriangle, UserPlus, Receipt, ClipboardList, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [students, riders, expenses, unpaid] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("students").select("id", { count: "exact", head: true }).eq("uses_bus", true).eq("is_active", true),
        supabase.from("expenses").select("amount, expense_date"),
        supabase.from("tuition_payments").select("id", { count: "exact", head: true }).eq("paid", false),
      ]);
      const expenseTotal = (expenses.data || []).reduce((s, r: any) => s + Number(r.amount || 0), 0);

      const trendMap: Record<string, number> = {};
      (expenses.data || []).forEach((r: any) => {
        const m = (r.expense_date || "").slice(0, 7);
        if (!m) return;
        trendMap[m] = (trendMap[m] || 0) + Number(r.amount || 0);
      });
      const months: string[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toISOString().slice(0, 7));
      }
      const trend = months.map((m) => ({
        month: new Date(m + "-01").toLocaleString("en", { month: "short" }),
        kharash: trendMap[m] || 0,
      }));

      return {
        activeStudents: students.count || 0,
        busRiders: riders.count || 0,
        expenseTotal,
        unpaidCount: unpaid.count || 0,
        trend,
      };
    },
  });
}

function Dashboard() {
  const { data } = useDashboardStats();
  const navigate = useNavigate();
  const stats = [
    { label: "Ardayda Firfircoon", value: data?.activeStudents ?? 0, icon: Users, grad: "from-primary to-primary/70", border: "border-primary/20" },
    { label: "Raacayaasha Bus-ka", value: data?.busRiders ?? 0, icon: Bus, grad: "from-brand-green to-brand-green/70", border: "border-brand-green/20" },
    { label: "Wadarta Kharashka", value: `$${(data?.expenseTotal ?? 0).toLocaleString()}`, icon: Wallet, grad: "from-amber-500 to-amber-400", border: "border-amber-200" },
    { label: "Deyn / Resto", value: data?.unpaidCount ?? 0, icon: AlertTriangle, grad: "from-rose-500 to-rose-400", border: "border-rose-200", warn: true },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard-ka Guud" breadcrumb="Bogga Hore / Guudmar" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 shadow-sm bg-card hover:shadow-md transition relative overflow-hidden ${s.border}`}>
            <div className={`absolute -top-6 -right-6 size-24 rounded-full bg-gradient-to-br ${s.grad} opacity-[0.08]`} />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
                <div className={`text-2xl font-bold mt-1 ${s.warn ? "text-rose-700" : "text-primary"}`}>{s.value}</div>
              </div>
              <div className={`size-12 rounded-2xl grid place-items-center bg-gradient-to-br ${s.grad} shadow-sm`}>
                <s.icon className="size-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
            <div className="font-semibold text-primary mb-4 text-lg">Tallaabooyin Degdeg ah</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/ardayda" className="group rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 p-5 text-center transition">
                <UserPlus className="size-8 mx-auto text-primary mb-2" />
                <div className="font-semibold text-primary">+ Diiwaangeli Arday</div>
                <div className="text-xs text-muted-foreground mt-1">Arday cusub abuur</div>
              </Link>
              <Link to="/maaliyadda" className="group rounded-xl border-2 border-dashed border-brand-green/30 hover:border-brand-green hover:bg-brand-green/5 p-5 text-center transition">
                <Receipt className="size-8 mx-auto text-brand-green mb-2" />
                <div className="font-semibold text-brand-green">+ Log Expense</div>
                <div className="text-xs text-muted-foreground mt-1">Kharash cusub kaydi</div>
              </Link>
              <Link to="/imtixaanada" className="group rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 hover:bg-amber-50 p-5 text-center transition">
                <ClipboardList className="size-8 mx-auto text-amber-600 mb-2" />
                <div className="font-semibold text-amber-700">Imtixaan Cusub</div>
                <div className="text-xs text-muted-foreground mt-1">Buundooyin geli</div>
              </Link>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-secondary to-secondary/50">
              <div className="text-sm font-semibold text-primary">Salaan, Maamulkan!</div>
              <div className="text-xs text-muted-foreground mt-1">Halkan waxaad ka maamuli kartaa dhammaan ardayda, fasallada, iyo maaliyadda dugsigaaga.</div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="size-4 text-brand-green" />
              <div className="font-semibold text-primary text-lg">Kharashka 6 Bilood ee Dambe</div>
            </div>
            <div className="h-52 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.trend || []} margin={{ left: -20, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="kharashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-green)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--brand-green)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [`$${v}`, "Kharash"]} />
                  <Area type="monotone" dataKey="kharash" stroke="var(--brand-green)" fill="url(#kharashGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <CalendarWidget onNavigate={() => navigate({ to: "/kalandar" })} />
        </div>
      </div>
    </div>
  );
}

function CalendarWidget({ onNavigate }: { onNavigate: () => void }) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay();
    const result: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) result.push(null);
    for (let d = 1; d <= last.getDate(); d++) result.push(d);
    return result;
  }, [year, month]);

  const { data: events, refetch } = useQuery({
    queryKey: ["cal-events", year, month],
    queryFn: async () => {
      const from = new Date(year, month, 1).toISOString().slice(0, 10);
      const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
      const { data } = await supabase.from("calendar_events").select("*").gte("event_date", from).lte("event_date", to);
      return data || [];
    },
  });

  const eventDates = new Set((events || []).map((e: any) => e.event_date));

  const saveEvent = async () => {
    if (!selected || !title.trim()) return;
    const { error } = await supabase.from("calendar_events").insert({ event_date: selected, title: title.trim() });
    if (error) toast.error(error.message);
    else {
      toast.success("Dhacdada waa la kaydiyay");
      setTitle("");
      setSelected(null);
      refetch();
    }
  };

  const monthName = cursor.toLocaleString("en", { month: "long" });
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onNavigate} className="font-semibold text-primary text-sm hover:underline">Kalandarka</button>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-1 hover:bg-secondary rounded"><ChevronLeft className="size-4" /></button>
          <div className="text-sm font-semibold text-primary min-w-[110px] text-center">{monthName} {year}</div>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-1 hover:bg-secondary rounded"><ChevronRight className="size-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground text-center mb-1">
        {["Axd","Isn","Tal","Arb","Kha","Jim","Sab"].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const hasEvent = eventDates.has(dateStr);
          const isSel = selected === dateStr;
          return (
            <button
              key={i}
              onClick={() => setSelected(dateStr)}
              className={`aspect-square rounded-md text-xs font-medium transition relative ${isSel ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              {d}
              {hasEvent && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-brand-green" />}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-4 p-3 rounded-lg bg-secondary space-y-2">
          <div className="text-xs font-medium text-primary">Ku dar dhacdo: {selected}</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Magaca dhacdada..."
            className="w-full px-3 py-1.5 rounded-md bg-card border border-border text-sm outline-none focus:border-primary"
          />
          <button onClick={saveEvent} className="w-full py-1.5 rounded-md bg-brand-green text-white text-sm font-medium hover:opacity-90">Kaydi</button>
        </div>
      )}
    </div>
  );
}