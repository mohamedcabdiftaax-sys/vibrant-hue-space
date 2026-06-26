import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Bus, Wallet, AlertTriangle, UserPlus, Receipt, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
        supabase.from("expenses").select("amount"),
        supabase.from("tuition_payments").select("id", { count: "exact", head: true }).eq("paid", false),
      ]);
      const expenseTotal = (expenses.data || []).reduce((s, r: any) => s + Number(r.amount || 0), 0);
      return {
        activeStudents: students.count || 0,
        busRiders: riders.count || 0,
        expenseTotal,
        unpaidCount: unpaid.count || 0,
      };
    },
  });
}

function Dashboard() {
  const { data } = useDashboardStats();
  const navigate = useNavigate();
  const stats = [
    { label: "Ardayda Firfircoon", value: data?.activeStudents ?? 0, icon: Users, tone: "bg-primary/10 text-primary" },
    { label: "Raacayaasha Bus-ka", value: data?.busRiders ?? 0, icon: Bus, tone: "bg-brand-green/15 text-brand-green" },
    { label: "Wadarta Kharashka", value: `$${(data?.expenseTotal ?? 0).toLocaleString()}`, icon: Wallet, tone: "bg-amber-100 text-amber-700" },
    { label: "Deyn / Resto", value: data?.unpaidCount ?? 0, icon: AlertTriangle, tone: "bg-rose-100 text-rose-700", warn: true },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard-ka Guud" breadcrumb="Bogga Hore / Guudmar" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 shadow-sm bg-card ${s.warn ? "border-rose-200" : "border-border"}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium">{s.label}</div>
                <div className={`text-2xl font-bold mt-1 ${s.warn ? "text-rose-700" : "text-primary"}`}>{s.value}</div>
              </div>
              <div className={`size-12 rounded-xl grid place-items-center ${s.tone}`}>
                <s.icon className="size-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-2xl bg-card border border-border p-6 shadow-sm">
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
          <div className="mt-6 p-4 rounded-xl bg-secondary">
            <div className="text-sm font-semibold text-primary">Salaan, Maamulkan!</div>
            <div className="text-xs text-muted-foreground mt-1">Halkan waxaad ka maamuli kartaa dhammaan ardayda, fasallada, iyo maaliyadda dugsigaaga.</div>
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