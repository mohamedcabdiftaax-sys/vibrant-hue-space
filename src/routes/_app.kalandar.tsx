import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Trash2, CheckSquare, Square, ListTodo, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useAuthSession, useRoles } from "@/hooks/use-auth";

export const Route = createFileRoute("/_app/kalandar")({
  component: KalandarPage,
});

const TYPE_COLORS: Record<string, string> = {
  event: "bg-primary/15 text-primary border-primary/30",
  holiday: "bg-rose-100 text-rose-700 border-rose-300",
  exam: "bg-amber-100 text-amber-700 border-amber-300",
  meeting: "bg-brand-green/15 text-brand-green border-brand-green/30",
};
const KIND_COLORS: Record<string, string> = {
  event: "bg-primary/15 text-primary border-primary/30",
  todo: "bg-violet-100 text-violet-700 border-violet-300",
  appointment: "bg-sky-100 text-sky-700 border-sky-300",
};
const KIND_LABELS: Record<string, string> = {
  event: "Dhacdo",
  todo: "Hawl (To-Do)",
  appointment: "Ballan",
};

function badgeClass(e: any) {
  if (e.item_kind === "todo") return KIND_COLORS.todo;
  if (e.item_kind === "appointment") return KIND_COLORS.appointment;
  return TYPE_COLORS[e.event_type] || TYPE_COLORS.event;
}

function KalandarPage() {
  const qc = useQueryClient();
  const [cursor, setCursor] = useState(new Date());
  const [open, setOpen] = useState<string | null>(null);
  const { user } = useAuthSession();
  const { primary } = useRoles(user?.id);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["cal", year, month] });
    qc.invalidateQueries({ queryKey: ["cal-upcoming"] });
  };

  const { data: events = [] } = useQuery({
    queryKey: ["cal", year, month],
    queryFn: async () => {
      const from = new Date(year, month, 1).toISOString().slice(0, 10);
      const to = new Date(year, month + 1, 0).toISOString().slice(0, 10);
      return (await supabase.from("calendar_events").select("*").gte("event_date", from).lte("event_date", to)).data || [];
    },
  });

  const { data: upcoming = [] } = useQuery({
    queryKey: ["cal-upcoming"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      return (
        await supabase
          .from("calendar_events")
          .select("*")
          .in("item_kind", ["todo", "appointment"])
          .gte("event_date", today)
          .order("event_date")
          .limit(15)
      ).data || [];
    },
  });

  const toggleDone = async (e: any) => {
    const { error } = await supabase.from("calendar_events").update({ completed: !e.completed }).eq("id", e.id);
    if (error) return toast.error(error.message);
    refreshAll();
  };

  const days = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const arr: (number | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push(d);
    return arr;
  }, [year, month]);

  const byDate: Record<string, any[]> = {};
  (events as any[]).forEach((e) => { (byDate[e.event_date] ||= []).push(e); });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalandarka Maamulka"
        breadcrumb={primary === "maamule" ? "Dhacdooyinka guud, Hawlaha (To-Do) iyo Balamaha qof kasta" : "Dhacdooyinka guud iyo hawlahaaga/balamahaaga gaarka ah"}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-primary text-xl">{cursor.toLocaleString("en", { month: "long" })} {year}</div>
            <div className="flex items-center gap-1">
              <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2 hover:bg-secondary rounded"><ChevronLeft className="size-4" /></button>
              <button onClick={() => setCursor(new Date())} className="px-3 py-1 text-xs hover:bg-secondary rounded">Maanta</button>
              <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2 hover:bg-secondary rounded"><ChevronRight className="size-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs font-medium text-muted-foreground mb-1">
            {["Axad", "Isniin", "Talaado", "Arbaco", "Khamiis", "Jimce", "Sabti"].map((d) => <div key={d} className="px-2 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <div key={i} className="aspect-square" />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              const ev = byDate[dateStr] || [];
              return (
                <button key={i} onClick={() => setOpen(dateStr)} className="aspect-square rounded-lg border border-border hover:border-primary p-1.5 text-left flex flex-col gap-1 overflow-hidden">
                  <div className="text-xs font-semibold text-primary">{d}</div>
                  <div className="space-y-0.5 overflow-hidden">
                    {ev.slice(0, 2).map((e) => (
                      <div key={e.id} className={`text-[9px] px-1 py-0.5 rounded border truncate ${badgeClass(e)} ${e.completed ? "line-through opacity-60" : ""}`}>{e.title}</div>
                    ))}
                    {ev.length > 2 && <div className="text-[9px] text-muted-foreground">+{ev.length - 2}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="size-4 text-primary" />
            <div className="font-semibold text-primary text-lg">Hawlaha & Balamaha Soo Socda</div>
          </div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto">
            {upcoming.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">Wax hawlo ama balamo soo socda lama qorin.</div>
            )}
            {(upcoming as any[]).map((e) => (
              <div key={e.id} className={`p-3 rounded-lg border ${badgeClass(e)} flex items-start gap-2 ${e.completed ? "opacity-50" : ""}`}>
                {e.item_kind === "todo" ? (
                  <button onClick={() => toggleDone(e)} className="mt-0.5 shrink-0">
                    {e.completed ? <CheckSquare className="size-4" /> : <Square className="size-4" />}
                  </button>
                ) : (
                  <CalendarClock className="size-4 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className={`text-sm font-medium ${e.completed ? "line-through" : ""}`}>{e.title}</div>
                  <div className="text-[11px] opacity-70 mt-0.5">
                    {e.event_date}{e.start_time ? ` · ${e.start_time}` : ""} · {KIND_LABELS[e.item_kind]}
                  </div>
                  {e.location && <div className="text-[11px] opacity-70">📍 {e.location}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {open && (
        <DayModal
          date={open}
          events={byDate[open] || []}
          onClose={() => setOpen(null)}
          onChange={refreshAll}
        />
      )}
    </div>
  );
}

function DayModal({ date, events, onClose, onChange }: { date: string; events: any[]; onClose: () => void; onChange: () => void }) {
  const { user } = useAuthSession();
  const [form, setForm] = useState({ title: "", description: "", item_kind: "event", event_type: "event", start_time: "", location: "" });
  const isTodo = form.item_kind === "todo";
  const isAppt = form.item_kind === "appointment";

  const add = async () => {
    if (!form.title.trim()) return;
    const row: any = {
      title: form.title,
      description: form.description || null,
      event_date: date,
      item_kind: form.item_kind,
      event_type: form.item_kind === "event" ? form.event_type : "event",
      start_time: form.start_time || null,
      location: form.location || null,
      created_by: user?.id || null,
    };
    const { error } = await supabase.from("calendar_events").insert(row);
    if (error) return toast.error(error.message);
    toast.success("Waa la kaydiyay");
    setForm({ title: "", description: "", item_kind: "event", event_type: "event", start_time: "", location: "" });
    onChange();
  };
  const del = async (id: string) => {
    await supabase.from("calendar_events").delete().eq("id", id);
    toast.success("La tiray");
    onChange();
  };
  const toggleDone = async (e: any) => {
    await supabase.from("calendar_events").update({ completed: !e.completed }).eq("id", e.id);
    onChange();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-primary">{date}</div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded"><X className="size-4" /></button>
        </div>
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {events.length === 0 && <div className="text-sm text-muted-foreground text-center py-4">Wax dhacdooyin ah ma jiraan.</div>}
          {events.map((e) => (
            <div key={e.id} className={`p-3 rounded-lg border ${badgeClass(e)} flex items-start justify-between ${e.completed ? "opacity-50" : ""}`}>
              <div className="flex items-start gap-2 min-w-0">
                {e.item_kind === "todo" && (
                  <button onClick={() => toggleDone(e)} className="mt-0.5 shrink-0">
                    {e.completed ? <CheckSquare className="size-3.5" /> : <Square className="size-3.5" />}
                  </button>
                )}
                <div className="min-w-0">
                  <div className={`font-semibold text-sm ${e.completed ? "line-through" : ""}`}>{e.title}</div>
                  {e.description && <div className="text-xs opacity-80 mt-0.5">{e.description}</div>}
                  {e.location && <div className="text-xs opacity-70">📍 {e.location}</div>}
                  <div className="text-[10px] opacity-60 mt-0.5">{KIND_LABELS[e.item_kind] || e.item_kind}{e.start_time ? ` · ${e.start_time}` : ""}</div>
                </div>
              </div>
              <button onClick={() => del(e.id)} className="p-1 hover:bg-white/40 rounded shrink-0"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-border pt-4">
          <select value={form.item_kind} onChange={(e) => setForm({ ...form, item_kind: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm">
            <option value="event">Dhacdo</option>
            <option value="todo">Hawl (To-Do)</option>
            <option value="appointment">Ballan</option>
          </select>
          {form.item_kind === "event" && (
            <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm">
              <option value="event">Dhacdo Guud</option>
              <option value="holiday">Fasax</option>
              <option value="exam">Imtixaan</option>
              <option value="meeting">Shir</option>
            </select>
          )}
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={isTodo ? "Magaca hawasha" : isAppt ? "Magaca ballanka" : "Magaca dhacdada"} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
          {isAppt && (
            <div className="grid grid-cols-2 gap-2">
              <input value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} placeholder="Saacadda (e.g. 10:00)" className="px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Goobta" className="px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
            </div>
          )}
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Faahfaahin (ikhtiyaari)" rows={2} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
          <button onClick={add} className="w-full py-2 rounded-lg bg-brand-green text-white text-sm font-medium">+ Ku dar</button>
        </div>
      </div>
    </div>
  );
}
