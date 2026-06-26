import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Bus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/gaadiidka")({
  component: GaadiidkaPage,
});

function GaadiidkaPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ route_name: "", bus_number: "", driver_name: "", driver_phone: "" });
  const [selected, setSelected] = useState<string | null>(null);

  const { data: routes = [] } = useQuery({
    queryKey: ["bus-routes"],
    queryFn: async () => (await supabase.from("bus_routes").select("*").order("route_name")).data || [],
  });
  const { data: riders = [] } = useQuery({
    queryKey: ["bus-riders", selected],
    queryFn: async () => {
      if (!selected) return [];
      const route = (routes as any[]).find((r) => r.id === selected);
      if (!route) return [];
      const { data } = await supabase.from("students").select("id, full_name, grade_level, contact_primary, home_address, bus_route, bus_number").eq("is_active", true).eq("uses_bus", true).eq("bus_route", route.route_name);
      return data || [];
    },
    enabled: !!selected,
  });

  const addRoute = async () => {
    if (!form.route_name.trim()) return toast.error("Magaca khadka waa lagama maarmaan");
    const { error } = await supabase.from("bus_routes").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Khad cusub waa la abuuray");
    setForm({ route_name: "", bus_number: "", driver_name: "", driver_phone: "" });
    qc.invalidateQueries({ queryKey: ["bus-routes"] });
  };
  const delRoute = async (id: string, name: string) => {
    if (!confirm("Ma hubtaa?")) return;
    await supabase.from("deleted_items").insert({ data_type: "Khadka Bus", display_name: name, table_name: "bus_routes", payload: (routes as any[]).find((r) => r.id === id) });
    await supabase.from("bus_routes").delete().eq("id", id);
    toast.success("La tiray");
    qc.invalidateQueries({ queryKey: ["bus-routes"] });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Gaadiidka & Bus-ka" breadcrumb="Khadadka Bus-ka iyo Raacayaasha" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
            <div className="font-semibold text-primary mb-3">Khadadka Bus-ka</div>
            <div className="space-y-2">
              {(routes as any[]).length === 0 && <div className="text-sm text-muted-foreground text-center py-4">Wax khadad ah ma jiraan weli.</div>}
              {(routes as any[]).map((r) => (
                <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${selected === r.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"} cursor-pointer`} onClick={() => setSelected(r.id)}>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-brand-green/15 text-brand-green grid place-items-center"><Bus className="size-5" /></div>
                    <div>
                      <div className="font-semibold text-primary text-sm">{r.route_name}</div>
                      <div className="text-xs text-muted-foreground">Bus #{r.bus_number || "—"} • Darawal: {r.driver_name || "—"} • {r.driver_phone || ""}</div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); delRoute(r.id, r.route_name); }} className="p-1.5 rounded hover:bg-rose-50 text-rose-600"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {selected && (
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
              <div className="font-semibold text-primary mb-3">Liiska Raacayaasha</div>
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase border-b border-border">
                  <tr><th className="text-left py-2">Magaca</th><th className="text-left py-2">Fasal</th><th className="text-left py-2">Tel</th><th className="text-left py-2">Cinwaan</th></tr>
                </thead>
                <tbody>
                  {(riders as any[]).length === 0 && <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Wax raacayaal ah lama helin.</td></tr>}
                  {(riders as any[]).map((s) => (
                    <tr key={s.id} className="border-b border-border/60">
                      <td className="py-2 font-medium text-primary">{s.full_name}</td>
                      <td className="py-2 text-muted-foreground">F-{s.grade_level}</td>
                      <td className="py-2 text-muted-foreground">{s.contact_primary || "—"}</td>
                      <td className="py-2 text-muted-foreground text-xs">{s.home_address || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm h-fit">
          <div className="font-semibold text-primary mb-3">+ Khad Cusub</div>
          <div className="space-y-3">
            <input value={form.route_name} onChange={(e) => setForm({ ...form, route_name: e.target.value })} placeholder="Magaca Khadka" className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
            <input value={form.bus_number} onChange={(e) => setForm({ ...form, bus_number: e.target.value })} placeholder="Nambarka Bus-ka" className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
            <input value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} placeholder="Magaca Darawalka" className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
            <input value={form.driver_phone} onChange={(e) => setForm({ ...form, driver_phone: e.target.value })} placeholder="Telefoonka" className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
            <button onClick={addRoute} className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-green text-white font-medium text-sm"><Plus className="size-4" />Abuur Khad</button>
          </div>
        </div>
      </div>
    </div>
  );
}