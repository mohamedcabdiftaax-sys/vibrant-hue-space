import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/use-auth";
import { useState } from "react";
import { FileText, Printer, Download, Sparkles, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({ component: ReportsPage });

const REPORT_TYPES = [
  { key: "ardayda_guud", label: "Warbixinta Ardayda Guud", icon: "👥" },
  { key: "imtixaanada", label: "Warbixinta Imtixaanada", icon: "📝" },
  { key: "maaliyadda", label: "Warbixinta Maaliyadda", icon: "💰" },
  { key: "imaanshaha", label: "Warbixinta Imaanshaha", icon: "📅" },
  { key: "dacwooyin", label: "Warbixinta Dacwooyinka", icon: "⚠️" },
  { key: "shaqaalaha", label: "Warbixinta Shaqaalaha", icon: "👨‍🏫" },
];

function ReportsPage() {
  const qc = useQueryClient();
  const { user } = useAuthSession();
  const [generating, setGenerating] = useState<string | null>(null);
  const [viewing, setViewing] = useState<any | null>(null);

  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => (await supabase.from("reports").select("*").order("created_at", { ascending: false })).data || [],
  });

  const generate = async (type: string, label: string) => {
    setGenerating(type);
    try {
      // Fetch data for this report type
      let data: any = {};
      if (type === "ardayda_guud") {
        const { data: students } = await supabase.from("students").select("*").eq("is_active", true).order("full_name");
        data = { students };
      } else if (type === "imtixaanada") {
        const { data: exams } = await supabase.from("exam_scores").select("*, students(full_name, grade_level)").order("exam_date", { ascending: false }).limit(50);
        data = { exams };
      } else if (type === "maaliyadda") {
        const { data: payments } = await supabase.from("tuition_payments").select("*, students(full_name, grade_level)").order("payment_date", { ascending: false }).limit(50);
        const { data: expenses } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false }).limit(20);
        data = { payments, expenses };
      } else if (type === "dacwooyin") {
        const { data: incidents } = await supabase.from("incidents").select("*, students(full_name, grade_level)").order("incident_date", { ascending: false });
        data = { incidents };
      } else if (type === "shaqaalaha") {
        const { data: staff } = await supabase.from("staff").select("*").eq("is_active", true).order("full_name");
        data = { staff };
      }

      const apiKey = (import.meta as any).env?.VITE_ANTHROPIC_KEY;
      // Call AI to generate report
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "", "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: `Waxaad tahay AI ah oo sameysa warbixin rasmi ah oo Soomaali ah oo loogu talagalay "New Generation International School" Mogadishu. Samee warbixin ${label} oo faahfaahsan, kuna bilow cinwaanka dugsiga iyo taariikhda. Isticmaal xogtan: ${JSON.stringify(data).slice(0, 3000)}. Jawaabtu waa HTML-ka buuxa oo leh style, aad u qurxoon, oo daabacan karaan. Isticmaal midab navy (#1A237E) iyo cagaar (#2E7D32). Ha ku darin code blocks.`
          }]
        })
      });

      let content = "";
      if (res.ok) {
        const result = await res.json();
        content = result.content?.[0]?.text || "";
      } else {
        // Fallback: generate simple HTML report without AI
        content = generateSimpleReport(label, data, type);
      }

      const { data: saved, error } = await supabase.from("reports").insert({
        title: `${label} — ${new Date().toLocaleDateString("so-SO")}`,
        report_type: type,
        content,
        generated_by: user?.id,
      }).select().single();
      if (error) throw error;
      toast.success("Warbixinta waa la sameeyay");
      qc.invalidateQueries({ queryKey: ["reports"] });
      setViewing(saved);
    } catch (err: any) {
      toast.error("Khalad: " + err.message);
    } finally {
      setGenerating(null);
    }
  };

  const printReport = (report: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(report.content);
    w.document.close();
    w.onload = () => w.print();
  };

  const downloadReport = (report: any) => {
    const blob = new Blob([report.content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.title}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteReport = async (id: string) => {
    await supabase.from("reports").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["reports"] });
    if (viewing?.id === id) setViewing(null);
  };

  if (viewing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewing(null)} className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-secondary">← Dib u noqo</button>
          <div className="font-semibold text-primary flex-1">{viewing.title}</div>
          <button onClick={() => printReport(viewing)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm hover:bg-secondary"><Printer className="size-4" /> Daabac</button>
          <button onClick={() => downloadReport(viewing)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"><Download className="size-4" /> Dejiso</button>
        </div>
        <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
          <iframe srcDoc={viewing.content} className="w-full min-h-[600px] border-0" title="Warbixinta" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Warbixinnada" breadcrumb="Samee oo daabac warbixinnada dugsiga — AI-powered" actions={
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary"><Printer className="size-4" /> Daabac Bogga</button>
      } />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {REPORT_TYPES.map(rt => (
          <button key={rt.key} onClick={() => generate(rt.key, rt.label)} disabled={!!generating} className="rounded-2xl bg-card border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 p-5 text-center transition group disabled:opacity-60 disabled:cursor-not-allowed">
            <div className="text-3xl mb-2">{rt.icon}</div>
            <div className="font-semibold text-primary text-sm">{rt.label}</div>
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
              {generating === rt.key ? <><Loader2 className="size-3 animate-spin" /> Wuu samaynayaa...</> : <><Sparkles className="size-3" /> AI-ka samee</>}
            </div>
          </button>
        ))}
      </div>

      {(reports as any[]).length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4 flex items-center gap-2"><FileText className="size-4" /> Warbixinnada Hore</div>
          <div className="space-y-2">
            {(reports as any[]).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/40 transition">
                <button onClick={() => setViewing(r)} className="text-left flex-1">
                  <div className="font-medium text-sm text-primary">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("so-SO")}</div>
                </button>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => printReport(r)} className="p-1.5 rounded hover:bg-secondary"><Printer className="size-4 text-muted-foreground" /></button>
                  <button onClick={() => downloadReport(r)} className="p-1.5 rounded hover:bg-secondary"><Download className="size-4 text-muted-foreground" /></button>
                  <button onClick={() => deleteReport(r.id)} className="p-1.5 rounded hover:bg-rose-50"><Trash2 className="size-4 text-rose-500" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function generateSimpleReport(label: string, data: any, type: string): string {
  const date = new Date().toLocaleDateString("so-SO");
  let body = "";

  if (type === "ardayda_guud" && data.students) {
    body = `<table style="width:100%;border-collapse:collapse;margin-top:16px">
      <tr style="background:#1A237E;color:white"><th style="padding:8px;text-align:left">Lambarka</th><th style="padding:8px;text-align:left">Magaca</th><th style="padding:8px">Fasalka</th><th style="padding:8px">Tel.</th></tr>
      ${data.students.map((s: any, i: number) => `<tr style="background:${i%2===0?"#f9f9f9":"white"}"><td style="padding:8px;border-bottom:1px solid #eee">${s.student_number||""}</td><td style="padding:8px;border-bottom:1px solid #eee">${s.full_name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${s.grade_level===0?"Xanaano":"F-"+s.grade_level}</td><td style="padding:8px;border-bottom:1px solid #eee">${s.contact_primary||"—"}</td></tr>`).join("")}
    </table>
    <p style="margin-top:12px;color:#555">Wadarta Ardayda: <strong>${data.students.length}</strong></p>`;
  } else if (type === "maaliyadda" && data.payments) {
    const total = (data.payments||[]).reduce((s: number, p: any) => p.paid ? s+Number(p.amount) : s, 0);
    const exp = (data.expenses||[]).reduce((s: number, e: any) => s+Number(e.amount), 0);
    body = `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:16px">
      <div style="background:#E8F5E9;border-radius:8px;padding:16px;text-align:center"><div style="font-size:24px;font-weight:bold;color:#2E7D32">$${total.toLocaleString()}</div><div style="color:#555;font-size:12px">Lacag La Helay</div></div>
      <div style="background:#FDE8E8;border-radius:8px;padding:16px;text-align:center"><div style="font-size:24px;font-weight:bold;color:#DC2626">$${exp.toLocaleString()}</div><div style="color:#555;font-size:12px">Kharashaadka</div></div>
      <div style="background:#E8EAF6;border-radius:8px;padding:16px;text-align:center"><div style="font-size:24px;font-weight:bold;color:#1A237E">$${(total-exp).toLocaleString()}</div><div style="color:#555;font-size:12px">Net</div></div>
    </div>`;
  } else {
    body = `<p style="color:#555;margin-top:16px">Xog: ${JSON.stringify(data).slice(0,500)}...</p>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${label}</title>
  <style>body{font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:24px}h1{color:#1A237E}h3{color:#2E7D32}th{background:#1A237E;color:white;padding:8px;text-align:left}td{padding:8px;border-bottom:1px solid #eee}table{width:100%;border-collapse:collapse}@media print{body{padding:0}}</style>
  </head><body>
  <div style="text-align:center;border-bottom:3px solid #1A237E;padding-bottom:16px;margin-bottom:24px">
    <h1 style="margin:0">New Generation International School</h1>
    <h2 style="color:#2E7D32;margin:8px 0">${label}</h2>
    <p style="color:#777;margin:4px 0">Taariikhda: ${date} | Mogadishu, Somalia</p>
  </div>
  ${body}
  <div style="margin-top:48px;border-top:1px solid #ddd;padding-top:16px;text-align:right;color:#777;font-size:12px">
    Maamulka Dugsiga — New Generation International School<br>
    Warbixintan waxaa sameeyay nidaamka maamulka dugsiga
  </div>
  </body></html>`;
}
