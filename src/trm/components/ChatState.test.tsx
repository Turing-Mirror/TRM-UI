// @vitest-environment happy-dom
import { act } from "react";
import { afterEach, expect, it } from "vitest";
import { ChatState } from "./ChatState";
import { mount, type Mounted } from "../test/dom";

let view: Mounted;
afterEach(() => view?.unmount());

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
