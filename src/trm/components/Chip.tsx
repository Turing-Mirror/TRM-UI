import { useI18n } from "../i18n";
import { Icon, type IconName } from "./Icon";
import { IconBtn, type Tone } from "./display";

export type ChipProps = {
  children: string;
  icon?: IconName;
  tone?: Tone;
  onRemove?: () => void;
  disabled?: boolean;
};

/** Labels keep one appearance in read-only tables and editable fields. */
export function Chip({ children, icon, tone = "muted", onRemove, disabled = false }: ChipProps) {
  const { t } = useI18n();
  return <span className="trm-chip" data-tone={tone} data-removable={Boolean(onRemove) || undefined}>
    {icon ? <span className="trm-chip-icon" aria-hidden><Icon name={icon} size={14} /></span> : null}
    <span>{children}</span>
    {onRemove ? <span inert={disabled}>
      <IconBtn icon="close" size={14} label={t("ui.common.removeItem", { name: children })}
        onClick={() => { if (!disabled) onRemove(); }} />
    </span> : null}
  </span>;
}
