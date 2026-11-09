// @vitest-environment happy-dom
import { act } from "react";
import { expect, it } from "vitest";
import { mount } from "../test/dom";
import { CatalogCover } from "./CatalogCover";

it("tries the original cover after a stale cache entry fails, then resets when a new cache arrives", () => {
  const remote = "https://example.test/cover.png";
  const cover = (cache: string) => <CatalogCover sources={[cache, remote, remote]} placeholder="Example" />;
  const view = mount(cover("/old-cache.png"));
  const image = () => view.container.querySelector("img");
  try {
    expect(image()?.getAttribute("src")).toBe("/old-cache.png");
    act(() => { image()?.dispatchEvent(new Event("error")); });
    expect(image()?.getAttribute("src")).toBe(remote);
    act(() => { image()?.dispatchEvent(new Event("error")); });
    expect(image()).toBeNull();
    expect(view.container.textContent).toBe("Example");
    act(() => view.root.render(cover("/new-cache.png")));
    expect(image()?.getAttribute("src")).toBe("/new-cache.png");
  } finally {
    view.unmount();
  }
});
