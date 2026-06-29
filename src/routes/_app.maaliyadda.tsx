import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Plus, Receipt, Trash2, Download, CheckCircle2, FileSpreadsheet, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/_app/maaliyadda")({
  component: MaaliyaddaPage,
});

const CATEGORIES = ["Mushaharka", "Agabka", "Korontada", "Biyaha", "Gaadiidka", "Cunto", "Dayactir", "Kale"];

function MaaliyaddaPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Maaliyadda & Kharashka" breadcrumb="Lacagaha & Kharashaadka Dugsiga" />
      <DailyCollectionSection />
      <TuitionSection />
      <ExpensesSection />
    </div>
  );
}

function downloadCSV(filename: string, rows: any[], headers: string[]) {
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildReceiptPDF(payment: any) {
  const doc = new jsPDF({ unit: "mm", format: [100, 150] });
  doc.setFontSize(13);
  doc.setTextColor(26, 35, 126);
  doc.text("New Generation International School", 50, 14, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text("Risiidh Lacag-bixin / Payment Receipt", 50, 20, { align: "center" });
  doc.setDrawColor(26, 35, 126);
  doc.line(8, 24, 92, 24);

  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  const rows: [string, string][] = [
    ["Magaca Ardayga", payment.student_name],
    ["Bisha", payment.month],
    ["Taariikhda", payment.payment_date],
    ["Risiidh #", payment.id?.slice(0, 8) || "—"],
  ];
  let y = 34;
  rows.forEach(([k, v]) => {
    doc.setTextColor(110, 110, 110);
    doc.text(k + ":", 10, y);
    doc.setTextColor(20, 20, 20);
    doc.text(String(v), 90, y, { align: "right" });
    y += 7;
  });
  doc.setDrawColor(220, 220, 220);
  doc.line(8, y, 92, y);
  y += 9;
  doc.setFontSize(13);
  doc.setTextColor(46, 125, 50);
  doc.text("Wadarta:", 10, y);
  doc.text(`$${payment.amount}`, 90, y, { align: "right" });
  y += 14;
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("Mahadsanid! — Maamulka Dugsiga", 50, y, { align: "center" });
  doc.save(`risiidh-${payment.student_name}-${payment.month}.pdf`);
}

function DailyCollectionSection() {
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  const { data: rows = [] } = useQuery({
    queryKey: ["daily-collection", day],
    queryFn: async () =>
      (
        await supabase
          .from("tuition_payments")
          .select("*, students(full_name, grade_level)")
          .eq("payment_date", day)
          .eq("paid", true)
      ).data || [],
  });
  const total = (rows as any[]).reduce((s, r) => s + Number(r.amount || 0), 0);

  const exportCSV = () => {
    const data = (rows as any[]).map((r) => ({
      Arday: r.students?.full_name || "",
      Fasal: r.students?.grade_level ?? "",
      Lacag: r.amount,
      Bil: r.month,
      Taariikh: r.payment_date,
    }));
    downloadCSV(`lacagaha-${day}.csv`, data, ["Arday", "Fasal", "Lacag", "Bil", "Taariikh"]);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" />
          <div className="font-semibold text-primary text-lg">Lacagaha la Diiwaangaliyay Maalintaas</div>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary text-sm" />
          <button onClick={exportCSV} disabled={rows.length === 0} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50">
            <FileSpreadsheet className="size-3.5" /> Dejiso CSV
          </button>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground uppercase border-b border-border">
          <tr>
            <th className="text-left py-2">Arday</th>
            <th className="text-left py-2">Fasal</th>
            <th className="text-left py-2">Bil</th>
            <th className="text-right py-2">Lacag</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Wax lacag ah lama diiwaangelin maalintan.</td></tr>
          )}
          {(rows as any[]).map((r) => (
            <tr key={r.id} className="border-b border-border/60">
              <td className="py-2 font-medium text-primary">{r.students?.full_name}</td>
              <td className="py-2 text-muted-foreground">F-{r.students?.grade_level}</td>
              <td className="py-2 text-muted-foreground">{r.month}</td>
              <td className="py-2 text-right font-semibold">${Number(r.amount).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
        {rows.length > 0 && (
          <tfoot>
            <tr className="border-t-2 border-border">
              <td colSpan={3} className="py-2 text-right font-semibold text-primary">Wadarta Maalintan:</td>
              <td className="py-2 text-right font-bold text-brand-green">${total.toLocaleString()}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function TuitionSection() {
  const qc = useQueryClient();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [receipt, setReceipt] = useState<any | null>(null);

  const { data: students = [] } = useQuery({
    queryKey: ["tui-students"],
    queryFn: async () => (await supabase.from("students").select("id, full_name, grade_level").eq("is_active", true).order("full_name")).data || [],
  });
  const { data: payments = [] } = useQuery({
    queryKey: ["payments", month],
    queryFn: async () => (await supabase.from("tuition_payments").select("*").eq("month", month)).data || [],
  });
  const payByStudent: Record<string, any> = {};
  (payments as any[]).forEach((p) => { payByStudent[p.student_id] = p; });

  const markPaid = async (sid: string, name: string) => {
    const amount = Number(prompt(`Lacagta la bixiyay ${name}:`, "50") || 0);
    if (!amount) return;
    const row = { student_id: sid, amount, paid: true, payment_date: new Date().toISOString().slice(0, 10), month };
    const { data, error } = await supabase.from("tuition_payments").insert(row).select().single();
    if (error) return toast.error(error.message);
    toast.success("Lacagta waa la diiwaangaliyay");
    qc.invalidateQueries({ queryKey: ["payments", month] });
    qc.invalidateQueries({ queryKey: ["daily-collection"] });
    setReceipt({ ...data, student_name: name });
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-primary text-lg">Tuition / Lacagta Dugsiga</div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary text-sm" />
      </div>
      <table className="w-full text-sm">
        <thead className="text-xs text-muted-foreground uppercase border-b border-border">
          <tr><th className="text-left py-2">Magaca</th><th className="text-left py-2">Fasal</th><th className="text-left py-2">Xaalada</th><th className="text-left py-2">Lacag</th><th className="text-right py-2">Talaabo</th></tr>
        </thead>
        <tbody>
          {(students as any[]).map((s) => {
            const p = payByStudent[s.id];
            return (
              <tr key={s.id} className="border-b border-border/60">
                <td className="py-2 font-medium text-primary">{s.full_name}</td>
                <td className="py-2 text-muted-foreground">F-{s.grade_level}</td>
                <td className="py-2">
                  {p?.paid
                    ? <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-green/15 text-brand-green inline-flex items-center gap-1"><CheckCircle2 className="size-3" />La Bixiyay</span>
                    : <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700">Resto / Waa Lagu Leeyahay</span>}
                </td>
                <td className="py-2 font-semibold text-primary">{p ? `$${p.amount}` : "—"}</td>
                <td className="py-2 text-right">
                  {p?.paid
                    ? <button onClick={() => setReceipt({ ...p, student_name: s.full_name })} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-primary text-primary-foreground text-xs"><Receipt className="size-3" />Arki Risiidh</button>
                    : <button onClick={() => markPaid(s.id, s.full_name)} className="inline-flex items-center gap-1 px-3 py-1 rounded bg-brand-green text-white text-xs"><Plus className="size-3" />Diiwaangeli</button>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {receipt && <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function ReceiptModal({ payment, onClose }: { payment: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-black">
        <div className="text-center border-b-2 border-primary pb-4 mb-4">
          <div className="font-bold text-primary text-lg">New Generation International School</div>
          <div className="text-xs text-muted-foreground">Risiidh Lacag-bixin</div>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="Magaca Ardayga" value={payment.student_name} />
          <Row label="Bisha" value={payment.month} />
          <Row label="Taariikhda" value={payment.payment_date} />
          <Row label="Wadarta" value={`$${payment.amount}`} bold />
        </div>
        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">Mahadsanid! — Maamulka Dugsiga</div>
        <div className="mt-6 flex gap-2">
          <button onClick={() => buildReceiptPDF(payment)} className="flex-1 py-2 rounded-lg bg-brand-green text-white text-sm inline-flex items-center justify-center gap-2"><Download className="size-4" />Dejiso PDF</button>
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm">Xir</button>
        </div>
      </div>
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}:</span><span className={bold ? "font-bold text-primary" : ""}>{value}</span></div>;
}

function ExpensesSection() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ item_name: "", category: CATEGORIES[0], amount: 0, expense_date: new Date().toISOString().slice(0, 10), notes: "" });
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => (await supabase.from("expenses").select("*").order("expense_date", { ascending: false })).data || [],
  });
  const total = (expenses as any[]).reduce((s, e) => s + Number(e.amount), 0);

  const add = async () => {
    if (!form.item_name || !form.amount) return toast.error("Buuxi magaca iyo lacagta");
    const { error } = await supabase.from("expenses").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Kharashka waa la kaydiyay");
    setForm({ item_name: "", category: CATEGORIES[0], amount: 0, expense_date: new Date().toISOString().slice(0, 10), notes: "" });
    qc.invalidateQueries({ queryKey: ["expenses"] });
  };
  const del = async (e: any) => {
    if (!confirm("Ma hubtaa?")) return;
    await supabase.from("deleted_items").insert({ data_type: "Kharash", display_name: e.item_name, table_name: "expenses", payload: e });
    await supabase.from("expenses").delete().eq("id", e.id);
    toast.success("La tiray");
    qc.invalidateQueries({ queryKey: ["expenses"] });
  };
  const exportExpenses = () => {
    downloadCSV("kharashyada.csv", expenses as any[], ["expense_date", "item_name", "category", "amount", "notes"]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="rounded-2xl bg-card border border-border p-5 shadow-sm h-fit">
        <div className="font-semibold text-primary mb-3">+ Kharash Cusub</div>
        <div className="space-y-3">
          <input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} placeholder="Magaca Alaabta/Adeega" className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="Lacagta" className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
          <input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm" />
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Faahfaahin (ikhtiyaari)" rows={2} className="w-full px-3 py-2 rounded-lg bg-secondary text-sm outline-none" />
          <button onClick={add} className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-green text-white font-medium text-sm"><Plus className="size-4" />Kaydi Kharashka</button>
        </div>
      </div>
      <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold text-primary">Diiwaanka Kharashka</div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">Wadarta: <span className="font-bold text-primary">${total.toLocaleString()}</span></div>
            <button onClick={exportExpenses} disabled={expenses.length === 0} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"><FileSpreadsheet className="size-3.5" />CSV</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase border-b border-border">
            <tr><th className="text-left py-2">Taariikh</th><th className="text-left py-2">Alaab/Adeeg</th><th className="text-left py-2">Qaybta</th><th className="text-right py-2">Lacag</th><th></th></tr>
          </thead>
          <tbody>
            {(expenses as any[]).length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">Wax kharashaad ah lama gelin weli.</td></tr>}
            {(expenses as any[]).map((e) => (
              <tr key={e.id} className="border-b border-border/60">
                <td className="py-2 text-muted-foreground">{e.expense_date}</td>
                <td className="py-2 font-medium text-primary">{e.item_name}</td>
                <td className="py-2"><span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">{e.category}</span></td>
                <td className="py-2 text-right font-semibold">${Number(e.amount).toLocaleString()}</td>
                <td className="py-2 text-right"><button onClick={() => del(e)} className="p-1.5 rounded hover:bg-rose-50 text-rose-600"><Trash2 className="size-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
