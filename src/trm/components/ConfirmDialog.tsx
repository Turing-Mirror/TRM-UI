import { useLatest, Modal } from "./overlay";
import { Btn } from "./ui";
import { useI18n } from "../i18n";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  text: string;
  confirm: string;
  danger?: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ open, title, text, confirm, danger = false, busy, onClose, onConfirm }: ConfirmDialogProps) {
  const { t } = useI18n();
  // Preserve the last message while Modal plays its existing exit animation.
  const shown = useLatest(open ? { title, text, confirm, danger } : null) ?? { title, text, confirm, danger };
  const close = () => { if (open && !busy) onClose(); };
  return (
    <Modal open={open} label={shown.title} onClose={close} width={420}>
      <div className="trm-confirm" aria-busy={busy} inert={!open}>
        <h2>{shown.title}</h2>
        <p>{shown.text}</p>
        <div className="trm-confirm-actions">
          <Btn disabled={busy} onClick={close}>{t("ui.common.cancel")}</Btn>
          <Btn
            danger={shown.danger}
            busy={busy}
            onClick={() => { if (open && !busy) onConfirm(); }}
          >
            {shown.confirm}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
