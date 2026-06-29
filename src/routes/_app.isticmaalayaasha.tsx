import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { Plus, X, UserCog, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/isticmaalayaasha")({
  component: UsersPage,
});

const ROLE_LABELS: Record<string, string> = {
  maamule: "Maamule (Admin)",
  macalin: "Macalin (Teacher)",
  maaliyadda: "Maaliyadda (Finance)",
};
const ROLE_COLORS: Record<string, string> = {
  maamule: "bg-primary/15 text-primary border-primary/30",
  macalin: "bg-brand-green/15 text-brand-green border-brand-green/30",
  maaliyadda: "bg-amber-100 text-amber-700 border-amber-300",
};

// Separate, non-persisting client so creating a new account never disturbs the admin's own session.
function getTempClient() {
  const url = import.meta.env.VITE_SUPABASE_URL || (process.env as any).SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || (process.env as any).SUPABASE_PUBLISHABLE_KEY;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function UsersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["app-users"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      const { data: staff } = await supabase.from("staff").select("user_id, full_name, email, department, contact");
      const staffByUser = new Map((staff || []).map((s: any) => [s.user_id, s]));
      return (roles || []).map((r: any) => ({
        user_id: r.user_id,
        role: r.role,
        ...(staffByUser.get(r.user_id) || {}),
      }));
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Isticmaalayaasha"
        breadcrumb="Maamulka akoonnada — Maamule, Macalin, Maaliyadda"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-green text-white text-sm font-medium shadow-sm hover:opacity-90"
          >
            <Plus className="size-4" /> Ku dar Isticmaale
          </button>
        }
      />

      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="size-4 text-primary" />
          <div className="font-semibold text-primary text-lg">Liiska Akoonnada</div>
        </div>
        {isLoading && <div className="text-sm text-muted-foreground text-center py-8">Soo dejinaya...</div>}
        <div className="space-y-2">
          {users.map((u: any) => (
            <div key={u.user_id} className="flex items-center justify-between p-3 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center">
                  <UserCog className="size-4.5" />
                </div>
                <div>
                  <div className="font-medium text-sm text-primary">{u.full_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email || u.contact || ""}</div>
                </div>
              </div>
              <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${ROLE_COLORS[u.role]}`}>
                {ROLE_LABELS[u.role] || u.role}
              </span>
            </div>
          ))}
          {!isLoading && users.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">Wax isticmaale ah lama helin.</div>
          )}
        </div>
      </div>

      {showForm && (
        <NewUserForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["app-users"] });
          }}
        />
      )}
    </div>
  );
}

function NewUserForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "macalin" as "maamule" | "macalin" | "maaliyadda",
    department: "",
    contact: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.full_name.trim() || !form.email.trim() || form.password.length < 6) {
      return toast.error("Buuxi magaca, email-ka, iyo password (ugu yaraan 6 xaraf)");
    }
    setBusy(true);
    try {
      const temp = getTempClient();
      const { data, error } = await temp.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name } },
      });
      if (error) throw error;
      const newUserId = data.user?.id;
      if (!newUserId) throw new Error("Akoonka lama abuuri karin");

      const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: newUserId, role: form.role });
      if (roleErr) throw roleErr;

      const { error: staffErr } = await supabase.from("staff").insert({
        user_id: newUserId,
        full_name: form.full_name,
        role: ROLE_LABELS[form.role],
        department: form.department || null,
        email: form.email,
        contact: form.contact || null,
      });
      if (staffErr) throw staffErr;

      toast.success("Akoonka cusub waa la sameeyay");
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Khalad ayaa dhacay");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-primary text-lg">Ku dar Isticmaale Cusub</div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Magaca Buuxa</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Iimaylka (Soo Gal)</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Furaha Sirta ah</label>
              <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="ugu yaraan 6 xaraf" className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Doorka (Role)</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1">
              <option value="macalin">Macalin (Teacher)</option>
              <option value="maaliyadda">Maaliyadda (Finance)</option>
              <option value="maamule">Maamule (Admin)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Waaxda (ikhtiyaari)</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Telefoon (ikhtiyaari)</label>
              <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm mt-1 outline-none" />
            </div>
          </div>
          <button disabled={busy} onClick={submit} className="w-full py-2.5 rounded-lg bg-brand-green text-white text-sm font-medium mt-2 disabled:opacity-60">
            {busy ? "Wuu samaynayaa..." : "Samee Akoonka"}
          </button>
        </div>
      </div>
    </div>
  );
}
