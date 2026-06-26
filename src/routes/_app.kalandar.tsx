import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/kalandar")({
  component: KalandarPage,
});

const TYPE_COLORS: Record<string, string> = {
  event: "bg-primary/15 text-primary border-primary/30",
  holiday: "bg-rose-100 text-rose-700 border-rose-300",
  exam: "bg-amber-100 text-amber-700 border-amber-300",
  meeting: "bg-brand-green/15 text-brand-green border-brand-green/30",
};

function KalandarPage() {
  const qc = useQueryClient();
  const [cursor, setCursor] = useState(new Date());
  const [open, setOpen] = useState<string | null>(null);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const { data: events = [] } = useQuery({
    queryKey: ["cal", year, month],
    queryFn: async () => {
      const from = new Date(year, month, 1).toISOString().slice(0,10);
      const to = new Date(year, month + 1, 0).toISOString().slice(0,10);
      return (await supabase.from("calendar_events").select("*").gte("event_date", from).lte("event_date", to)).data || [];
    },
  });

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
      <PageHeader title="Kalandarka Maamulka" breadcrumb="Dhacdooyinka iyo Fasaxyada" />
      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-primary text-xl">{cursor.toLocaleString("en", { month: "long" })} {year}</div>
          <div className="flex items-center gap-1">
            <button onClick={()=>setCursor(new Date(year, month-1, 1))} className="p-2 hover:bg-secondary rounded"><ChevronLeft className="size-4"/></button>
            <button onClick={()=>setCursor(new Date())} className="px-3 py-1 text-xs hover:bg-secondary rounded">Maanta</button>
            <button onClick={()=>setCursor(new Date(year, month+1, 1))} className="p-2 hover:bg-secondary rounded"><ChevronRight className="size-4"/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs font-medium text-muted-foreground mb-1">
          {["Axad","Isniin","Talaado","Arbaco","Khamiis","Jimce","Sabti"].map(d=><div key={d} className="px-2 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (!d) return <div key={i} className="aspect-square" />;
            const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const ev = byDate[dateStr] || [];
            return (
              <button key={i} onClick={()=>setOpen(dateStr)} className="aspect-square rounded-lg border border-border hover:border-primary p-1.5 text-left flex flex-col gap-1 overflow-hidden">
                <div className="text-xs font-semibold text-primary">{d}</div>
                <div className="space-y-0.5 overflow-hidden">
                  {ev.slice(0,2).map((e)=>(
                    <div key={e.id} className={`text-[9px] px-1 py-0.5 rounded border truncate ${TYPE_COLORS[e.event_type]||TYPE_COLORS.event}`}>{e.title}</div>
                  ))}
                  {ev.length>2 && <div className="text-[9px] text-muted-foreground">+{ev.length-2}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {open && <DayModal date={open} events={byDate[open]||[]} onClose={()=>setOpen(null)} onChange={()=>qc.invalidateQueries({queryKey:["cal",year,month]})} />}
    </div>
  );
}

function DayModal({ date, events, onClose, onChange }: { date: string; events: any[]; onClose: () => void; onChange: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", event_type: "event" });
  const add = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from("calendar_events").insert({ ...form, event_date: date });
    if (error) return toast.error(error.message);
    toast.success("Dhacdada waa la kaydiyay");
    setForm({ title: "", description: "", event_type: "event" });
    onChange();
  };
  const del = async (id: string) => {
    await supabase.from("calendar_events").delete().eq("id", id);
    toast.success("La tiray");
    onChange();
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-primary">{date}</div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded"><X className="size-4"/></button>
        </div>
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {events.length===0 && <div className="text-sm text-muted-foreground text-center py-4">Wax dhacdooyin ah ma jiraan.</div>}
          {events.map((e)=>(
            <div key={e.id} className={`p-3 rounded-lg border ${TYPE_COLORS[e.event_type]||TYPE_COLORS.event} flex items-start justify-between`}>
              <div>
                <div className="font-semibold text-sm">{e.title}</div>
                {e.description && <div className="text-xs opacity-80 mt-0.5">{e.description}</div>}
              </div>
              <button onClick={()=>del(e.id)} className="p-1 hover:bg-white/40 rounded"><Trash2 className="size-3.5"/></button>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-border pt-4">
          <input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} placeholder="Magaca dhacdada" className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none"/>
          <textarea value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} placeholder="Faahfaahin (ikhtiyaari)" rows={2} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none"/>
          <select value={form.event_type} onChange={(e)=>setForm({...form, event_type:e.target.value})} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm">
            <option value="event">Dhacdo</option><option value="holiday">Fasax</option><option value="exam">Imtixaan</option><option value="meeting">Shir</option>
          </select>
          <button onClick={add} className="w-full py-2 rounded-lg bg-brand-green text-white text-sm font-medium">+ Ku dar Dhacdo</button>
        </div>
      </div>
    </div>
  );
}