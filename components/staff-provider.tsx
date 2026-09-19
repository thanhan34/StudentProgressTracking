"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getAssignableStaff } from "@/app/staff-actions";
import type { StaffOption } from "@/lib/staff";

type StaffDirectory = { users: StaffOption[]; loading: boolean; error: string; reload: () => void };
const StaffContext = createContext<StaffDirectory | null>(null);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({ users: [] as StaffOption[], loading: true, error: "" });
  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const result = await getAssignableStaff();
      setState({ ...result, loading: false });
    } catch {
      setState({ users: [], loading: false, error: "Không tải được danh sách người phụ trách. Vui lòng thử lại." });
    }
  }, []);
  useEffect(() => {
    let active = true;
    getAssignableStaff().then((result) => {
      if (active) setState({ ...result, loading: false });
    }).catch(() => {
      if (active) setState({ users: [], loading: false, error: "Không tải được danh sách người phụ trách. Vui lòng thử lại." });
    });
    return () => { active = false; };
  }, []);
  return <StaffContext.Provider value={{ ...state, reload }}>{children}</StaffContext.Provider>;
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) throw new Error("StaffProvider is required");
  return context;
}