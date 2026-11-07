// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { ChatState } from "./ChatState";
import { mount, type Mounted } from "../test/dom";

let view: Mounted;
afterEach(() => { view?.unmount(); vi.restoreAllMocks(); });

it("rolls the handling label in a retained bar with an optional action", () => {
  const state = (human: boolean) => <ChatState label={human ? "Human handling" : "Assistant handling"}
    tone={human ? "human" : "assistant"} action={<button>Change</button>} />;
  view = mount(state(false));
  const bar = view.container.firstElementChild;
  const action = view.container.querySelector("button");
  expect(view.container.querySelector('[role="status"]')?.textContent).toBe("Assistant handling");
  act(() => view.root.render(state(true)));
  expect(view.container.firstElementChild).toBe(bar);
  expect(bar?.getAttribute("data-tone")).toBe("human");
  expect(view.container.querySelector(".roll-in")?.textContent).toBe("Human handling");
  expect(view.container.querySelector("button")).toBe(action);
});

it("accepts a custom icon without exposing it as a second label", () => {
  view = mount(<ChatState label="Assigned" icon={<span>Custom</span>} />);
  expect(view.container.querySelector('.trm-chat-state-icon[aria-hidden="true"]')?.textContent).toBe("Custom");
  expect(view.container.querySelector(".trm-chat-state-action")).toBeNull();
});

it("keeps the icon and label together in the center with an independent action slot", () => {
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(96);
  view = mount(<ChatState label="Assigned" action={<button>Change</button>} />);
  const center = view.container.querySelector(".trm-chat-state-center")!;
  expect(center.querySelector(".trm-chat-state-icon")).not.toBeNull();
  expect(center.querySelector('[role="status"]')?.textContent).toBe("Assigned");
  expect(center.contains(view.container.querySelector("button"))).toBe(false);
  expect(center.nextElementSibling?.className).toBe("trm-chat-state-action");
  const bar = view.container.firstElementChild as HTMLElement;
  expect(bar.style.getPropertyValue("--chat-state-action-width")).toBe("96px");
  act(() => view.root.render(<ChatState label="Assigned" />));
  expect(bar.style.getPropertyValue("--chat-state-action-width")).toBe("0px");
});
