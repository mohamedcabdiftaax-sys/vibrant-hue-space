import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ardayda")({
  component: ArdaydaPage,
});

type Student = {
  id: string;
  full_name: string;
  dob: string | null;
  gender: string | null;
  photo_url: string | null;
  father_name: string | null;
  mother_name: string | null;
  contact_primary: string | null;
  contact_secondary: string | null;
  home_address: string | null;
  program_xanaano: boolean;
  program_boarding: boolean;
  program_quran: boolean;
  grade_level: number | null;
  uses_bus: boolean;
  bus_route: string | null;
  bus_number: string | null;
  is_active: boolean;
};

function ArdaydaPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Student[];
    },
  });

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    if (q && !`${s.full_name} ${s.father_name || ""} ${s.contact_primary || ""}`.toLowerCase().includes(q)) return false;
    if (gradeFilter !== "all" && String(s.grade_level) !== gradeFilter) return false;
    if (programFilter === "xanaano" && !s.program_xanaano) return false;
    if (programFilter === "boarding" && !s.program_boarding) return false;
    if (programFilter === "quran" && !s.program_quran) return false;
    return true;
  });

  const softDelete = async (s: Student) => {
    if (!confirm(`Ma hubtaa inaad tirayso ${s.full_name}?`)) return;
    const { error: insErr } = await supabase.from("deleted_items").insert({
      data_type: "Arday",
      display_name: s.full_name,
      table_name: "students",
      payload: s as any,
    });
    if (insErr) return toast.error(insErr.message);
    const { error } = await supabase.from("students").update({ is_active: false }).eq("id", s.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Ardayga waxaa loo wareejiyay Recycle Bin");
      qc.invalidateQueries({ queryKey: ["students"] });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maamulka Ardayda"
        breadcrumb={`Wadarta: ${students.length} arday firfircoon`}
        actions={
          <button onClick={() => { setEditing(null); setShowWizard(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-green text-white font-medium text-sm hover:opacity-90 shadow-sm">
            <Plus className="size-4" /> Diiwaangeli Arday
          </button>
        }
      />

      <div className="rounded-2xl bg-card border border-border p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Raadi magaca, aabe, ama telefoon..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary text-sm outline-none">
            <option value="all">Dhammaan Fasallada</option>
            {Array.from({length: 12}, (_,i)=>i+1).map(g => <option key={g} value={g}>Fasalka {g}</option>)}
          </select>
          <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary text-sm outline-none">
            <option value="all">Dhammaan Barnaamijyada</option>
            <option value="xanaano">Xanaano</option>
            <option value="boarding">Boarding</option>
            <option value="quran">Qur'aan & Farbar</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="text-left py-2 px-2">Magaca</th>
                <th className="text-left py-2 px-2">Fasalka</th>
                <th className="text-left py-2 px-2">Aabaha</th>
                <th className="text-left py-2 px-2">Telefoon</th>
                <th className="text-left py-2 px-2">Barnaamijyada</th>
                <th className="text-left py-2 px-2">Bus</th>
                <th className="text-right py-2 px-2">Talaabooyin</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">Soo dejin...</td></tr>}
              {!isLoading && filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">Wax arday ah lama helin. Riix "Diiwaangeli Arday" si aad u bilowdo.</td></tr>}
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/60 hover:bg-secondary/40">
                  <td className="py-3 px-2 font-medium text-primary">{s.full_name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{s.grade_level ? `F-${s.grade_level}` : "—"}</td>
                  <td className="py-3 px-2 text-muted-foreground">{s.father_name || "—"}</td>
                  <td className="py-3 px-2 text-muted-foreground">{s.contact_primary || "—"}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1 flex-wrap">
                      {s.program_xanaano && <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">Xanaano</span>}
                      {s.program_boarding && <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700">Boarding</span>}
                      {s.program_quran && <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-green/15 text-brand-green">Qur'aan</span>}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">{s.uses_bus ? `${s.bus_route || ""} ${s.bus_number || ""}` : "—"}</td>
                  <td className="py-3 px-2 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => { setEditing(s); setShowWizard(true); }} className="p-1.5 rounded hover:bg-primary/10 text-primary"><Pencil className="size-4" /></button>
                      <button onClick={() => softDelete(s)} className="p-1.5 rounded hover:bg-rose-50 text-rose-600"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showWizard && (
        <StudentWizard
          initial={editing}
          onClose={() => setShowWizard(false)}
          onSaved={() => { setShowWizard(false); qc.invalidateQueries({ queryKey: ["students"] }); }}
        />
      )}
    </div>
  );
}

const emptyForm: Partial<Student> = {
  full_name: "", dob: null, gender: "Lab", father_name: "", mother_name: "",
  contact_primary: "", contact_secondary: "", home_address: "",
  program_xanaano: false, program_boarding: false, program_quran: false,
  grade_level: 1, uses_bus: false, bus_route: "", bus_number: "",
};

function StudentWizard({ initial, onClose, onSaved }: { initial: Student | null; onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<Student>>(initial ? { ...initial } : emptyForm);
  const upd = (k: keyof Student, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.full_name?.trim()) return toast.error("Magaca ardayga waa lagama maarmaan");
    const payload: any = { ...form };
    if (!payload.dob) delete payload.dob;
    if (initial) {
      const { error } = await supabase.from("students").update(payload).eq("id", initial.id);
      if (error) return toast.error(error.message);
      toast.success("Ardayga waa la cusbooneysiiyey");
    } else {
      const { error } = await supabase.from("students").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Ardayga waa la diiwaangeliyay");
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-card">
          <div>
            <div className="font-bold text-primary">{initial ? "Wax-ka-Beddel Arday" : "Diiwaangelinta Arday Cusub"}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Tallaabada {step} ee 4</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded"><X className="size-4" /></button>
        </div>
        <div className="px-6 pt-3">
          <div className="flex gap-1">
            {[1,2,3,4].map(n => <div key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-brand-green" : "bg-border"}`} />)}
          </div>
        </div>
        <div className="p-6 space-y-4">
          {step === 1 && (
            <>
              <Field label="Magaca Buuxa *"><input value={form.full_name || ""} onChange={(e)=>upd("full_name",e.target.value)} className={inp}/></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Taariikhda Dhalashada"><input type="date" value={form.dob || ""} onChange={(e)=>upd("dob",e.target.value)} className={inp}/></Field>
                <Field label="Jinsiga">
                  <select value={form.gender || "Lab"} onChange={(e)=>upd("gender",e.target.value)} className={inp}>
                    <option>Lab</option><option>Dheddig</option>
                  </select>
                </Field>
              </div>
              <Field label="Fasalka">
                <select value={form.grade_level || 1} onChange={(e)=>upd("grade_level",Number(e.target.value))} className={inp}>
                  {Array.from({length:12},(_,i)=>i+1).map(g=><option key={g} value={g}>Fasalka {g}</option>)}
                </select>
              </Field>
              <Field label="URL-ka Sawirka (ikhtiyaari)"><input value={form.photo_url || ""} onChange={(e)=>upd("photo_url",e.target.value)} placeholder="https://..." className={inp}/></Field>
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Magaca Aabaha"><input value={form.father_name || ""} onChange={(e)=>upd("father_name",e.target.value)} className={inp}/></Field>
                <Field label="Magaca Hooyada"><input value={form.mother_name || ""} onChange={(e)=>upd("mother_name",e.target.value)} className={inp}/></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Telefoon Koowaad"><input value={form.contact_primary || ""} onChange={(e)=>upd("contact_primary",e.target.value)} className={inp}/></Field>
                <Field label="Telefoon Labaad"><input value={form.contact_secondary || ""} onChange={(e)=>upd("contact_secondary",e.target.value)} className={inp}/></Field>
              </div>
              <Field label="Cinwaanka Guriga"><textarea value={form.home_address || ""} onChange={(e)=>upd("home_address",e.target.value)} className={inp} rows={2}/></Field>
            </>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-primary mb-2">Barnaamijyada uu Ardaygu raacayo:</div>
              <Toggle checked={!!form.program_xanaano} onChange={(v)=>upd("program_xanaano",v)} label="Xanaano (Nursery / KG)" />
              <Toggle checked={!!form.program_boarding} onChange={(v)=>upd("program_boarding",v)} label="Boarding School (Jiif iyo Cunto)" />
              <Toggle checked={!!form.program_quran} onChange={(v)=>upd("program_quran",v)} label="Dugsi Qur'aan & Farbar" />
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              <Toggle checked={!!form.uses_bus} onChange={(v)=>upd("uses_bus",v)} label="Ma raacayaa Bus-ka?" />
              {form.uses_bus && (
                <>
                  <Field label="Khadka Jidka Bus-ka">
                    <select value={form.bus_route || ""} onChange={(e)=>upd("bus_route",e.target.value)} className={inp}>
                      <option value="">— Dooro —</option>
                      <option>Khadka Waqooyi</option>
                      <option>Khadka Koonfur</option>
                      <option>Khadka Bari</option>
                      <option>Khadka Galbeed</option>
                    </select>
                  </Field>
                  <Field label="Nambarka Bus-ka"><input value={form.bus_number || ""} onChange={(e)=>upd("bus_number",e.target.value)} className={inp}/></Field>
                </>
              )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-between sticky bottom-0 bg-card">
          <button disabled={step===1} onClick={() => setStep(step-1)} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40"><ChevronLeft className="size-4"/>Hore</button>
          {step < 4
            ? <button onClick={() => setStep(step+1)} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Xiga<ChevronRight className="size-4"/></button>
            : <button onClick={submit} className="px-5 py-2 rounded-lg bg-brand-green text-white text-sm font-medium">Kaydi Ardayga</button>}
        </div>
      </div>
    </div>
  );
}

const inp = "w-full px-3 py-2 rounded-lg bg-secondary border border-transparent focus:border-primary focus:bg-card outline-none text-sm";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-xs font-medium text-primary mb-1">{label}</div>{children}</label>;
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/70">
      <span className="text-sm font-medium">{label}</span>
      <span className={`relative w-11 h-6 rounded-full transition ${checked ? "bg-brand-green" : "bg-border"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}