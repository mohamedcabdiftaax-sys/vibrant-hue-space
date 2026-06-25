import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Bus,
  Calendar,
  ChevronDown,
  ClipboardList,
  GraduationCap,
  Home,
  Library,
  MessageSquare,
  Search,
  Settings,
  Users,
  Wallet,
  Megaphone,
  Building2,
  FileText,
} from "lucide-react";
import type { ComponentType } from "react";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/students", label: "Students", icon: Users },
  { to: "/teachers", label: "Teachers", icon: GraduationCap },
  { to: "/library", label: "Library", icon: Library },
  { to: "/account", label: "Account", icon: Wallet },
  { to: "/class", label: "Class", icon: BookOpen },
  { to: "/subject", label: "Subject", icon: FileText },
  { to: "/routine", label: "Routine", icon: Calendar },
  { to: "/attendance", label: "Attendance", icon: ClipboardList },
  { to: "/exam", label: "Exam", icon: Settings },
  { to: "/notice", label: "Notice", icon: Megaphone },
  { to: "/transport", label: "Transport", icon: Bus },
  { to: "/hostel", label: "Hostel", icon: Building2 },
];

export function DashboardLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border sticky top-0 h-screen">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-sidebar-border">
          <div className="size-9 rounded-xl bg-primary grid place-items-center text-primary-foreground font-bold">
            iA
          </div>
          <div>
            <div className="font-semibold text-primary leading-tight">ia Academy</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">School ERP</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                ].join(" ")}
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4" />
                  {item.label}
                </span>
                <ChevronDown className="size-3.5 opacity-60" />
              </Link>
            );
          })}
        </nav>
        <div className="p-4 m-3 rounded-xl bg-brand-green/10 border border-brand-green/20">
          <div className="text-xs text-muted-foreground">Need help?</div>
          <div className="text-sm font-semibold text-primary">Contact support</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center gap-4 px-6 py-3">
            <div className="relative flex-1 max-w-xl">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="What do you want to find?"
                className="w-full pl-9 pr-3 py-2 rounded-full bg-secondary text-sm outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <button className="size-9 grid place-items-center rounded-full bg-secondary hover:bg-accent">
              <Bell className="size-4 text-primary" />
            </button>
            <button className="size-9 grid place-items-center rounded-full bg-secondary hover:bg-accent">
              <MessageSquare className="size-4 text-primary" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="size-9 rounded-full bg-gradient-to-br from-brand-green to-primary grid place-items-center text-white font-semibold text-sm">
                PL
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold leading-tight">Priscilla Lily</div>
                <div className="text-[11px] text-muted-foreground">Admin</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, breadcrumb, actions }: { title: string; breadcrumb?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        {breadcrumb && <div className="text-xs text-muted-foreground mt-1">{breadcrumb}</div>}
      </div>
      {actions}
    </div>
  );
}