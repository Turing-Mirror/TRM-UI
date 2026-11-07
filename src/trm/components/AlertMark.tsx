import { Tooltip } from "./Tooltip";

export type AlertMarkProps = { label: string };

/** The caller places the corner wrapper in a relative bubble, keeping the mark out of text layout. */
export function AlertMark({ label }: AlertMarkProps) {
  return <Tooltip text={label}>
    <span className="trm-alert-mark" role="img" aria-label={label} tabIndex={0}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
        <path d="M5 1h2v6H5zM5 9h2v2H5z" />
      </svg>
    </span>
  </Tooltip>;
}
