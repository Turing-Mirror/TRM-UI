import { useEffect, useRef } from "react";

/**
 * 鼠标侧键前进后退：第四键后退，第五键前进。
 *
 * 在松开时处理并拦下（按下与 auxclick 也一并拦），WebView 就不会自己去翻网页的历史，
 * 把整个界面翻回上一个地址。页面里有返回箭头时，后退一般应先按它（详情回列表），
 * 这由调用方在 back 里决定。
 */
export function useMouseNav({ back, forward, enabled = true }: { back: () => void; forward: () => void; enabled?: boolean }) {
  const fns = useRef({ back, forward });
  fns.current = { back, forward };
  useEffect(() => {
    if (!enabled) return;
    const side = (e: MouseEvent) => e.button === 3 || e.button === 4;
    const up = (e: MouseEvent) => {
      if (!side(e)) return;
      e.preventDefault();
      if (e.button === 3) fns.current.back();
      else fns.current.forward();
    };
    const block = (e: MouseEvent) => side(e) && e.preventDefault();
    window.addEventListener("mouseup", up);
    window.addEventListener("mousedown", block);
    window.addEventListener("auxclick", block);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousedown", block);
      window.removeEventListener("auxclick", block);
    };
  }, [enabled]);
}
