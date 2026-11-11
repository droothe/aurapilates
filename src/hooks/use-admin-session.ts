import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type State = { loading: boolean; session: Session | null; isAdmin: boolean };

/** Session + admin role for the /admin area. Role is checked against the database, never local storage. */
export function useAdminSession(): State {
  const [state, setState] = useState<State>({ loading: true, session: null, isAdmin: false });

  useEffect(() => {
    let active = true;

    async function resolve(session: Session | null) {
      if (!session) {
        if (active) setState({ loading: false, session: null, isAdmin: false });
        return;
      }
      const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
      if (active) setState({ loading: false, session, isAdmin: data === true });
    }

    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setState((s) => ({ ...s, loading: true }));
      setTimeout(() => resolve(session), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
