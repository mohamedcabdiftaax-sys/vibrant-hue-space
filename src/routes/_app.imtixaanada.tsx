import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Save, Printer, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/imtixaanada")({
  component: ImtixaanadaPage,
});

const SUBJECTS = ["Afsoomaali", "Carabi", "Ingiriis", "Xisaab", "Sayniska", "Taariikhda", "Juquraafi", "Diin"];

function ImtixaanadaPage() {
  const [tab, setTab] = useState<"scores" | "weekly">("scores");
  return (
    <div className="space-y-6">
      <PageHeader title="Imtixaanada & Exams" breadcrumb="Buundooyinka iyo Warbixinta Toddobaadlaha ah" />
      <div className="inline-flex p-1 bg-secondary rounded-lg">
        <button onClick={() => setTab("scores")} className={`px-4 py-1.5 rounded-md text-sm font-medium ${tab === "scores" ? "bg-primary text-primary-foreground" : ""}`}>Buundooyin</button>
        <button onClick={() => setTab("weekly")} className={`px-4 py-1.5 rounded-md text-sm font-medium ${tab === "weekly" ? "bg-primary text-primary-foreground" : ""}`}>Warbixinta Toddobaadka</button>
      </div>
      {tab === "scores" ? <ScoresTab /> : <WeeklyTab />}
    </div>
  );
}

function ScoresTab() {
  const qc = useQueryClient();
  const [grade, setGrade] = useState(1);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [examName, setExamName] = useState("Imtixaanka Toddobaadka");
  const [draft, setDraft] = useState<Record<string, string>>({});

  const { data: students = [] } = useQuery({
    queryKey: ["scores-students", grade],
    queryFn: async () => (await supabase.from("students").select("id, full_name").eq("is_active", true).eq("grade_level", grade).order("full_name")).data || [],
  });

  const saveAll = async () => {
    const rows = Object.entries(draft).filter(([, v]) => v !== "").map(([sid, v]) => ({
      student_id: sid, grade_level: grade, subject, exam_name: examName, score: Number(v), max_score: 100,
    }));
    if (rows.length === 0) return toast.error("Wax buundooyin ah lama gelin");
    const { error } = await supabase.from("exam_scores").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`${rows.length} buundo waa la kaydiyay`);
    setDraft({});
    qc.invalidateQueries({ queryKey: ["weekly-data"] });
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap gap-3">
        <select value={grade} onChange={(e)=>setGrade(Number(e.target.value))} className="px-3 py-2 rounded-lg bg-secondary text-sm">
          {Array.from({length:12},(_,i)=>i+1).map(g=><option key={g} value={g}>Fasalka {g}</option>)}
        </select>
        <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary text-sm">
          {SUBJECTS.map(s=><option key={s}>{s}</option>)}
        </select>
        <input value={examName} onChange={(e)=>setExamName(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm outline-none" placeholder="Magaca Imtixaanka"/>
        <button onClick={saveAll} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium"><Save className="size-4"/>Kaydi Dhammaan</button>
      </div>
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground uppercase border-b border-border">
          <tr><th className="text-left py-2">Magaca</th><th className="text-left py-2">Buundo (/100)</th></tr>
        </thead>
        <tbody>
          {(students as any[]).length===0 && <tr><td colSpan={2} className="py-6 text-center text-muted-foreground">Wax arday ah ma jiraan fasalkan.</td></tr>}
          {(students as any[]).map((s)=>(
            <tr key={s.id} className="border-b border-border/60">
              <td className="py-2 font-medium text-primary">{s.full_name}</td>
              <td className="py-2 w-40"><input type="number" min={0} max={100} value={draft[s.id]||""} onChange={(e)=>setDraft({...draft,[s.id]:e.target.value})} className="w-32 px-2 py-1 rounded bg-secondary text-sm outline-none focus:bg-card border border-transparent focus:border-primary"/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WeeklyTab() {
  const qc = useQueryClient();
  const [grade, setGrade] = useState(1);
  const { data: students = [] } = useQuery({
    queryKey: ["weekly-students", grade],
    queryFn: async () => (await supabase.from("students").select("id, full_name").eq("is_active", true).eq("grade_level", grade).order("full_name")).data || [],
  });
  const { data: scores = [] } = useQuery({
    queryKey: ["weekly-scores", grade],
    queryFn: async () => (await supabase.from("exam_scores").select("*").eq("grade_level", grade).order("exam_date", { ascending: false })).data || [],
  });
  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => (await supabase.from("incidents").select("*, students(full_name)").order("incident_date", { ascending: false })).data || [],
  });

  const [inc, setInc] = useState({ student_id: "", description: "", fine_amount: 0 });
  const addIncident = async () => {
    if (!inc.student_id || !inc.description) return toast.error("Buuxi dhammaan goobaha");
    const { error } = await supabase.from("incidents").insert(inc);
    if (error) return toast.error(error.message);
    toast.success("Dacwadda waa la diiwaangaliyay");
    setInc({ student_id: "", description: "", fine_amount: 0 });
    qc.invalidateQueries({ queryKey: ["incidents"] });
  };

  const latestByStudent: Record<string, any> = {};
  (scores as any[]).forEach((s) => { if (!latestByStudent[s.student_id]) latestByStudent[s.student_id] = s; });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-primary text-lg">Warbixinta Toddobaadlaha ah</div>
          <div className="flex gap-2">
            <select value={grade} onChange={(e)=>setGrade(Number(e.target.value))} className="px-3 py-2 rounded-lg bg-secondary text-sm">
              {Array.from({length:12},(_,i)=>i+1).map(g=><option key={g} value={g}>Fasalka {g}</option>)}
            </select>
            <button onClick={()=>window.print()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm"><Printer className="size-4"/>Daabac</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase border-b border-border">
            <tr><th className="text-left py-2">Magaca</th><th className="text-left py-2">Joogitaan</th><th className="text-left py-2">Maaddo</th><th className="text-left py-2">Buundo</th><th className="text-left py-2">Taariikh</th></tr>
          </thead>
          <tbody>
            {(students as any[]).map((s) => {
              const last = latestByStudent[s.id];
              return (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="py-2 font-medium text-primary">{s.full_name}</td>
                  <td className="py-2"><span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-green/15 text-brand-green">Joogo</span></td>
                  <td className="py-2 text-muted-foreground">{last?.subject || "—"}</td>
                  <td className="py-2 font-semibold text-primary">{last?.score ?? "—"}{last && `/${last.max_score}`}</td>
                  <td className="py-2 text-muted-foreground text-xs">{last?.exam_date || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
        <div className="font-semibold text-primary mb-3">Qaybta Anshaxa / Dacwada</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
          <select value={inc.student_id} onChange={(e)=>setInc({...inc, student_id:e.target.value})} className="px-3 py-2 rounded-lg bg-secondary text-sm">
            <option value="">— Dooro Arday —</option>
            {(students as any[]).map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
          <input value={inc.description} onChange={(e)=>setInc({...inc, description:e.target.value})} placeholder="Faahfaahin" className="md:col-span-2 px-3 py-2 rounded-lg bg-secondary text-sm outline-none"/>
          <div className="flex gap-2">
            <input type="number" value={inc.fine_amount} onChange={(e)=>setInc({...inc, fine_amount:Number(e.target.value)})} placeholder="Ganaax" className="flex-1 px-3 py-2 rounded-lg bg-secondary text-sm outline-none"/>
            <button onClick={addIncident} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"><Plus className="size-4"/></button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase border-b border-border">
            <tr><th className="text-left py-2">Taariikh</th><th className="text-left py-2">Arday</th><th className="text-left py-2">Faahfaahin</th><th className="text-left py-2">Ganaax</th></tr>
          </thead>
          <tbody>
            {(incidents as any[]).length===0 && <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Wax dacwooyin ah ma jiraan.</td></tr>}
            {(incidents as any[]).map((i)=>(
              <tr key={i.id} className="border-b border-border/60">
                <td className="py-2 text-muted-foreground">{i.incident_date}</td>
                <td className="py-2 font-medium text-primary">{i.students?.full_name || "—"}</td>
                <td className="py-2">{i.description}</td>
                <td className="py-2 text-rose-600 font-semibold">${i.fine_amount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-8 pt-6 border-t border-border flex justify-end">
          <div className="text-center">
            <div className="border-t-2 border-primary w-64 mb-1"></div>
            <div className="text-xs text-muted-foreground">Saxiixa Maamulaha</div>
          </div>
        </div>
      </div>
    </div>
  );
}