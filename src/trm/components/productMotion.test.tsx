// @vitest-environment happy-dom
import { act } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { FlowList } from './motion';
import { Tooltip } from './Tooltip';
import { mount, pressKey, type Mounted } from '../test/dom';

let mounted: Mounted;
afterEach(() => { mounted?.unmount(); vi.useRealTimers(); vi.restoreAllMocks(); });

it('preserves retained grid nodes and moves them horizontally before exit cleanup', () => {
  vi.useFakeTimers();
  const animate = vi.fn(() => ({ cancel() {} } as Animation));
  vi.spyOn(HTMLElement.prototype, 'animate').mockImplementation(animate);
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function(this: HTMLElement) {
    return Array.from(this.parentElement?.children ?? []).filter(el => (el as HTMLElement).style.position !== 'absolute').indexOf(this) * 100;
  });
  const render = (items: string[]) => <FlowList items={items} layout="grid" keyOf={item => item} render={item => <input defaultValue={item} />} motion={{ durationMs: 120, easing: 'linear' }} />;
  mounted = mount(render(['a', 'b', 'c']));
  const retained = mounted.container.querySelector('[data-flow="c"] input');
  act(() => mounted.root.render(render(['a', 'c'])));
  expect(mounted.container.querySelector('[data-flow="b"]')?.getAttribute('inert')).not.toBeNull();
  expect((mounted.container.querySelector('[data-flow="b"]') as HTMLElement).style.position).toBe('absolute');
  expect(animate).toHaveBeenCalledWith([{ transform: 'translate3d(100px, 0px, 0)' }, { transform: 'none' }], { duration: 120, easing: 'linear' });
  act(() => vi.advanceTimersByTime(160));
  expect(mounted.container.querySelector('[data-flow="b"]')).toBeNull();
  expect(mounted.container.querySelector('[data-flow="c"] input')).toBe(retained);
  expect(animate).toHaveBeenCalledTimes(1);
});

it('removes outgoing items without waiting for the standard motion duration when motion is disabled', () => {
  vi.useFakeTimers();
  const render = (items: string[]) => <FlowList items={items} keyOf={item => item} render={item => <span>{item}</span>} motion={{ reduced: true }} />;
  mounted = mount(render(['a', 'b']));
  act(() => mounted.root.render(render(['b'])));
  act(() => vi.advanceTimersByTime(0));
  expect(mounted.container.querySelector('[data-flow="a"]')).toBeNull();
  expect((mounted.container.firstElementChild as HTMLElement).style.getPropertyValue('--flow-ms')).toBe('0ms');
});

it('allows product tooltip styles and connects the explanation to its trigger', () => {
  mounted = mount(<Tooltip text="Explanation" className="product-tooltip" triggerClassName="product-trigger"><button>Help</button></Tooltip>);
  const button = mounted.container.querySelector('button')!;
  act(() => button.focus());
  const tooltip = document.querySelector('[role="tooltip"]')!;
  expect(tooltip.classList.contains('product-tooltip')).toBe(true);
  expect(tooltip.classList.contains('fixed')).toBe(false);
  expect(button.getAttribute('aria-describedby')).toBe(tooltip.id);
  pressKey(button, 'Escape');
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  expect(document.activeElement).toBe(button);
  act(() => button.click());
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  act(() => mounted.root.render(<Tooltip text="Explanation" disabled><button>Help</button></Tooltip>));
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
});
