"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EmploymentType } from "@/types/database";

/**
 * Fetches the user's profile employment_type from Supabase and applies it
 * as the default if the caller hasn't already selected one.
 *
 * @param current  - current employment type state (null = nothing selected)
 * @param setter   - state setter to apply the fetched default
 */
export function useProfileDefaults(
  current: EmploymentType | null,
  setter: (value: EmploymentType) => void,
): { loading: boolean } {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || cancelled) { setLoading(false); return; }

        const { data } = await supabase
          .from("profiles")
          .select("employment_type")
          .eq("id", user.id)
          .single();

        if (!cancelled && data?.employment_type) {
          setter(data.employment_type as EmploymentType);
        }
      } catch {
        // Silently fail — defaults just won't be applied
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Only fetch if the user hasn't already selected an employment type
    if (!current) {
      load();
    } else {
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { loading };
}
