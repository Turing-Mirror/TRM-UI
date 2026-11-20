// @vitest-environment happy-dom
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "../i18n";
import { DockableModal, ProgressOrb } from "./DownloadOrb";

function mount(node: React.ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  act(() => {
    root.render(<I18nProvider>{node}</I18nProvider>);
  });
  return {
    container,
    rerender(next: React.ReactNode) {
      act(() => {
        root.render(<I18nProvider>{next}</I18nProvider>);
      });
    },
    unmount() {
      act(() => root.unmount());
      container.remove();
      vi.unstubAllGlobals();
    },
  };
}

describe("DownloadOrb", () => {
  it("renders ProgressOrb at the bottom-left with percentage and handles clicks", () => {
    const onClick = vi.fn();
    const view = mount(
      <ProgressOrb open percent={42.4} label="后台下载" onClick={onClick} />,
    );
    try {
      const btn = view.container.querySelector("button");
      expect(btn).not.toBeNull();
      expect(btn!.textContent).toContain("42%");
      act(() => btn!.click());
      expect(onClick).toHaveBeenCalledOnce();
    } finally {
      view.unmount();
    }
  });

  it("switches DockableModal cleanly between centered dialog and corner orb", () => {
    const onMinimizedChange = vi.fn();
    const view = mount(
      <DockableModal
        open
        minimized={false}
        canMinimize
        onMinimizedChange={onMinimizedChange}
        label="补全运行环境"
        orbLabel="展开下载窗口"
        percent={18}
      >
        <div>正在下载运行环境</div>
      </DockableModal>,
    );
    try {
      expect(view.container.textContent).toContain("正在下载运行环境");
      const dialog = view.container.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();

      view.rerender(
        <DockableModal
          open
          minimized
          canMinimize
          onMinimizedChange={onMinimizedChange}
          label="补全运行环境"
          orbLabel="展开下载窗口"
          percent={18}
        >
          <div>正在下载运行环境</div>
        </DockableModal>,
      );

      const orb = view.container.querySelector('button[aria-label="展开下载窗口"]');
      expect(orb).not.toBeNull();
      expect(orb!.textContent).toContain("18%");
      act(() => (orb as HTMLButtonElement).click());
      expect(onMinimizedChange).toHaveBeenCalledWith(false);
    } finally {
      view.unmount();
    }
  });

  it("supports attention states on the corner orb", () => {
    const view = mount(
      <ProgressOrb open attention="error" label="下载失败" onClick={() => {}} />,
    );
    try {
      const btn = view.container.querySelector('button[aria-label="下载失败"]');
      expect(btn).not.toBeNull();
      expect(btn!.querySelector("svg")).not.toBeNull();
    } finally {
      view.unmount();
    }
  });
});
