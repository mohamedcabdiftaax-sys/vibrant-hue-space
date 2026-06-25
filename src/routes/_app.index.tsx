import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/dashboard-layout";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GraduationCap, Users, Wallet, BookUser } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard – ia Academy" },
      { name: "description", content: "Manage students, teachers, exams and finances from one place." },
    ],
  }),
  component: Dashboard,
});

const examData = [
  { m: "Jan", Teacher: 40, Student: 24 },
  { m: "Feb", Teacher: 30, Student: 35 },
  { m: "Mar", Teacher: 50, Student: 28 },
  { m: "Apr", Teacher: 45, Student: 55 },
  { m: "May", Teacher: 70, Student: 60 },
  { m: "Jun", Teacher: 35, Student: 42 },
  { m: "Jul", Teacher: 48, Student: 32 },
  { m: "Aug", Teacher: 55, Student: 50 },
  { m: "Sep", Teacher: 38, Student: 44 },
  { m: "Oct", Teacher: 60, Student: 55 },
  { m: "Nov", Teacher: 42, Student: 33 },
  { m: "Dec", Teacher: 50, Student: 47 },
];

const genderData = [
  { name: "Male", value: 8200 },
  { name: "Female", value: 6800 },
];

const stats = [
  { label: "Students", value: "15.00K", icon: GraduationCap, color: "bg-primary/10 text-primary" },
  { label: "Teachers", value: "2.00K", icon: BookUser, color: "bg-brand-green/15 text-brand-green" },
  { label: "Parents", value: "5.6K", icon: Users, color: "bg-accent text-primary" },
  { label: "Earnings", value: "$19.3K", icon: Wallet, color: "bg-brand-green/15 text-brand-green" },
];

const starStudents = [
  { name: "Evelynn Harper", id: "PREA5125", marks: 1185, percent: "98%", year: 2014 },
  { name: "Diana Plenty", id: "PREA5174", marks: 1165, percent: "97%", year: 2014 },
  { name: "John Millar", id: "PREA5187", marks: 1175, percent: "92%", year: 2014 },
  { name: "Miles Esther", id: "PREA5371", marks: 1180, percent: "94%", year: 2014 },
];

const examResults = [
  { title: "New Teacher", note: "It is a long established readable…", time: "Just now" },
  { title: "Fees Structure", note: "It is a long established readable…", time: "Today" },
  { title: "New Course", note: "It is a long established readable…", time: "24 Sep 2023" },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" breadcrumb="Home / Admin" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border border-border p-5 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-bold text-primary mt-1">{s.value}</div>
            </div>
            <div className={`size-12 rounded-xl grid place-items-center ${s.color}`}>
              <s.icon className="size-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-primary">All Exam Result</div>
              <div className="text-xs text-muted-foreground">Students & Teacher</div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={examData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.015 255)" />
                <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Teacher" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Student" fill="var(--brand-green)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4">Students</div>
          <div className="h-56 relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={genderData} innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={4}>
                  <Cell fill="var(--primary)" />
                  <Cell fill="var(--brand-green)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-2xl font-bold text-primary">15000</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs mt-2">
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-primary" />Male</span>
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-brand-green" />Female</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4">Star Students</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground uppercase">
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Name</th>
                  <th className="text-left py-2 font-medium">ID</th>
                  <th className="text-left py-2 font-medium">Marks</th>
                  <th className="text-left py-2 font-medium">Percent</th>
                  <th className="text-left py-2 font-medium">Year</th>
                </tr>
              </thead>
              <tbody>
                {starStudents.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3 text-muted-foreground">{s.id}</td>
                    <td className="py-3">{s.marks}</td>
                    <td className="py-3 text-brand-green font-semibold">{s.percent}</td>
                    <td className="py-3 text-muted-foreground">{s.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="font-semibold text-primary mb-4">All Exam Results</div>
          <div className="space-y-3">
            {examResults.map((r) => (
              <div key={r.title} className="flex items-start gap-3 p-3 rounded-xl bg-secondary">
                <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center text-xs font-bold">{r.title[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-primary truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.note}</div>
                </div>
                <div className="text-[11px] text-muted-foreground whitespace-nowrap">{r.time}</div>
              </div>
            ))}
            <button className="w-full mt-2 py-2 rounded-xl bg-brand-green/10 text-brand-green font-medium text-sm hover:bg-brand-green/20 transition">
              View All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
