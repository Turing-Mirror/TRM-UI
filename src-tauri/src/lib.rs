//! TRM UI 桌面壳。
//!
//! 这是一个**模板**：它把「一个 Tauri 桌面产品开机之后必须做对的那些事」
//! 集中在一处，产品自己的命令加在 `invoke_handler` 里即可。
//!
//! 开机顺序（顺序本身是有讲究的，别随手调）：
//!   1. 解析产品根 → 建 User_Data → 起日志。**日志必须最先起来**，
//!      不然后面任何一步出问题都不会留下记录。
//!   2. 读配置 → 起壳侧 i18n（托盘菜单要用）。
//!   3. 注册 `trm://` 协议 → 建窗口 → 圆角 / 摆到光标所在屏。
//!   4. 挂两个看门狗：白窗检测、主线程卡死检测。

mod asset_scope;
mod autostart;
mod config;
mod i18n;
mod logging;
pub mod paths;
mod tray;
mod ui_assets;
mod window_watch;

use std::path::PathBuf;
use std::sync::Mutex;

use serde_json::{Map, Value};
use tauri::{AppHandle, Emitter, Manager, State};

use crate::logging::shell_log;

/// 产品显示名。改产品时这里和 `tauri.conf.json` 的 `productName` 一起改。
const APP_TITLE: &str = "TRM UI";

struct AppState {
    root: PathBuf,
}

fn root_of(state: &State<'_, Mutex<AppState>>) -> Result<PathBuf, String> {
    Ok(state.lock().map_err(|e| e.to_string())?.root.clone())
}

// ───────────────────────── 命令 ─────────────────────────

/// 读整份配置。前端启动时调一次。
#[tauri::command]
fn config_get(state: State<'_, Mutex<AppState>>) -> Result<Map<String, Value>, String> {
    Ok(config::read(&root_of(&state)?))
}

/// 浅合并一批键并落盘，返回合并后的整份配置。
///
/// 返回整份而不是只回 ok：前端拿到的永远是**服务端认定的**状态，
/// 省掉「本地以为改了、其实没写进去」这一类不一致。
#[tauri::command]
fn config_set(
    state: State<'_, Mutex<AppState>>,
    app: AppHandle,
    patch: Map<String, Value>,
) -> Result<Map<String, Value>, String> {
    let root = root_of(&state)?;
    // 壁纸换成了新文件的话，要当场放行，否则界面上那张图会悄悄 404。
    if let Some(wp) = patch.get("wallpaper_path").and_then(|v| v.as_str()) {
        asset_scope::grant_file(&app, wp);
    }
    let cfg = config::patch(&root, &patch)?;
    // 语言变了，托盘菜单也得跟着变 —— 否则会出现界面是英文、托盘是中文。
    if let Some(loc) = patch.get("ui_locale").and_then(|v| v.as_str()) {
        i18n::set_locale_at(&root, loc);
    }
    Ok(cfg)
}

/// 界面把日志写进 shell.log。`index.html` 里的白窗守卫和 ErrorBoundary 都用它。
#[tauri::command]
fn ui_log(line: String) {
    shell_log!("[ui] {line}");
}

/// 界面挂载完成。这是「WebView 真的跑到了我们的 JavaScript」唯一的正面信号。
#[tauri::command]
fn ui_ready() {
    ui_assets::mark_ui_ready();
}

/// 界面是从哪儿来的（内置 / 外部目录）。放进「关于」页，
/// 打错的界面补丁否则完全不可见。
#[tauri::command]
fn ui_source() -> String {
    ui_assets::source_label()
}

#[tauri::command]
fn autostart_get() -> autostart::AutostartStatus {
    autostart::get()
}

#[tauri::command]
fn autostart_set(enabled: bool) -> Result<(), String> {
    autostart::set(enabled)
}

// ───────────────────────── 启动 ─────────────────────────

pub fn run() {
    let root = paths::product_root();
    // 建目录 → 起日志。这两步必须在任何可能失败的事情之前。
    let _ = paths::ensure_user_dirs(&root);
    logging::init(&root);
    shell_log!("========== {APP_TITLE} 启动 ==========");
    shell_log!("产品根目录：{}", root.display());

    let cfg = config::read(&root);
    i18n::init(&root, &config::str_of(&cfg, "ui_locale"));

    let setup_root = root.clone();
    tauri::Builder::default()
        // 单实例：第二次启动时把已经开着的那扇窗叫到前面，而不是再开一个。
        // 用户双击图标发现「没反应」，多半就是又起了一个进程，而第一个还在托盘里。
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            shell_log!("已在运行，把窗口叫到前面");
            tray::focus_main(app);
        }))
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(AppState { root: root.clone() }))
        // 界面走自定义协议，不走 Tauri 内置 asset handler —— 这样 exe 旁边的
        // frontend/ 就能替换掉随包发布的界面。见 ui_assets。
        .register_uri_scheme_protocol(ui_assets::SCHEME, |ctx, req| {
            ui_assets::serve(ctx.app_handle(), req)
        })
        .invoke_handler(tauri::generate_handler![
            config_get,
            config_set,
            ui_log,
            ui_ready,
            ui_source,
            autostart_get,
            autostart_set,
        ])
        .setup(move |app| {
            let root = setup_root;
            // asset 协议白名单按运行时解析出的路径放行（静态 glob 做不到）。
            asset_scope::grant_dir(app.handle(), &root);
            asset_scope::grant_dir(app.handle(), &paths::user_data(&root));
            let cfg = config::read(&root);
            asset_scope::grant_file(app.handle(), &config::str_of(&cfg, "wallpaper_path"));

            // 窗口 URL 必须用上面注册的自定义协议。
            //
            // WebView2 根本不能注册非标准 scheme，所以 wry 把 `trm://localhost/x`
            // 改写成 `http://trm.localhost/x` 再拦截。Windows 这一支单独写出来，
            // 是为了和 WebView 实际报告的 origin 对上 —— 对不上就是 CSP 拦截，
            // 表现为白屏。
            #[cfg(windows)]
            let url = format!("http://{}.localhost/index.html", ui_assets::SCHEME);
            #[cfg(not(windows))]
            let url = format!("{}://localhost/index.html", ui_assets::SCHEME);
            shell_log!("窗口 URL：{url}");

            let win = tauri::WebviewWindowBuilder::new(
                app,
                "main",
                tauri::WebviewUrl::CustomProtocol(url.parse().expect("窗口 URL")),
            )
            .title(APP_TITLE)
            .inner_size(1180.0, 780.0)
            .min_inner_size(880.0, 640.0)
            .resizable(true)
            .decorations(false)
            // Windows 上投影不走 tao 的 shadow：它会带出一条 1px 系统白边，
            // 投影由 window_watch::round_corners 经 DWM 要回来。macOS 上
            // shadow 就是系统原生投影，直接开。
            .shadow(cfg!(target_os = "macos"))
            .center()
            .build()?;

            // `.center()` 只认主显示器。多显示器的人主屏未必是他正在看的那块，
            // 窗口连同任务栏按钮一起去了另一块屏，这头看起来就跟没启动一样。
            window_watch::place_on_active_monitor(&win);
            // 无边框窗口默认是直角的，Win11 上跟系统其他窗口格格不入。
            window_watch::round_corners(&win);
            window_watch::report_and_rescue(&win, "创建后");

            if let Err(e) = tray::install(app.handle(), APP_TITLE) {
                // 托盘建不起来不该拦住启动 —— 窗口还在，软件还能用。
                shell_log!("托盘创建失败：{e}");
            }

            install_window_events(&win, root.clone());
            install_blank_window_watchdog(app.handle().clone());
            install_main_thread_watchdog(app.handle().clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("启动失败");
}

/// 窗口事件：圆角重裁 + 关闭行为。
fn install_window_events(win: &tauri::WebviewWindow, root: PathBuf) {
    let w = win.clone();
    win.on_window_event(move |event| {
        // 尺寸或缩放变了：Win10 的圆角是拿 GDI 区域裁出来的，按像素算，
        // 窗口一改大小就得重套。Win11 走 DWM 那条时这里是空操作。
        if matches!(
            event,
            tauri::WindowEvent::Resized(_) | tauri::WindowEvent::ScaleFactorChanged { .. }
        ) {
            window_watch::refresh_corners(&w);
        }
        let tauri::WindowEvent::CloseRequested { api, .. } = event else {
            return;
        };
        // 「关闭 = 收进托盘」是用户在设置里选的，默认关。
        //
        // 默认必须是**真的退出**：一个点了 X 却不退出的程序，用户会以为它已经
        // 关了，然后在任务管理器里发现它还在 —— 那是背着人跑，不是贴心。
        // 想要托盘常驻的产品把默认值改成 true，并且**必须**在界面上说清楚。
        if config::bool_of(&config::read(&root), "close_to_tray") {
            api.prevent_close();
            let _ = w.hide();
            shell_log!("关闭按钮：按设置收进托盘");
        }
    });
}

/// 白窗看门狗。
///
/// 「打开是白的」是用户唯一描述不出、我们也看不见的故障。界面如果一直没报到，
/// 就把判断它所需的一切写进日志：UI 从哪儿来的、处理了多少个资源请求、404 了
/// 几次 —— 「0 个请求」和「12 个请求、1 个 404」是完全不同的两个 bug。
fn install_blank_window_watchdog(app: AppHandle) {
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_secs(12));
        let ready = ui_assets::ui_reported_ready();
        if !ready {
            shell_log!(
                "警告：12 秒内界面没有挂载（白屏）。UI 来源 {} · 已处理 {} 个资源请求 · 404 {} 次",
                ui_assets::source_label(),
                ui_assets::served_count(),
                ui_assets::not_found_count(),
            );
            let _ = app.emit("app://ui-stalled", ());
        }
        if let Some(w) = app.get_webview_window("main") {
            // 状态无条件记一笔：「界面已挂载」+「看不见窗口」是真实存在的组合
            // —— 窗口在、WebView 也在画，只是画在了用户看不到的地方。
            window_watch::report(&w, "启动 12 秒后");
            // 但**只有界面没报到时才动窗口**。rescue 里含 show()，
            // 用户在这 12 秒里主动把窗口收进了托盘的话，无条件救援会让它
            // 自己蹦出来 —— 那是 bug，不是贴心。
            if !ready {
                window_watch::rescue(&w);
            }
        }
    });
}

/// 主线程看门狗。
///
/// 「打开就未响应」是另一条不带任何信息的报障：窗口冻住了，界面说不了话，
/// 它本该调用的命令也一样。所以从一个普通线程去 ping 事件循环。
///
/// 日志在会话中途戛然而止且没有这几行 → 循环停了，问题在 Rust 侧；
/// 这几行一直在出 → 壳是活的，卡住的是 WebView。无论哪种，
/// 下一次报障都从一个事实开始，而不是从猜开始。
fn install_main_thread_watchdog(app: AppHandle) {
    std::thread::spawn(move || {
        let mut stalled = false;
        loop {
            std::thread::sleep(std::time::Duration::from_secs(15));
            let (tx, rx) = std::sync::mpsc::channel();
            if app.run_on_main_thread(move || { let _ = tx.send(()); }).is_err() {
                return; // 正在退出
            }
            let ok = rx.recv_timeout(std::time::Duration::from_secs(10)).is_ok();
            if !ok && !stalled {
                shell_log!("警告：主线程已 10 秒无响应，窗口当前处于未响应状态");
                stalled = true;
            } else if ok && stalled {
                shell_log!("主线程已恢复");
                stalled = false;
            }
        }
    });
}
