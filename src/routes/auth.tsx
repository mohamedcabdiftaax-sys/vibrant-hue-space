import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // claim first maamule (no-op if not the first user)
        await supabase.rpc("claim_first_maamule");
        toast.success("Akoonkaaga waa la sameeyay");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        try { await supabase.rpc("claim_first_maamule"); } catch {}
        toast.success("Si guul leh ayaad u soo gashay");
      }
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message || "Khalad ayaa dhacay");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-primary via-primary to-brand-green">
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%),radial-gradient(circle_at_70%_80%,white,transparent_40%)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-full bg-white/15 backdrop-blur grid place-items-center">
              <GraduationCap className="size-7" />
            </div>
            <div>
              <div className="font-bold text-xl leading-tight">New Generation</div>
              <div className="text-xs uppercase tracking-widest opacity-80">International School</div>
            </div>
          </div>
        </div>
        <div className="relative space-y-4 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">Nidaamka Maamulka Dugsiga</h1>
          <p className="text-white/80 text-lg">Maaree ardayda, macalimiinta, casharrada, iyo maaliyadda meel keliya — si fudud, sahlan, oo amaan ah.</p>
        </div>
        <div className="relative text-xs text-white/60">© {new Date().getFullYear()} New Generation International School</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="size-12 rounded-full bg-gradient-to-br from-primary to-brand-green grid place-items-center text-white">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <div className="font-bold text-primary leading-tight">New Generation</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">International School</div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary">{mode === "signin" ? "Soo Gal" : "Diiwaangelin"}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "signin" ? "Gali akoonkaaga si aad u maamusho dugsiga" : "Samee akoon cusub. Qofkii ugu horeeyay wuxuu noqonayaa Maamule."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Magaca Buuxa</label>
                <input value={fullName} onChange={(e)=>setFullName(e.target.value)} required className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/30 outline-none" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Iimaylka</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="magaca@example.com" className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/30 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Furaha Sirta ah</label>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="w-full h-11 px-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/30 outline-none" />
            </div>
            <button disabled={busy} type="submit" className="w-full h-11 rounded-lg bg-brand-green hover:bg-brand-green/90 text-white font-semibold flex items-center justify-center gap-2 transition shadow-md disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Soo Gal" : "Samee Akoon"}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>Akoon ma lihid? <button onClick={()=>setMode("signup")} className="text-primary font-semibold hover:underline">Diiwaangeli</button></>
            ) : (
              <>Hore ayaad u haysatay akoon? <button onClick={()=>setMode("signin")} className="text-primary font-semibold hover:underline">Soo Gal</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}