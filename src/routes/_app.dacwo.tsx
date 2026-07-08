import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession, useRoles } from "@/hooks/use-auth";
import { useState } from "react";
import { Plus, Trash2, X, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dacwo")({
  component: DacwoPage,
});

const SEVERITY = ["Fudud", "Dhexe", "Culus"] as const;
const SEVERITY_STYLE: Record<string, string> = {
  Fudud: "bg-amber-100 text-amber-700 border-amber-300",
  Dhexe: "bg-orange-100 text-orange-700 border-orange-300",
  Culus: "bg-rose-100 text-rose-700 border-rose-300",
};

type Student = { id: string; full_name: string; grade_level: number | null };

function DacwoPage() {
  const qc = useQueryClient();
  const { user } = useAuthSession();
  const { primary } = useRoles(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [studentFilter, setStudentFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const { data: students = [] } = useQuery({
    queryKey: ["dacwo-students"],
    queryFn: async () =>
      ((await supabase.from("students").select("id, full_name, grade_level").eq("is_active", true).order("full_name")).data ||
        []) as Student[],
  });

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data: incs } = await supabase.from("incidents").select("*").order("incident_date", { ascending: false });
      const { data: studs } = await supabase.from("students").select("id, full_name, grade_level");
      const studMap: Record<string, any> = {};
      (studs || []).forEach((s: any) => { studMap[s.id] = s; });
      return (incs || []).map((i: any) => ({ ...i, students: studMap[i.student_id] || null }));
    },
  });

  const filtered = (incidents as any[]).filter((i) => {
    if (studentFilter !== "all" && i.student_id !== studentFilter) return false;
    if (severityFilter !== "all" && i.severity !== severityFilter) return false;
    return true;
  });

  const del = async (i: any) => {
    if (!confirm("Ma hubtaa inaad tirayso dacwadan?")) return;
    await supabase.from("deleted_items").insert({
      data_type: "Diiwaan Anshax",
      display_name: `${i.students?.full_name || "Arday"} — ${i.description?.slice(0, 30)}`,
      table_name: "incidents",
      payload: i,
    });
    const { error } = await supabase.from("incidents").delete().eq("id", i.id);
    if (error) return toast.error(error.message);
    toast.success("Waxaa loo wareejiyay Recycle Bin");
    qc.invalidateQueries({ queryKey: ["incidents"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dacwo & Anshax"
        breadcrumb="Warbixinada falalka xun ee ardayda"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green text-white text-sm font-medium shadow-sm hover:opacity-90"
          >
            <Plus className="size-4" /> Dacwo Cusub
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <select
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary text-sm"
        >
          <option value="all">Dhammaan Ardayda</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary text-sm"
        >
          <option value="all">Dhammaan Heerarka</option>
          {SEVERITY.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
        <div className="font-semibold text-primary text-lg mb-4">Diiwaanka Dacwooyinka</div>
        {isLoading && <div className="text-sm text-muted-foreground text-center py-8">Soo dejinaya...</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
            Wax dacwooyin ah lama diiwaangelin weli.
          </div>
        )}
        <div className="space-y-3">
          {filtered.map((i) => (
            <div key={i.id} className="rounded-xl border border-border p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="size-9 rounded-lg bg-rose-50 text-rose-600 grid place-items-center shrink-0">
                  <ShieldAlert className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-primary text-sm">
                      {i.students?.full_name || "Arday la tirtiray"}
                    </span>
                    {i.students?.grade_level && (
                      <span className="text-xs text-muted-foreground">Fasalka {i.students.grade_level}</span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${SEVERITY_STYLE[i.severity] || SEVERITY_STYLE.Fudud}`}
                    >
                      {i.severity || "Fudud"}
                    </span>
                  </div>
                  <div className="text-sm text-foreground mt-1">{i.description}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{i.incident_date}</span>
                    {i.fine_amount > 0 && <span className="text-rose-600 font-medium">Ganaax: ${i.fine_amount}</span>}
                    {i.reported_by && <span>Sheegay: {i.reported_by}</span>}
                  </div>
                </div>
              </div>
              {(primary === "maamule" || true) && (
                <button onClick={() => del(i)} className="p-1.5 rounded hover:bg-rose-50 text-rose-600 shrink-0">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <IncidentForm
          students={students}
          reportedBy={user?.id || ""}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["incidents"] });
          }}
        />
      )}
    </div>
  );
}

function IncidentForm({
  students,
  reportedBy,
  onClose,
  onSaved,
}: {
  students: Student[];
  reportedBy: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    student_id: "",
    incident_date: new Date().toISOString().slice(0, 10),
    description: "",
    severity: "Fudud" as string,
    fine_amount: 0,
  });

  const submit = async () => {
    if (!form.student_id) return toast.error("Dooro ardayga");
    if (!form.description.trim()) return toast.error("Buuxi faahfaahinta dacwada");
    const { error } = await supabase.from("incidents").insert({ ...form, reported_by: reportedBy });
    if (error) return toast.error(error.message);
    toast.success("Dacwada waa la diiwaangaliyay");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-primary text-lg">Dacwo / Diiwaan Anshax Cusub</div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Ardayga</label>
            <select
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1"
            >
              <option value="">— Dooro Ardayga —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} {s.grade_level ? `(Fasalka ${s.grade_level})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Taariikhda</label>
            <input
              type="date"
              value={form.incident_date}
              onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Faahfaahinta Falka</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Sharax waxa dhacay..."
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Heerka</label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1"
              >
                {SEVERITY.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ganaax ($, ikhtiyaari)</label>
              <input
                type="number"
                value={form.fine_amount}
                onChange={(e) => setForm({ ...form, fine_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none"
              />
            </div>
          </div>
          <button
            onClick={submit}
            className="w-full py-2.5 rounded-lg bg-brand-green text-white text-sm font-medium mt-2"
          >
            Kaydi Dacwada
          </button>
        </div>
      </div>
    </div>
  );
}
