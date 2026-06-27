import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, BookOpenCheck, School, Bus, ClipboardList,
  Wallet, CalendarDays, Settings, ChevronDown, GraduationCap, LogOut,
  ShieldAlert, UserCog, Eye,
} from "lucide-react";
import { useState, useEffect, type ComponentType } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession, useRoles, type AppRole } from "@/hooks/use-auth";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }>; roles: AppRole[] };

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard-ka Guud", icon: LayoutDashboard, roles: ["maamule","macalin","maaliyadda"] },
  { to: "/ardayda", label: "Maamulka Ardayda", icon: Users, roles: ["maamule"] },
  { to: "/shaqaalaha", label: "Maamulka Shaqaalaha", icon: UserCog, roles: ["maamule"] },
  { to: "/casharka", label: "Cashar-Raaca Dugsiga", icon: BookOpenCheck, roles: ["maamule","macalin"] },
  { to: "/fasallada", label: "Maamulka Fasallada", icon: School, roles: ["maamule","macalin"] },
  { to: "/gaadiidka", label: "Gaadiidka & Bus-ka", icon: Bus, roles: ["maamule"] },
  { to: "/imtixaanada", label: "Imtixaanada & Exams", icon: ClipboardList, roles: ["maamule","macalin"] },
  { to: "/dacwo", label: "Dacwo & Anshax", icon: ShieldAlert, roles: ["maamule","macalin"] },
  { to: "/maaliyadda", label: "Maaliyadda & Kharashka", icon: Wallet, roles: ["maamule","maaliyadda"] },
  { to: "/kalandar", label: "Kalandarka Maamulka", icon: CalendarDays, roles: ["maamule","macalin","maaliyadda"] },
  { to: "/sifaynta", label: "Sifaynta & Settings", icon: Settings, roles: ["maamule"] },
];

const ROLE_LABEL: Record<AppRole, string> = {
  maamule: "Maamule",
  macalin: "Macalin",
  maaliyadda: "Maaliyadda",
};

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const { primary } = useRoles(user?.id);
  const [previewRole, setPreviewRole] = useState<AppRole | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { setPreviewRole(null); }, [primary]);

  const realRole: AppRole = primary || "macalin";
  const activeRole: AppRole = previewRole || realRole;
  const filteredNav = NAV.filter((n) => n.roles.includes(activeRole));

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

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
          {filteredNav.map((item) => {
            const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                ].join(" ")}>
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 m-3 rounded-xl bg-brand-green/10 border border-brand-green/20">
          <div className="text-xs text-muted-foreground">Doorka aad ku jirto</div>
          <div className="text-sm font-semibold text-primary">{ROLE_LABEL[activeRole]}</div>
          {previewRole && <div className="text-[10px] text-amber-700 mt-1">Daawasho (preview) ahaan</div>}
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
              <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-secondary transition">
                <div className="size-9 rounded-full bg-gradient-to-br from-brand-green to-primary grid place-items-center text-white font-semibold text-sm">
                  {(user?.email || "?").slice(0,2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold leading-tight text-primary">{ROLE_LABEL[activeRole]}</div>
                  <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">{user?.email}</div>
                </div>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-lg p-2 z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <div className="text-xs text-muted-foreground">Doorkaaga rasmiga ah</div>
                    <div className="text-sm font-semibold text-primary">{ROLE_LABEL[realRole]}</div>
                  </div>
                  {realRole === "maamule" && (
                    <>
                      <div className="px-3 py-2 text-[11px] uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                        <Eye className="size-3"/> Daawo sida door kale
                      </div>
                      {(["maamule","macalin","maaliyadda"] as AppRole[]).map((r) => (
                        <button key={r}
                          onClick={() => { setPreviewRole(r === "maamule" ? null : r); setOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary ${activeRole === r ? "bg-secondary font-semibold text-primary" : ""}`}>
                          {ROLE_LABEL[r]}
                        </button>
                      ))}
                      <div className="border-t border-border my-1"/>
                    </>
                  )}
                  <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10">
                    <LogOut className="size-4"/> Ka Bax
                  </button>
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
