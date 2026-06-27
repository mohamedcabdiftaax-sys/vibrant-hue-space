import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "maamule" | "macalin" | "maaliyadda";

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);
  return { session, user: session?.user as User | undefined, loading };
}

export function useRoles(userId?: string) {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userId) { setRoles([]); setLoading(false); return; }
    setLoading(true);
    supabase.from("user_roles").select("role").eq("user_id", userId).then(({ data }) => {
      setRoles(((data || []) as { role: AppRole }[]).map((r) => r.role));
      setLoading(false);
    });
  }, [userId]);
  return { roles, loading, primary: roles[0] as AppRole | undefined };
}