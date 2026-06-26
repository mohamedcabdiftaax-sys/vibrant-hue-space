import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  BookOpenCheck,
  School,
  Bus,
  ClipboardList,
  Wallet,
  CalendarDays,
  Settings,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { useState, type ComponentType } from "react";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard-ka Guud", icon: LayoutDashboard },
  { to: "/ardayda", label: "Maamulka Ardayda", icon: Users },
  { to: "/casharka", label: "Cashar-Raaca Dugsiga", icon: BookOpenCheck },
  { to: "/fasallada", label: "Maamulka Fasallada", icon: School },
  { to: "/gaadiidka", label: "Gaadiidka & Bus-ka", icon: Bus },
  { to: "/imtixaanada", label: "Imtixaanada & Exams", icon: ClipboardList },
  { to: "/maaliyadda", label: "Maaliyadda & Kharashka", icon: Wallet },
  { to: "/kalandar", label: "Kalandarka Maamulka", icon: CalendarDays },
  { to: "/sifaynta", label: "Sifaynta & Settings", icon: Settings },
];

export function DashboardLayout() {
  const location = useLocation();
  const [role, setRole] = useState<"Maamule" | "Macalin">("Maamule");
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden md:flex w-72 shrink-0 flex-col bg-sidebar border-r border-sidebar-border sticky top-0 h-screen">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="size-11 rounded-full bg-gradient-to-br from-primary to-brand-green grid place-items-center text-white font-bold shadow-md">
            <GraduationCap className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-primary text-sm leading-tight truncate">New Generation</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">International School</div>
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                ].join(" ")}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 m-3 rounded-xl bg-brand-green/10 border border-brand-green/20">
          <div className="text-xs text-muted-foreground">Caawimaad ma u baahantahay?</div>
          <div className="text-sm font-semibold text-primary">La xidhiidh maamulka</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center gap-4 px-6 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="md:hidden size-10 rounded-full bg-gradient-to-br from-primary to-brand-green grid place-items-center text-white">
                <GraduationCap className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-primary text-base sm:text-lg leading-tight truncate">
                  New Generation International School
                </div>
                <div className="text-[11px] text-muted-foreground">Nidaamka Maamulka Dugsiga</div>
              </div>
            </div>
            <div className="ml-auto relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-secondary transition"
              >
                <div className="size-9 rounded-full bg-gradient-to-br from-brand-green to-primary grid place-items-center text-white font-semibold text-sm">
                  {role === "Maamule" ? "MM" : "MC"}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold leading-tight text-primary">{role}</div>
                  <div className="text-[11px] text-muted-foreground">Doorka isticmaalaha</div>
                </div>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg p-2 z-50">
                  <div className="px-3 py-2 text-[11px] uppercase text-muted-foreground tracking-wider">Beddel Dook</div>
                  {(["Maamule", "Macalin"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary ${role === r ? "bg-secondary font-semibold text-primary" : ""}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
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