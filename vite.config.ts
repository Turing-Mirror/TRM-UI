import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

/**
 * 去掉打包产物里的 `crossorigin` 属性。
 *
 * Tauri 的正式界面是通过自定义协议（`app://`、`http://xxx.localhost`）加载的，
 * 而 `crossorigin` 会让 WebView2 按跨源规则去取脚本 —— 自定义协议下这一步会
 * 失败，表现是**整个窗口白屏**，控制台里什么都看不到（那时候连脚本都没跑起来）。
 *
 * 纯网页预览用不到这一步，但留着不碍事；一旦这份模板被接进 Tauri，它就是
 * 「能开窗」和「白屏」之间的区别。配合 `base: "./"` 一起用。
 */
function stripCrossorigin(): Plugin {
  return {
    name: "strip-crossorigin",
    enforce: "post",
    transformIndexHtml(html) {
      return html.replace(/\s+crossorigin(?:="[^"]*")?/gi, "");
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stripCrossorigin()],

  // 相对路径：自定义协议下的页面要能在自己旁边找到资源。
  base: "./",

  build: {
    sourcemap: false,
    outDir: "dist",
    emptyOutDir: true,
  },

  clearScreen: false,
  server: {
    // 模板占 1410。基于它的每个产品都应换一个自己的端口：WebView2 按端口分缓存目录，
    // 同一个端口换了产品，会读到上一个产品的 localStorage。
    port: 1410,
    strictPort: true,
  },
});
