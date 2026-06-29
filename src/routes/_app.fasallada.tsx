import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession, useRoles } from "@/hooks/use-auth";
import { useState } from "react";
import { School, X, Save, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/fasallada")({
  component: FasalladaPage,
});

const DAYS = ["Sabti", "Axad", "Isniin", "Talaado", "Arbaco", "Khamiis"];
const PERIODS = [1, 2, 3, 4, 5, 6];

function FasalladaPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);
  const { user } = useAuthSession();
  const { primary } = useRoles(user?.id);
  const isMaamule = primary === "maamule";

  const { data: myStaff } = useQuery({
    queryKey: ["my-staff", user?.id],
    enabled: !!user?.id && !isMaamule,
    queryFn: async () => (await supabase.from("staff").select("full_name").eq("user_id", user!.id).maybeSingle()).data,
  });
  const myName = myStaff?.full_name;

  const { data: classrooms = [] } = useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const { data } = await supabase.from("classrooms").select("*").order("grade_level");
      return data || [];
    },
  });

  const { data: counts = {} } = useQuery({
    queryKey: ["grade-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("grade_level").eq("is_active", true);
      const m: Record<number, number> = {};
      (data || []).forEach((s: any) => { if (s.grade_level) m[s.grade_level] = (m[s.grade_level] || 0) + 1; });
      return m;
    },
  });

  const updateClassroom = async (grade: number, patch: any) => {
    const { error } = await supabase.from("classrooms").update(patch).eq("grade_level", grade);
    if (error) toast.error(error.message);
    else { toast.success("La cusbooneysiiyey"); qc.invalidateQueries({ queryKey: ["classrooms"] }); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maamulka Fasallada"
        breadcrumb={isMaamule ? "Fasallada 1–12 iyo Jadwalka Toddobaadlaha ah" : "Fasalkaaga iyo Jadwalkiisa"}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classrooms.map((c: any) => {
          const isMine = c.teacher_name && myName && c.teacher_name === myName;
          const canEdit = isMaamule || isMine;
          return (
            <div key={c.id} className="rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow-md transition relative">
              {!isMaamule && isMine && (
                <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-brand-green/15 text-brand-green font-medium">Fasalkaaga</span>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center"><School className="size-6"/></div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-green/15 text-brand-green">{counts[c.grade_level] || 0} arday</span>
              </div>
              <div className="font-bold text-primary text-lg">Fasalka {c.grade_level}</div>
              <div className="text-xs text-muted-foreground mt-1">Macalin: {c.teacher_name || "—"}</div>
              <div className="text-xs text-muted-foreground">Qolka: {c.room || "—"}</div>
              {canEdit ? (
                <div className="flex gap-2 mt-3">
                  <input defaultValue={c.teacher_name || ""} placeholder="Macalin" disabled={!isMaamule} onBlur={(e)=>e.target.value!==c.teacher_name&&updateClassroom(c.grade_level,{teacher_name:e.target.value})} className="flex-1 px-2 py-1 rounded bg-secondary text-xs outline-none focus:bg-card border border-transparent focus:border-primary disabled:opacity-60"/>
                  <input defaultValue={c.room || ""} placeholder="Qol" disabled={!isMaamule} onBlur={(e)=>e.target.value!==c.room&&updateClassroom(c.grade_level,{room:e.target.value})} className="w-20 px-2 py-1 rounded bg-secondary text-xs outline-none focus:bg-card border border-transparent focus:border-primary disabled:opacity-60"/>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground">
                  <Lock className="size-3"/> Akhris kaliya
                </div>
              )}
              {canEdit ? (
                <button onClick={()=>setSelected(c.grade_level)} className="mt-3 w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">Jadwalka Toddobaadka</button>
              ) : (
                <button onClick={()=>setSelected(c.grade_level)} className="mt-3 w-full py-2 rounded-lg border border-border text-xs font-medium hover:bg-secondary">Eeg Jadwalka</button>
              )}
            </div>
          );
        })}
      </div>

      {selected !== null && (
        <ScheduleEditor
          grade={selected}
          readOnly={!isMaamule && classrooms.find((c:any)=>c.grade_level===selected)?.teacher_name !== myName}
          onClose={()=>setSelected(null)}
        />
      )}
    </div>
  );
}

function ScheduleEditor({ grade, onClose, readOnly }: { grade: number; onClose: () => void; readOnly?: boolean }) {
  const qc = useQueryClient();
  const { data: schedules = [] } = useQuery({
    queryKey: ["schedule", grade],
    queryFn: async () => {
      const { data } = await supabase.from("class_schedules").select("*").eq("grade_level", grade);
      return data || [];
    },
  });
  const map: Record<string, any> = {};
  schedules.forEach((s: any) => { map[`${s.day_of_week}-${s.period}`] = s; });
  const [draft, setDraft] = useState<Record<string, { subject: string; teacher: string }>>({});

  const setCell = (d: number, p: number, k: "subject"|"teacher", v: string) =>
    setDraft((x) => ({ ...x, [`${d}-${p}`]: { ...(x[`${d}-${p}`] || { subject: map[`${d}-${p}`]?.subject || "", teacher: map[`${d}-${p}`]?.teacher || "" }), [k]: v }}));

  const save = async () => {
    const rows = Object.entries(draft).map(([k, v]) => {
      const [d, p] = k.split("-").map(Number);
      return { grade_level: grade, day_of_week: d, period: p, subject: v.subject || null, teacher: v.teacher || null };
    });
    if (rows.length === 0) return onClose();
    const { error } = await supabase.from("class_schedules").upsert(rows, { onConflict: "grade_level,day_of_week,period" });
    if (error) return toast.error(error.message);
    toast.success("Jadwalka waa la kaydiyay");
    qc.invalidateQueries({ queryKey: ["schedule", grade] });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} className="bg-card rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card">
          <div className="font-bold text-primary">Jadwalka Fasalka {grade}</div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded"><X className="size-4"/></button>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-primary/5 text-primary">
              <tr><th className="px-3 py-2 text-left">Maalinta</th>{PERIODS.map(p => <th key={p} className="px-3 py-2">Xilli {p}</th>)}</tr>
            </thead>
            <tbody>
              {DAYS.map((day, di) => (
                <tr key={day} className="border-b border-border/60">
                  <td className="px-3 py-2 font-medium text-primary">{day}</td>
                  {PERIODS.map((p) => {
                    const k = `${di}-${p}`;
                    const cur = draft[k] || { subject: map[k]?.subject || "", teacher: map[k]?.teacher || "" };
                    return (
                      <td key={p} className="px-1 py-1">
                        <input value={cur.subject} disabled={readOnly} onChange={(e)=>setCell(di,p,"subject",e.target.value)} placeholder="Maado" className="w-full px-2 py-1 rounded bg-secondary text-xs outline-none focus:bg-card border border-transparent focus:border-primary disabled:opacity-60"/>
                        <input value={cur.teacher} disabled={readOnly} onChange={(e)=>setCell(di,p,"teacher",e.target.value)} placeholder="Macalin" className="w-full mt-1 px-2 py-1 rounded bg-secondary text-[10px] text-muted-foreground outline-none focus:bg-card border border-transparent focus:border-primary disabled:opacity-60"/>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!readOnly && (
          <div className="px-6 py-4 border-t border-border flex justify-end sticky bottom-0 bg-card">
            <button onClick={save} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-green text-white font-medium text-sm"><Save className="size-4"/>Kaydi Jadwalka</button>
          </div>
        )}
      </div>
    </div>
  );
}