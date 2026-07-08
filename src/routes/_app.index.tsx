import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession, useRoles } from "@/hooks/use-auth";
import { useState } from "react";
import { Users, TrendingUp, TrendingDown, CalendarCheck, Phone, MapPin, UserPlus, Receipt, ClipboardList, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/")({ component: Dashboard });

// ── School info from docs ──────────────────────────────────────────────
const SCHOOL = {
  name: "New Generation International School",
  tel1: "+252 61 3 797373",
  tel2: "+252 61 7 222555",
  location: "Somalia – Mogadishu – Hodan, k.p.p",
};

function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard-v2"],
    queryFn: async () => {
      const thisMonth = new Date().toISOString().slice(0, 7);
      const today = new Date().toISOString().slice(0, 10);

      const [students, income, outcome, todayAttend, allStudents] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("tuition_payments").select("amount, payment_date").eq("paid", true).gte("payment_date", thisMonth + "-01"),
        supabase.from("expenses").select("amount, expense_date, category").gte("expense_date", thisMonth + "-01"),
        supabase.from("attendance").select("status").eq("attendance_date", today),
        supabase.from("students").select("grade_level, program_quran, program_boarding, program_xanaano").eq("is_active", true),
      ]);

      const totalIncome = (income.data || []).reduce((s, r) => s + Number(r.amount), 0);
      const totalOutcome = (outcome.data || []).reduce((s, r) => s + Number(r.amount), 0);
      const present = (todayAttend.data || []).filter((a: any) => a.status === "present").length;
      const absent = (todayAttend.data || []).filter((a: any) => a.status !== "present").length;

      // Monthly income trend (last 6 months)
      const trend: Record<string, number> = {};
      const months: string[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toISOString().slice(0, 7);
        months.push(key);
        trend[key] = 0;
      }
      (income.data || []).forEach((r: any) => {
        const m = r.payment_date?.slice(0, 7);
        if (m && trend[m] !== undefined) trend[m] += Number(r.amount);
      });
      const incomeTrend = months.map(m => ({
        month: new Date(m + "-01").toLocaleString("en", { month: "short" }),
        income: trend[m] || 0,
      }));

      // Expense by category
      const expCat: Record<string, number> = {};
      (outcome.data || []).forEach((r: any) => { expCat[r.category] = (expCat[r.category] || 0) + Number(r.amount); });
      const expChart = Object.entries(expCat).map(([name, value]) => ({ name, value }));

      // Students by grade
      const byGrade: Record<string, number> = {};
      (allStudents.data || []).forEach((s: any) => {
        const g = s.grade_level === 0 ? "KG" : `F${s.grade_level}`;
        byGrade[g] = (byGrade[g] || 0) + 1;
      });
      const gradeChart = Object.entries(byGrade).sort((a,b)=>a[0].localeCompare(b[0])).map(([name, value]) => ({ name, value }));

      // Programs
      const programs = [
        { name: "Qur'aan", value: (allStudents.data || []).filter((s:any) => s.program_quran).length },
        { name: "Xanaano", value: (allStudents.data || []).filter((s:any) => s.program_xanaano).length },
        { name: "Boarding", value: (allStudents.data || []).filter((s:any) => s.program_boarding).length },
      ].filter(p => p.value > 0);

      return {
        totalStudents: students.count || 0,
        totalIncome,
        totalOutcome,
        net: totalIncome - totalOutcome,
        present,
        absent,
        totalAttend: present + absent,
        incomeTrend,
        expChart,
        gradeChart,
        programs,
      };
    },
  });
}

const COLORS = ["#1A237E", "#2E7D32", "#F59E0B", "#DC2626", "#7C3AED", "#0891B2"];

function KPICard({ label, value, sub, icon: Icon, accent, trend }: any) {
  return (
    <div className={`rounded-2xl bg-card border p-5 shadow-sm relative overflow-hidden ${accent === "red" ? "border-rose-200" : accent === "green" ? "border-brand-green/20" : accent === "amber" ? "border-amber-200" : "border-border"}`}>
      <div className={`absolute -top-8 -right-8 size-28 rounded-full opacity-[0.07] ${accent === "red" ? "bg-rose-500" : accent === "green" ? "bg-brand-green" : accent === "amber" ? "bg-amber-500" : "bg-primary"}`} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground font-medium">{label}</div>
          <div className={`text-2xl font-bold mt-1 ${accent === "red" ? "text-rose-700" : accent === "green" ? "text-brand-green" : "text-primary"}`}>{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
        </div>
        <div className={`size-12 rounded-2xl grid place-items-center shadow-sm ${accent === "red" ? "bg-rose-500" : accent === "green" ? "bg-brand-green" : accent === "amber" ? "bg-amber-500" : "bg-primary"}`}>
          <Icon className="size-6 text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`mt-3 text-xs flex items-center gap-1 ${trend >= 0 ? "text-brand-green" : "text-rose-600"}`}>
          {trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(trend)}% bishaan
        </div>
      )}
    </div>
  );
}

function AttendanceCaller() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: students = [] } = useQuery({
    queryKey: ["att-students"],
    queryFn: async () => (await supabase.from("students").select("id, full_name, grade_level").eq("is_active", true).order("full_name")).data || [],
  });
  const { data: existing = [] } = useQuery({
    queryKey: ["att-today", today],
    queryFn: async () => (await supabase.from("attendance").select("student_id, status").eq("attendance_date", today)).data || [],
  });

  const attMap: Record<string, string> = {};
  (existing as any[]).forEach(a => { attMap[a.student_id] = a.status; });
  const [marks, setMarks] = useState<Record<string, string>>({});
  const combined = { ...attMap, ...marks };

  const mark = (id: string, status: string) => setMarks(m => ({ ...m, [id]: status }));

  const save = async () => {
    const rows = Object.entries(marks).map(([student_id, status]) => ({
      student_id, status, attendance_date: today,
      grade_level: (students as any[]).find(s => s.id === student_id)?.grade_level,
    }));
    if (!rows.length) return toast.error("Wax la calaamadayn karo ma jiraan");
    const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,attendance_date" });
    if (error) return toast.error(error.message);
    toast.success(`${rows.length} arday waa la diiwaangaliyay`);
    setMarks({});
    qc.invalidateQueries({ queryKey: ["att-today"] });
    qc.invalidateQueries({ queryKey: ["dashboard-v2"] });
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-primary flex items-center gap-2"><CalendarCheck className="size-4" /> Yeeris Maanta — {today}</div>
        <button onClick={save} className="px-4 py-1.5 rounded-lg bg-brand-green text-white text-xs font-medium">Kaydi Yeeriska</button>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        {(students as any[]).map(s => {
          const status = combined[s.id] || "";
          return (
            <div key={s.id} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-secondary/40">
              <div className="text-sm font-medium text-primary truncate">{s.full_name}</div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => mark(s.id, "present")} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${status === "present" ? "bg-brand-green text-white" : "bg-secondary text-muted-foreground hover:bg-brand-green/20"}`}>
                  <CheckCircle2 className="size-3" /> Jooga
                </button>
                <button onClick={() => mark(s.id, "absent")} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${status === "absent" ? "bg-rose-500 text-white" : "bg-secondary text-muted-foreground hover:bg-rose-100"}`}>
                  <XCircle className="size-3" /> Maqan
                </button>
                <button onClick={() => mark(s.id, "late")} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${status === "late" ? "bg-amber-500 text-white" : "bg-secondary text-muted-foreground hover:bg-amber-100"}`}>
                  <Clock className="size-3" /> Dib
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuthSession();
  const { primary } = useRoles(user?.id);
  const { data, isLoading } = useDashboardData();
  const isMaamule = primary === "maamule";
  const isMaaliyadda = primary === "maaliyadda";
  const isMacalin = primary === "macalin";

  return (
    <div className="space-y-6">
      {/* School header / branding */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-bold text-xl">{SCHOOL.name}</div>
          <div className="flex items-center gap-4 mt-1.5 text-white/80 text-xs flex-wrap gap-y-1">
            <span className="flex items-center gap-1"><Phone className="size-3" /> {SCHOOL.tel1} · {SCHOOL.tel2}</span>
            <span className="flex items-center gap-1"><MapPin className="size-3" /> {SCHOOL.location}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/70">Doorkaaga</div>
          <div className="font-semibold capitalize">{primary === "maamule" ? "Maamule Guud" : primary === "maaliyadda" ? "Maaliyadda" : "Macalin"}</div>
        </div>
      </div>

      {/* KPI cards — role based */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(isMaamule || isMacalin) && (
          <KPICard label="Wadarta Ardayda" value={isLoading ? "..." : data?.totalStudents} sub="ardayda firfircoon" icon={Users} />
        )}
        {(isMaamule || isMaaliyadda) && (
          <KPICard label="Income Bishaan" value={isLoading ? "..." : `$${(data?.totalIncome || 0).toLocaleString()}`} sub="lacag la helay" icon={TrendingUp} accent="green" trend={12} />
        )}
        {(isMaamule || isMaaliyadda) && (
          <KPICard label="Outcome Bishaan" value={isLoading ? "..." : `$${(data?.totalOutcome || 0).toLocaleString()}`} sub="kharashaad" icon={TrendingDown} accent="red" />
        )}
        {(isMaamule || isMacalin) && (
          <KPICard
            label="Imaanshaha Maanta"
            value={isLoading ? "..." : `${data?.present || 0} / ${data?.totalAttend || 0}`}
            sub={`${data?.absent || 0} arday maqan`}
            icon={CalendarCheck}
            accent="amber"
          />
        )}
        {isMaamule && (
          <KPICard label="Net Bishaan" value={isLoading ? "..." : `$${(data?.net || 0).toLocaleString()}`} sub="dakhli − kharash" icon={Receipt} accent={data?.net && data.net >= 0 ? "green" : "red"} />
        )}
      </div>

      {/* Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick actions */}
          {(isMaamule || isMacalin) && (
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
              <div className="font-semibold text-primary mb-3">Tallaabooyin Degdeg ah</div>
              <div className="grid grid-cols-3 gap-3">
                <Link to="/ardayda" className="rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 p-4 text-center transition">
                  <UserPlus className="size-7 mx-auto text-primary mb-1.5" />
                  <div className="font-semibold text-primary text-xs">+ Diiwaangeli Arday</div>
                </Link>
                {(isMaamule || isMaaliyadda) && (
                  <Link to="/maaliyadda" className="rounded-xl border-2 border-dashed border-brand-green/30 hover:border-brand-green hover:bg-brand-green/5 p-4 text-center transition">
                    <Receipt className="size-7 mx-auto text-brand-green mb-1.5" />
                    <div className="font-semibold text-brand-green text-xs">+ Log Expense</div>
                  </Link>
                )}
                <Link to="/imtixaanada" className="rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-500 hover:bg-amber-50 p-4 text-center transition">
                  <ClipboardList className="size-7 mx-auto text-amber-600 mb-1.5" />
                  <div className="font-semibold text-amber-700 text-xs">Imtixaan Cusub</div>
                </Link>
              </div>
            </div>
          )}

          {/* Income trend chart — Maamule & Maaliyadda only */}
          {(isMaamule || isMaaliyadda) && (
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
              <div className="font-semibold text-primary mb-3">📈 Income Trend — 6 Bilood</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.incomeTrend || []} margin={{ left: -20, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: any) => [`$${v}`, "Income"]} />
                    <Area type="monotone" dataKey="income" stroke="#2E7D32" fill="url(#incG)" strokeWidth={2.5} dot={{ fill: "#2E7D32", r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Students by grade — Maamule & Macalin */}
          {(isMaamule || isMacalin) && (
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
              <div className="font-semibold text-primary mb-3">🏫 Ardayda Fasalka kasta</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.gradeChart || []} margin={{ left: -20, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1A237E" radius={[6,6,0,0]} name="Arday" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Expense by category — Maamule & Maaliyadda */}
          {(isMaamule || isMaaliyadda) && (data?.expChart || []).length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
              <div className="font-semibold text-primary mb-3">💸 Kharashaadka Noocyadiisa</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data?.expChart || []} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {(data?.expChart || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`$${v}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Right col: Attendance caller + programs */}
        <div className="space-y-6">
          {(isMaamule || isMacalin) && <AttendanceCaller />}

          {/* Programs donut */}
          {isMaamule && (data?.programs || []).length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
              <div className="font-semibold text-primary mb-3">📚 Barnaamijyada</div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data?.programs || []} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" nameKey="name">
                      {(data?.programs || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Net summary card — Maamule only */}
          {isMaamule && (
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-brand-green/10 border border-primary/20 p-5 shadow-sm">
              <div className="font-semibold text-primary mb-3">💼 Guudmar Maaliyadeed Bishaan</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Income:</span><span className="font-semibold text-brand-green">${(data?.totalIncome||0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Outcome:</span><span className="font-semibold text-rose-600">−${(data?.totalOutcome||0).toLocaleString()}</span></div>
                <div className="border-t border-border pt-2 flex justify-between"><span className="font-semibold text-primary">Net:</span><span className={`font-bold text-lg ${(data?.net||0) >= 0 ? "text-brand-green" : "text-rose-600"}`}>${(data?.net||0).toLocaleString()}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
