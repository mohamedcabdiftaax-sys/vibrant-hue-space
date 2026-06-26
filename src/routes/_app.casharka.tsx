import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/casharka")({
  component: CasharkaPage,
});

const ARABIC = { fontFamily: "Amiri, serif" } as const;

function CasharkaPage() {
  const [tab, setTab] = useState<"quran" | "farbar">("quran");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [grade, setGrade] = useState<string>("all");

  const { data: students = [] } = useQuery({
    queryKey: ["quran-students", grade],
    queryFn: async () => {
      let q = supabase.from("students").select("id, full_name, grade_level").eq("is_active", true).eq("program_quran", true).order("full_name");
      if (grade !== "all") q = q.eq("grade_level", Number(grade));
      const { data } = await q;
      return data || [];
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Cashar-Raaca Dugsiga" breadcrumb="Qur'aan & Farbar — Diiwaanka Maalinlaha ah" />
      <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="inline-flex p-1 bg-secondary rounded-lg">
            <button onClick={() => setTab("quran")} className={`px-4 py-1.5 rounded-md text-sm font-medium ${tab==="quran"?"bg-primary text-primary-foreground":""}`}>Qur'aan</button>
            <button onClick={() => setTab("farbar")} className={`px-4 py-1.5 rounded-md text-sm font-medium ${tab==="farbar"?"bg-primary text-primary-foreground":""}`}>Farbar</button>
          </div>
          <div className="flex gap-2 items-center">
            <select value={grade} onChange={(e)=>setGrade(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary text-sm">
              <option value="all">Dhammaan Fasallada</option>
              {Array.from({length:12},(_,i)=>i+1).map(g=><option key={g} value={g}>Fasalka {g}</option>)}
            </select>
            <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary text-sm"/>
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-10 text-center text-muted-foreground">
          Wax ardayda Qur'aan ah lagama helin. Tag bogga "Maamulka Ardayda" si aad ugu darto barnaamijka Qur'aan.
        </div>
      ) : tab === "quran" ? (
        <QuranTable students={students as any} date={date} />
      ) : (
        <FarbarTable students={students as any} date={date} />
      )}
    </div>
  );
}

type Stu = { id: string; full_name: string; grade_level: number | null };

function QuranTable({ students, date }: { students: Stu[]; date: string }) {
  const qc = useQueryClient();
  const { data: records = [] } = useQuery({
    queryKey: ["quran-records", date],
    queryFn: async () => {
      const { data } = await supabase.from("quran_records").select("*").eq("record_date", date);
      return data || [];
    },
  });
  const byStudent = useMemo(() => {
    const m: Record<string, any> = {};
    records.forEach((r: any) => { m[r.student_id] = r; });
    return m;
  }, [records]);

  const [draft, setDraft] = useState<Record<string, any>>({});
  const getVal = (sid: string, k: string) => draft[sid]?.[k] ?? byStudent[sid]?.[k] ?? "";
  const setVal = (sid: string, k: string, v: any) =>
    setDraft((d) => ({ ...d, [sid]: { ...(d[sid] || {}), [k]: v } }));

  const saveRow = async (sid: string) => {
    const merged = { ...(byStudent[sid] || {}), ...(draft[sid] || {}), student_id: sid, record_date: date };
    delete (merged as any).id;
    delete (merged as any).created_at;
    delete (merged as any).updated_at;
    Object.keys(merged).forEach(k => { if (merged[k] === "") merged[k] = null; });
    const { error } = await supabase.from("quran_records").upsert(merged, { onConflict: "student_id,record_date" });
    if (error) return toast.error(error.message);
    toast.success("Diiwaanka waa la kaydiyay");
    setDraft((d) => { const c = { ...d }; delete c[sid]; return c; });
    qc.invalidateQueries({ queryKey: ["quran-records", date] });
  };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-x-auto shadow-sm">
      <table className="w-full text-sm min-w-[1100px]">
        <thead className="bg-primary/5 text-primary">
          <tr>
            <th rowSpan={2} className="text-left px-3 py-2 border-b border-border">Magaca Ardayga</th>
            <th colSpan={3} className="text-center px-3 py-2 border-b border-r border-border" style={ARABIC}>الدرس</th>
            <th colSpan={3} className="text-center px-3 py-2 border-b border-r border-border" style={ARABIC}>مراجعة الحفظ</th>
            <th colSpan={2} className="text-center px-3 py-2 border-b border-r border-border" style={ARABIC}>سبع</th>
            <th rowSpan={2} className="border-b border-border"></th>
          </tr>
          <tr className="text-xs">
            <th className="px-2 py-1 border-b border-border">Surah</th>
            <th className="px-2 py-1 border-b border-border">From</th>
            <th className="px-2 py-1 border-b border-r border-border">To</th>
            <th className="px-2 py-1 border-b border-border">From</th>
            <th className="px-2 py-1 border-b border-border">To</th>
            <th className="px-2 py-1 border-b border-r border-border" style={ARABIC}>كيف</th>
            <th className="px-2 py-1 border-b border-border">From</th>
            <th className="px-2 py-1 border-b border-r border-border">To</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b border-border/60 hover:bg-secondary/30">
              <td className="px-3 py-2 font-medium text-primary">{s.full_name}</td>
              <td className="px-1"><input value={getVal(s.id,"dars_surah")} onChange={(e)=>setVal(s.id,"dars_surah",e.target.value)} className={cell}/></td>
              <td className="px-1"><input type="number" value={getVal(s.id,"dars_ayah_from")} onChange={(e)=>setVal(s.id,"dars_ayah_from",e.target.value?Number(e.target.value):null)} className={cell}/></td>
              <td className="px-1"><input type="number" value={getVal(s.id,"dars_ayah_to")} onChange={(e)=>setVal(s.id,"dars_ayah_to",e.target.value?Number(e.target.value):null)} className={cell}/></td>
              <td className="px-1"><input type="number" value={getVal(s.id,"muraja_ayah_from")} onChange={(e)=>setVal(s.id,"muraja_ayah_from",e.target.value?Number(e.target.value):null)} className={cell}/></td>
              <td className="px-1"><input type="number" value={getVal(s.id,"muraja_ayah_to")} onChange={(e)=>setVal(s.id,"muraja_ayah_to",e.target.value?Number(e.target.value):null)} className={cell}/></td>
              <td className="px-1">
                <select value={getVal(s.id,"muraja_quality") || ""} onChange={(e)=>setVal(s.id,"muraja_quality",e.target.value||null)} className={cell} style={ARABIC}>
                  <option value="">—</option><option>ممتاز</option><option>جيد جداً</option><option>جيد</option>
                </select>
              </td>
              <td className="px-1"><input type="number" value={getVal(s.id,"sabaa_ayah_from")} onChange={(e)=>setVal(s.id,"sabaa_ayah_from",e.target.value?Number(e.target.value):null)} className={cell}/></td>
              <td className="px-1"><input type="number" value={getVal(s.id,"sabaa_ayah_to")} onChange={(e)=>setVal(s.id,"sabaa_ayah_to",e.target.value?Number(e.target.value):null)} className={cell}/></td>
              <td className="px-2">
                <button onClick={()=>saveRow(s.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-green text-white text-xs"><Save className="size-3"/>Kaydi</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FarbarTable({ students, date }: { students: Stu[]; date: string }) {
  const qc = useQueryClient();
  const { data: records = [] } = useQuery({
    queryKey: ["farbar-records", date],
    queryFn: async () => {
      const { data } = await supabase.from("farbar_records").select("*").eq("record_date", date);
      return data || [];
    },
  });
  const byStudent = useMemo(() => {
    const m: Record<string, any> = {}; records.forEach((r: any) => { m[r.student_id] = r; }); return m;
  }, [records]);
  const [draft, setDraft] = useState<Record<string, any>>({});
  const getVal = (sid: string, k: string) => draft[sid]?.[k] ?? byStudent[sid]?.[k] ?? "";
  const setVal = (sid: string, k: string, v: any) => setDraft(d => ({ ...d, [sid]: { ...(d[sid]||{}), [k]: v }}));
  const saveRow = async (sid: string) => {
    const merged = { ...(byStudent[sid]||{}), ...(draft[sid]||{}), student_id: sid, record_date: date };
    delete (merged as any).id; delete (merged as any).created_at; delete (merged as any).updated_at;
    Object.keys(merged).forEach(k => { if (merged[k] === "") merged[k] = null; });
    const { error } = await supabase.from("farbar_records").upsert(merged, { onConflict: "student_id,record_date" });
    if (error) return toast.error(error.message);
    toast.success("Diiwaanka waa la kaydiyay");
    setDraft(d => { const c = {...d}; delete c[sid]; return c; });
    qc.invalidateQueries({ queryKey: ["farbar-records", date] });
  };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-x-auto shadow-sm">
      <table className="w-full text-sm min-w-[900px]">
        <thead className="bg-primary/5 text-primary">
          <tr>
            <th rowSpan={2} className="text-left px-3 py-2 border-b border-border">Magaca Ardayga</th>
            <th colSpan={2} className="text-center px-3 py-2 border-b border-r border-border" style={ARABIC}>القراءة</th>
            <th colSpan={2} className="text-center px-3 py-2 border-b border-r border-border" style={ARABIC}>الكتابة</th>
            <th rowSpan={2}></th>
          </tr>
          <tr className="text-xs">
            <th className="px-2 py-1 border-b border-border">Casharka Akhriska</th>
            <th className="px-2 py-1 border-b border-r border-border" style={ARABIC}>كيف</th>
            <th className="px-2 py-1 border-b border-border">Casharka Qoraalka</th>
            <th className="px-2 py-1 border-b border-r border-border" style={ARABIC}>كيف</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-b border-border/60 hover:bg-secondary/30">
              <td className="px-3 py-2 font-medium text-primary">{s.full_name}</td>
              <td className="px-1"><input value={getVal(s.id,"reading_lesson")} onChange={(e)=>setVal(s.id,"reading_lesson",e.target.value)} className={cell}/></td>
              <td className="px-1">
                <select value={getVal(s.id,"reading_quality")||""} onChange={(e)=>setVal(s.id,"reading_quality",e.target.value||null)} className={cell} style={ARABIC}>
                  <option value="">—</option><option>ممتاز</option><option>متوسط</option><option>ضعيف</option>
                </select>
              </td>
              <td className="px-1"><input value={getVal(s.id,"writing_lesson")} onChange={(e)=>setVal(s.id,"writing_lesson",e.target.value)} className={cell}/></td>
              <td className="px-1">
                <select value={getVal(s.id,"writing_quality")||""} onChange={(e)=>setVal(s.id,"writing_quality",e.target.value||null)} className={cell} style={ARABIC}>
                  <option value="">—</option><option>ممتاز</option><option>متوسط</option><option>ضعيف</option>
                </select>
              </td>
              <td className="px-2"><button onClick={()=>saveRow(s.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-green text-white text-xs"><Save className="size-3"/>Kaydi</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cell = "w-full px-2 py-1 rounded bg-secondary border border-transparent focus:border-primary focus:bg-card outline-none text-xs";