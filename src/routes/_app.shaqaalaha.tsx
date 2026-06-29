import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Users, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/shaqaalaha")({
  component: ShaqaalahaPage,
});

const ROLES = ["Macalin", "Macalin Quraan", "Maamule", "Xisaabiye", "Darawal", "Kale"];
const DEPARTMENTS = ["Dugsiga Guud", "Dugsi Qur'aan", "Maamulka", "Gaadiidka", "Maaliyadda"];

type Staff = {
  id: string;
  full_name: string;
  role: string;
  department: string | null;
  contact: string | null;
  email: string | null;
  hire_date: string | null;
  salary: number | null;
  is_active: boolean;
};

function ShaqaalahaPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [editing, setEditing] = useState<Staff | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: async () =>
      ((await supabase.from("staff").select("*").eq("is_active", true).order("full_name")).data || []) as Staff[],
  });

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    if (q && !`${s.full_name} ${s.role} ${s.contact || ""}`.toLowerCase().includes(q)) return false;
    if (deptFilter !== "all" && s.department !== deptFilter) return false;
    return true;
  });

  const counts = {
    total: staff.length,
    teachers: staff.filter((s) => s.role.toLowerCase().includes("macalin")).length,
    admin: staff.filter((s) => s.role === "Maamule" || s.role === "Xisaabiye").length,
    other: staff.filter((s) => s.role === "Darawal" || s.role === "Kale").length,
  };

  const softDelete = async (s: Staff) => {
    if (!confirm(`Ma hubtaa inaad tirayso ${s.full_name}?`)) return;
    await supabase.from("deleted_items").insert({
      data_type: "Shaqaale",
      display_name: s.full_name,
      table_name: "staff",
      payload: s as any,
    });
    const { error } = await supabase.from("staff").update({ is_active: false }).eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Shaqaalaha waxaa loo wareejiyay Recycle Bin");
    qc.invalidateQueries({ queryKey: ["staff"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maamulka Shaqaalaha"
        breadcrumb="Macalimiinta iyo shaqaalaha kale"
        actions={
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green text-white text-sm font-medium shadow-sm hover:opacity-90"
          >
            <Plus className="size-4" /> Diiwaangeli Shaqaale
          </button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Wadarta Shaqaalaha", val: counts.total },
          { label: "Macalimiinta", val: counts.teachers },
          { label: "Maamulka", val: counts.admin },
          { label: "Darawalada & Kale", val: counts.other },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl bg-card border border-border p-4 shadow-sm">
            <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-2">
              <Users className="size-5" />
            </div>
            <div className="text-2xl font-bold text-primary">{k.val}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="font-semibold text-primary text-lg">Liiska Shaqaalaha</div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Raadi shaqaale..."
                className="pl-9 pr-3 py-2 rounded-lg bg-secondary text-sm outline-none w-56"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-secondary text-sm"
            >
              <option value="all">Dhammaan Waaxyaha</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase border-b border-border">
            <tr>
              <th className="text-left py-2">Magaca</th>
              <th className="text-left py-2">Jagada</th>
              <th className="text-left py-2">Waaxda</th>
              <th className="text-left py-2">Telefoon</th>
              <th className="text-right py-2">Falal</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  Soo dejinaya...
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  Wax shaqaale ah lama helin.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-border/60">
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold">
                      {s.full_name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                    </div>
                    <span className="font-medium text-primary">{s.full_name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-muted-foreground">{s.role}</td>
                <td className="py-2.5 text-muted-foreground">{s.department || "—"}</td>
                <td className="py-2.5 text-muted-foreground">{s.contact || "—"}</td>
                <td className="py-2.5 text-right">
                  <button
                    onClick={() => {
                      setEditing(s);
                      setShowForm(true);
                    }}
                    className="p-1.5 rounded hover:bg-secondary text-primary mr-1"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button onClick={() => softDelete(s)} className="p-1.5 rounded hover:bg-rose-50 text-rose-600">
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <StaffForm
          staff={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["staff"] });
          }}
        />
      )}
    </div>
  );
}

function StaffForm({ staff, onClose, onSaved }: { staff: Staff | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    full_name: staff?.full_name || "",
    role: staff?.role || ROLES[0],
    department: staff?.department || DEPARTMENTS[0],
    contact: staff?.contact || "",
    email: staff?.email || "",
    hire_date: staff?.hire_date || new Date().toISOString().slice(0, 10),
    salary: staff?.salary || 0,
  });

  const submit = async () => {
    if (!form.full_name.trim()) return toast.error("Buuxi magaca shaqaalaha");
    if (staff) {
      const { error } = await supabase.from("staff").update(form).eq("id", staff.id);
      if (error) return toast.error(error.message);
      toast.success("Xogta waa la cusbooneysiiyay");
    } else {
      const { error } = await supabase.from("staff").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Shaqaalaha waa la diiwaangaliyay");
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-primary text-lg">{staff ? "Tafatir Shaqaale" : "Diiwaangeli Shaqaale"}</div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Magaca Buuxa</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Jagada</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Waaxda</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Telefoon</label>
              <input
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email (ikhtiyaari)</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Taariikhda Shaqaalaynta</label>
              <input
                type="date"
                value={form.hire_date}
                onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Mushahar ($, ikhtiyaari)</label>
              <input
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none"
              />
            </div>
          </div>
          <button onClick={submit} className="w-full py-2.5 rounded-lg bg-brand-green text-white text-sm font-medium mt-2">
            {staff ? "Kaydi Beddelka" : "Diiwaangeli Shaqaalaha"}
          </button>
        </div>
      </div>
    </div>
  );
}
