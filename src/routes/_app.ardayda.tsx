import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Search, Printer, Eye, Trash2, X, ChevronLeft, Upload, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ardayda")({ component: ArdaydaPage });

const PROGRAMS = [
  { key: "program_quran", label: "Dugsi Qur'aan & Farbar" },
  { key: "program_xanaano", label: "Xanaano (KG/Nursery)" },
  { key: "program_boarding", label: "Boarding School" },
];
const STEPS = ["Shakhsiyad", "Waalidka", "Barnaamijka", "Gaadiidka", "Xog Dheeraad ah"];

function ArdaydaPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [selected, setSelected] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await supabase.from("students").select("*").eq("is_active", true).order("full_name")).data || [],
  });

  const filtered = (students as any[]).filter((s) => {
    if (search && !`${s.full_name} ${s.contact_primary || ""} ${s.student_number || ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (gradeFilter !== "all" && String(s.grade_level) !== gradeFilter) return false;
    return true;
  });

  const softDelete = async (s: any) => {
    if (!confirm(`Ma hubtaa inaad tirayso ${s.full_name}?`)) return;
    await supabase.from("deleted_items").insert({ data_type: "Arday", display_name: s.full_name, table_name: "students", payload: s });
    await supabase.from("students").update({ is_active: false }).eq("id", s.id);
    toast.success("Ardayga waxaa loo wareejiyay Recycle Bin");
    qc.invalidateQueries({ queryKey: ["students"] });
  };

  if (selected) return <StudentDetail student={selected} onBack={() => setSelected(null)} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maamulka Ardayda"
        breadcrumb={`${filtered.length} arday firfircoon`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary">
              <Printer className="size-4" /> Daabac
            </button>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green text-white text-sm font-medium shadow-sm hover:opacity-90">
              <Plus className="size-4" /> Diiwaangeli Arday
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Raadi magaca, lambarka..." className="pl-9 pr-3 py-2 rounded-lg bg-secondary text-sm w-full outline-none" />
        </div>
        <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary text-sm">
          <option value="all">Dhammaan Fasallada</option>
          <option value="0">Xanaano</option>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Fasalka {g}</option>)}
        </select>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/5 text-primary border-b border-border">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Magaca Ardayga</th>
              <th className="text-left px-4 py-3">Fasalka</th>
              <th className="text-left px-4 py-3">Barnaamijka</th>
              <th className="text-left px-4 py-3">Telefoon</th>
              <th className="text-right px-4 py-3">Falal</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Soo dejinaya...</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Wax arday ah lama helin.</td></tr>}
            {filtered.map((s: any) => (
              <tr key={s.id} className="border-b border-border/60 hover:bg-secondary/40 transition-colors">
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{s.student_number || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {s.photo_url
                      ? <img src={s.photo_url} className="size-8 rounded-full object-cover border border-border" />
                      : <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold">{s.full_name[0]}</div>}
                    <div>
                      <div className="font-semibold text-primary">{s.full_name}</div>
                      <div className="text-xs text-muted-foreground">{s.gender || ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.grade_level === 0 ? "Xanaano" : `Fasalka ${s.grade_level}`}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {s.program_quran && <span className="px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary">Qur'aan</span>}
                    {s.program_xanaano && <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700">Xanaano</span>}
                    {s.program_boarding && <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-100 text-purple-700">Boarding</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.contact_primary || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelected(s)} className="p-1.5 rounded hover:bg-primary/10 text-primary mr-1"><Eye className="size-4" /></button>
                  <button onClick={() => softDelete(s)} className="p-1.5 rounded hover:bg-rose-50 text-rose-600"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && <RegisterModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ["students"] }); }} />}
    </div>
  );
}

function StudentDetail({ student, onBack }: { student: any; onBack: () => void }) {
  const [tab, setTab] = useState("overview");
  const { data: exams = [] } = useQuery({ queryKey: ["student-exams", student.id], queryFn: async () => (await supabase.from("exam_scores").select("*").eq("student_id", student.id).order("exam_date", { ascending: false })).data || [] });
  const { data: quran = [] } = useQuery({ queryKey: ["student-quran", student.id], queryFn: async () => (await supabase.from("quran_records").select("*").eq("student_id", student.id).order("record_date", { ascending: false })).data || [] });
  const { data: incidents = [] } = useQuery({ queryKey: ["student-incidents", student.id], queryFn: async () => (await supabase.from("incidents").select("*").eq("student_id", student.id).order("incident_date", { ascending: false })).data || [] });
  const { data: payments = [] } = useQuery({ queryKey: ["student-payments", student.id], queryFn: async () => (await supabase.from("tuition_payments").select("*").eq("student_id", student.id).order("payment_date", { ascending: false })).data || [] });
  const { data: attendance = [] } = useQuery({ queryKey: ["student-attendance", student.id], queryFn: async () => (await supabase.from("attendance").select("*").eq("student_id", student.id).order("attendance_date", { ascending: false }).limit(30)).data || [] });

  const lastExam = (exams as any[])[0];
  const presentDays = (attendance as any[]).filter(a => a.status === "present").length;
  const totalDays = (attendance as any[]).length;

  const printCard = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Student ID - ${student.full_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 0; margin: 0; }
        .card { width: 85mm; min-height: 54mm; border: 2px solid #1A237E; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 12px; margin: 20px auto; }
        .photo { width: 50px; height: 60px; border-radius: 4px; background: #E8EAF6; object-fit: cover; border: 1px solid #ccc; }
        .info { flex: 1; }
        .school { font-size: 9px; color: #1A237E; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .name { font-size: 14px; font-weight: bold; color: #1A237E; margin: 2px 0; }
        .grade { font-size: 11px; color: #555; }
        .id { font-size: 10px; color: #2E7D32; font-weight: bold; margin-top: 4px; }
        .contact { font-size: 9px; color: #666; margin-top: 3px; }
        .stripe { height: 8px; background: linear-gradient(90deg, #1A237E, #2E7D32); border-radius: 4px 4px 0 0; }
      </style></head>
      <body>
        <div class="stripe"></div>
        <div class="card">
          ${student.photo_url ? `<img class="photo" src="${student.photo_url}" />` : `<div class="photo" style="display:flex;align-items:center;justify-content:center;font-size:20px;color:#1A237E;">${student.full_name[0]}</div>`}
          <div class="info">
            <div class="school">New Generation International School</div>
            <div class="name">${student.full_name}</div>
            <div class="grade">${student.grade_level === 0 ? "Xanaano" : `Fasalka ${student.grade_level}`}</div>
            <div class="id">ID: ${student.student_number || "N/A"}</div>
            <div class="contact">📞 ${student.contact_primary || "—"}</div>
          </div>
        </div>
        <script>window.onload=()=>window.print()</script>
      </body></html>`);
    w.document.close();
  };

  const TABS = [
    { key: "overview", label: "Guudmar" },
    { key: "exams", label: "Imtixaanada" },
    { key: "lessons", label: "Casharrada" },
    { key: "attendance", label: "Imaanshaha" },
    { key: "incidents", label: "Dacwooyin" },
    { key: "finance", label: "Maaliyadda" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary border border-border"><ChevronLeft className="size-4" /></button>
        <div>
          <h1 className="text-xl font-bold text-primary">{student.full_name}</h1>
          <div className="text-xs text-muted-foreground">{student.student_number} · {student.grade_level === 0 ? "Xanaano" : `Fasalka ${student.grade_level}`}</div>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={printCard} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm hover:bg-secondary">
            <Printer className="size-4" /> ID Card
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
            <Printer className="size-4" /> Daabac Bogga
          </button>
        </div>
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Imtixaankii ugu dambeeyay</div>
          <div className="text-2xl font-bold text-primary mt-1">{lastExam ? `${lastExam.score}%` : "—"}</div>
          <div className="text-xs text-muted-foreground">{lastExam?.subject || ""}</div>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Imaanshaha (30 maalmood)</div>
          <div className="text-2xl font-bold text-brand-green mt-1">{totalDays > 0 ? `${Math.round((presentDays/totalDays)*100)}%` : "—"}</div>
          <div className="text-xs text-muted-foreground">{presentDays}/{totalDays} maalmood</div>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Casharro Qur'aan</div>
          <div className="text-2xl font-bold text-primary mt-1">{(quran as any[]).length}</div>
          <div className="text-xs text-muted-foreground">la diiwaangaliyay</div>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
          <div className="text-xs text-muted-foreground">Dacwooyin</div>
          <div className={`text-2xl font-bold mt-1 ${(incidents as any[]).length > 0 ? "text-rose-600" : "text-brand-green"}`}>{(incidents as any[]).length}</div>
          <div className="text-xs text-muted-foreground">diiwaangashan</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-border pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-3">
            <div className="font-semibold text-primary">Macluumaadka Shakhsiga</div>
            <InfoRow label="Magaca Buuxa" value={student.full_name} />
            <InfoRow label="Taariikhda Dhalashada" value={student.dob || "—"} />
            <InfoRow label="Jinsiga" value={student.gender || "—"} />
            <InfoRow label="Fasalka" value={student.grade_level === 0 ? "Xanaano" : `Fasalka ${student.grade_level}`} />
            <InfoRow label="Cinwaanka" value={student.home_address || "—"} />
            <InfoRow label="Yatim" value={student.is_orphan ? "Haa" : "Maya"} />
            <InfoRow label="Naafo" value={student.is_disabled ? `Haa — ${student.disability_notes || ""}` : "Maya"} />
            <InfoRow label="Cuntada Xasaasiga" value={student.food_allergies || "Waxba ma jiraan"} />
          </div>
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm space-y-3">
            <div className="font-semibold text-primary">Waalidka & Mas'uulka</div>
            <InfoRow label="Aabaha" value={student.father_name || "—"} />
            <InfoRow label="Hooyadda" value={student.mother_name || "—"} />
            <InfoRow label="Mas'uulka" value={student.guardian_name || "—"} />
            <InfoRow label="Xiriirka" value={student.guardian_relationship || "—"} />
            <InfoRow label="Tel. Mas'uulka" value={student.guardian_phone || student.contact_primary || "—"} />
            <InfoRow label="Tel. Xaalad Degdeg" value={student.emergency_contact || "—"} />
            <InfoRow label="Bus-ka" value={student.uses_bus ? `Haa — ${student.bus_route || ""}` : "Maya"} />
          </div>
        </div>
      )}

      {tab === "exams" && (
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4">Taariikhda Imtixaanada</div>
          {(exams as any[]).length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Wax imtixaan ah lama diiwaangelin weli.</div>}
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border">
              <tr><th className="text-left py-2">Taariikh</th><th className="text-left py-2">Maadada</th><th className="text-left py-2">Imtixaanka</th><th className="text-right py-2">Dhibcaha</th><th className="text-right py-2">%</th></tr>
            </thead>
            <tbody>
              {(exams as any[]).map((e: any) => (
                <tr key={e.id} className="border-b border-border/60">
                  <td className="py-2 text-muted-foreground">{e.exam_date}</td>
                  <td className="py-2 font-medium">{e.subject}</td>
                  <td className="py-2 text-muted-foreground">{e.exam_name}</td>
                  <td className="py-2 text-right">{e.score}/{e.max_score}</td>
                  <td className="py-2 text-right font-bold" style={{color: (e.score/e.max_score) >= 0.7 ? "#2E7D32" : "#DC2626"}}>{Math.round((e.score/e.max_score)*100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "lessons" && (
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4">Casharro Qur'aan / Farbar</div>
          {(quran as any[]).length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Wax casharro ah lama diiwaangelin weli.</div>}
          <div className="space-y-3">
            {(quran as any[]).map((q: any) => (
              <div key={q.id} className="p-3 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{q.record_date}</div>
                  {q.muraja_quality && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{q.muraja_quality}</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {q.dars_surah && `الدرس: ${q.dars_surah} (${q.dars_ayah_from}–${q.dars_ayah_to})`}
                  {q.sabaa_ayah_from && ` · سبع: ${q.sabaa_ayah_from}–${q.sabaa_ayah_to}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "attendance" && (
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4">Imaanshaha — 30 Maalmood ee Dambe</div>
          {(attendance as any[]).length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Wax imaansho ah lama diiwaangelin weli.</div>}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {(attendance as any[]).map((a: any) => (
              <div key={a.id} className={`rounded-lg p-2 text-center text-xs ${a.status === "present" ? "bg-brand-green/15 text-brand-green" : "bg-rose-100 text-rose-700"}`}>
                <div>{a.attendance_date?.slice(8)}</div>
                {a.status === "present" ? <CheckCircle2 className="size-3 mx-auto mt-1" /> : <XCircle className="size-3 mx-auto mt-1" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "incidents" && (
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4">Diiwaanka Dacwooyinka</div>
          {(incidents as any[]).length === 0 && <div className="text-sm text-muted-foreground text-center py-8 text-brand-green">✓ Wax dacwooyin ah lama diiwaangelin — arday wanaagsan!</div>}
          <div className="space-y-3">
            {(incidents as any[]).map((i: any) => (
              <div key={i.id} className="p-3 rounded-xl border border-rose-200 bg-rose-50/50">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm text-rose-700">{i.incident_date}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">{i.severity || "Fudud"}</span>
                </div>
                <div className="text-sm text-foreground mt-1">{i.description}</div>
                {i.fine_amount > 0 && <div className="text-xs text-rose-600 mt-1">Ganaax: ${i.fine_amount}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "finance" && (
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4">Taariikhda Lacagaha</div>
          {(payments as any[]).length === 0 && <div className="text-sm text-muted-foreground text-center py-8">Wax lacag ah lama diiwaangelin weli.</div>}
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border">
              <tr><th className="text-left py-2">Taariikh</th><th className="text-left py-2">Bil</th><th className="text-right py-2">Lacag</th><th className="text-right py-2">Xaalad</th></tr>
            </thead>
            <tbody>
              {(payments as any[]).map((p: any) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2 text-muted-foreground">{p.payment_date}</td>
                  <td className="py-2">{p.month}</td>
                  <td className="py-2 text-right font-semibold">${p.amount}</td>
                  <td className="py-2 text-right">
                    {p.paid ? <span className="text-brand-green text-xs">✓ La bixiyay</span> : <span className="text-rose-600 text-xs">✗ Resto</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm border-b border-border/50 pb-2">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function RegisterModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [step, setStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "", dob: "", gender: "Lab", student_number: `NG-${Math.floor(Math.random()*9000+1000)}`,
    father_name: "", mother_name: "", contact_primary: "", contact_secondary: "", home_address: "",
    guardian_name: "", guardian_relationship: "Aabaha", guardian_phone: "", emergency_contact: "",
    program_quran: false, program_xanaano: false, program_boarding: false, grade_level: 1,
    uses_bus: false, bus_route: "", bus_number: "",
    food_allergies: "", is_disabled: false, disability_notes: "", is_orphan: false, photo_url: "",
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPhotoPreview(reader.result as string); setForm(f => ({ ...f, photo_url: reader.result as string })); };
    reader.readAsDataURL(file);
  };

  const f = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = async () => {
    if (!form.full_name.trim()) return toast.error("Magaca waa qasab");
    setBusy(true);
    const { error } = await supabase.from("students").insert(form);
    if (error) { toast.error(error.message); setBusy(false); return; }
    toast.success("Ardayga waa la diiwaangaliyay");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-card rounded-2xl shadow-xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <div className="font-bold text-primary text-lg">Diiwaangelinta Arday Cusub</div>
            <div className="text-xs text-muted-foreground mt-0.5">Tallaabooyinka {step+1} / {STEPS.length}: {STEPS[step]}</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded"><X className="size-4" /></button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-secondary mx-5 mt-0 rounded-full overflow-hidden">
          <div className="h-full bg-brand-green rounded-full transition-all" style={{ width: `${((step+1)/STEPS.length)*100}%` }} />
        </div>

        <div className="p-5 space-y-4">
          {step === 0 && (
            <>
              <div className="flex items-center gap-4">
                <div className="size-20 rounded-xl border-2 border-dashed border-border bg-secondary overflow-hidden grid place-items-center cursor-pointer relative" onClick={() => document.getElementById("photo-upload")?.click()}>
                  {photoPreview ? <img src={photoPreview} className="size-full object-cover" /> : <Upload className="size-6 text-muted-foreground" />}
                  <input id="photo-upload" type="file" accept="image/*" hidden onChange={handlePhoto} />
                </div>
                <div className="text-xs text-muted-foreground">Guji si aad u geliso sawirka ardayga</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Magaca Buuxa *" value={form.full_name} onChange={v => f("full_name", v)} />
                <Field label="Taariikhda Dhalashada" type="date" value={form.dob} onChange={v => f("dob", v)} />
                <div>
                  <label className="text-xs text-muted-foreground">Jinsiga</label>
                  <select value={form.gender} onChange={e => f("gender", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1">
                    <option>Lab</option><option>Dheddig</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Fasalka</label>
                  <select value={form.grade_level} onChange={e => f("grade_level", Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1">
                    <option value={0}>Xanaano (KG)</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Fasalka {g}</option>)}
                  </select>
                </div>
                <Field label="Lambarka ID" value={form.student_number} onChange={v => f("student_number", v)} />
                <Field label="Cinwaanka Guriga" value={form.home_address} onChange={v => f("home_address", v)} />
              </div>
            </>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Magaca Aabaha" value={form.father_name} onChange={v => f("father_name", v)} />
              <Field label="Magaca Hooyadda" value={form.mother_name} onChange={v => f("mother_name", v)} />
              <Field label="Tel. Koowaad" value={form.contact_primary} onChange={v => f("contact_primary", v)} />
              <Field label="Tel. Labaad" value={form.contact_secondary} onChange={v => f("contact_secondary", v)} />
              <Field label="Magaca Mas'uulka" value={form.guardian_name} onChange={v => f("guardian_name", v)} />
              <div>
                <label className="text-xs text-muted-foreground">Xiriirka Mas'uulka</label>
                <select value={form.guardian_relationship} onChange={e => f("guardian_relationship", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1">
                  {["Aabaha","Hooyadda","Adeerka","Abtigiis","Edda","Kale"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <Field label="Tel. Mas'uulka" value={form.guardian_phone} onChange={v => f("guardian_phone", v)} />
              <Field label="🆘 Lambarka Xaalad Degdeg" value={form.emergency_contact} onChange={v => f("emergency_contact", v)} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {PROGRAMS.map(p => (
                <label key={p.key} className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-secondary/50">
                  <input type="checkbox" checked={(form as any)[p.key]} onChange={e => f(p.key, e.target.checked)} className="size-4 accent-primary" />
                  <span className="text-sm font-medium">{p.label}</span>
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-secondary/50">
                <input type="checkbox" checked={form.uses_bus} onChange={e => f("uses_bus", e.target.checked)} className="size-4 accent-primary" />
                <span className="text-sm font-medium">Ma raacayaa Bus-ka?</span>
              </label>
              {form.uses_bus && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Khadka Bus-ka" value={form.bus_route} onChange={v => f("bus_route", v)} />
                  <Field label="Nambarka Bus-ka" value={form.bus_number} onChange={v => f("bus_number", v)} />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Cuntada Xasaasiyad uu ku qabo (haddii jirto)</label>
                <input value={form.food_allergies} onChange={e => f("food_allergies", e.target.value)} placeholder="Tusaale: Digirta, Hilbka, iwm..." className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none" />
              </div>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer">
                <input type="checkbox" checked={form.is_orphan} onChange={e => f("is_orphan", e.target.checked)} className="size-4 accent-primary" />
                <span className="text-sm font-medium">Ardaygu ma Agoone yahay?</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer">
                <input type="checkbox" checked={form.is_disabled} onChange={e => f("is_disabled", e.target.checked)} className="size-4 accent-primary" />
                <span className="text-sm font-medium">Ma Naafo yahay?</span>
              </label>
              {form.is_disabled && (
                <div>
                  <label className="text-xs text-muted-foreground">Sharax Naafadda</label>
                  <textarea value={form.disability_notes} onChange={e => f("disability_notes", e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-5 border-t border-border">
          <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0} className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40">← Hore</button>
          {step < STEPS.length - 1
            ? <button onClick={() => setStep(s => s+1)} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Xiga →</button>
            : <button onClick={submit} disabled={busy} className="px-6 py-2 rounded-lg bg-brand-green text-white text-sm font-medium disabled:opacity-60">{busy ? "Wuu kaydiyaa..." : "✓ Diiwaangeli"}</button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none" />
    </div>
  );
}
