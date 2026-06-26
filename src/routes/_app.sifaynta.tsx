import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RotateCcw, Trash2, School } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sifaynta")({
  component: SifayntaPage,
});

function SifayntaPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Sifaynta & Settings" breadcrumb="Iskuduba iyo Recycle Bin" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center"><School className="size-6"/></div>
            <div>
              <div className="font-bold text-primary">Macluumaadka Dugsiga</div>
              <div className="text-xs text-muted-foreground">Faahfaahinta guud</div>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <Row k="Magaca" v="New Generation International School"/>
            <Row k="Nooca" v="Dugsi Buuxa (KG – Grade 12)"/>
            <Row k="Luqadda" v="Soomaali / Carabi / Ingiriis"/>
            <Row k="Sanad Dugsiyeed" v={String(new Date().getFullYear())}/>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm h-fit">
          <div className="font-bold text-primary mb-3">Doorka Isticmaalayaasha</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-3 rounded-lg bg-secondary"><span>Maamule</span><span className="text-xs text-brand-green font-medium">Awoodda Buuxda</span></div>
            <div className="flex justify-between p-3 rounded-lg bg-secondary"><span>Macalin</span><span className="text-xs text-primary font-medium">Buundo & Joogitaan</span></div>
          </div>
        </div>
        <div className="rounded-2xl bg-brand-green/5 border border-brand-green/20 p-6 shadow-sm h-fit">
          <div className="font-bold text-brand-green mb-2">Nidaamka wuu shaqeynayaa</div>
          <div className="text-xs text-muted-foreground">Dhammaan xogaha si nabad ah ayey ugu kaydsan yihiin Lovable Cloud. Soft-delete waxay u wareejisaa Recycle Bin, halkaas oo aad ka soo celin karto ama si dhammaystiran u tirin karto.</div>
        </div>
      </div>
      <RecycleBin />
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}:</span><span className="font-medium text-primary">{v}</span></div>;
}

function RecycleBin() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["deleted-items"],
    queryFn: async () => (await supabase.from("deleted_items").select("*").order("deleted_at", { ascending: false })).data || [],
  });

  const restore = async (item: any) => {
    const payload = { ...item.payload };
    delete payload.id; delete payload.created_at; delete payload.updated_at;
    if (item.table_name === "students") payload.is_active = true;
    const { error } = await supabase.from(item.table_name).insert(payload);
    if (error) return toast.error(error.message);
    await supabase.from("deleted_items").delete().eq("id", item.id);
    toast.success("Waa la soo celiyay");
    qc.invalidateQueries({ queryKey: ["deleted-items"] });
  };
  const hardDel = async (id: string) => {
    if (!confirm("Si dhammaystiran ma u tirayaa? Tani lama soo celin karo.")) return;
    await supabase.from("deleted_items").delete().eq("id", id);
    toast.success("Si dhammaystiran ayaa loo tiray");
    qc.invalidateQueries({ queryKey: ["deleted-items"] });
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-bold text-primary text-lg">Recycle Bin / Kustada Waxyaabihii la Tiray</div>
          <div className="text-xs text-muted-foreground">Soo celi waxyaabihii la tiray ama si dhammaystiran u tir.</div>
        </div>
        <div className="text-sm text-muted-foreground">Wadarta: <span className="font-bold text-primary">{(items as any[]).length}</span></div>
      </div>
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground uppercase border-b border-border">
          <tr><th className="text-left py-2">Nooca Xogta</th><th className="text-left py-2">Faahfaahin/Magaca</th><th className="text-left py-2">Taariikhda la Tiray</th><th className="text-left py-2">Qofkii Tiray</th><th className="text-right py-2">Talaabooyin</th></tr>
        </thead>
        <tbody>
          {(items as any[]).length === 0 && <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Kustadu way faaruq tahay.</td></tr>}
          {(items as any[]).map((i) => (
            <tr key={i.id} className="border-b border-border/60">
              <td className="py-2"><span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">{i.data_type}</span></td>
              <td className="py-2 font-medium text-primary">{i.display_name}</td>
              <td className="py-2 text-muted-foreground text-xs">{new Date(i.deleted_at).toLocaleString()}</td>
              <td className="py-2 text-muted-foreground">{i.deleted_by || "Maamule"}</td>
              <td className="py-2 text-right">
                <div className="inline-flex gap-1">
                  <button onClick={()=>restore(i)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-brand-green text-white text-xs"><RotateCcw className="size-3"/>Soo Celi</button>
                  <button onClick={()=>hardDel(i.id)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-rose-100 text-rose-700 text-xs hover:bg-rose-200"><Trash2 className="size-3"/>Tir Weligaa</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}