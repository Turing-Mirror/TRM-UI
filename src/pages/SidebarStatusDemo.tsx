import { useState } from "react";
import { SidebarStatus, useI18n, type SidebarStatusProps } from "../trm";

const STATES = [
  { icon: "online", tone: "ok", label: "demo.connection.online" },
  { icon: "offline", tone: "muted", label: "demo.connection.offline" },
  { icon: "scan", tone: "warn", label: "demo.connection.login" },
  { icon: "alert", tone: "danger", label: "demo.connection.error" },
] as const satisfies readonly Pick<SidebarStatusProps, "icon" | "tone" | "label">[];

/** Cycling is gallery behaviour; product hosts supply their own connection action. */
export function SidebarStatusDemo({ collapsed }: { collapsed: boolean }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const state = STATES[index];
  return <SidebarStatus {...state} label={t(state.label)} collapsed={collapsed}
    onClick={() => setIndex((value) => (value + 1) % STATES.length)} />;
}
