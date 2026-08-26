//! 托盘图标。
//!
//! 有托盘，「关闭窗口」才可以不等于「退出程序」—— 后台还有事要做的产品必须
//! 有这一层。托盘**永远存在**，不是只有用户勾了「最小化到托盘」才建：
//! 否则那个开关一打开就得现建图标，而建失败是没有任何提示的。

use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager};

use crate::logging::shell_log;

/// 把主窗口叫到前面来。托盘的存在意义就是这一个动作，所以它要经得起
/// 「窗口被最小化了」「窗口被隐藏了」「窗口跑到屏幕外了」三种情况。
pub fn focus_main(app: &AppHandle) {
    let Some(win) = app.get_webview_window("main") else {
        return;
    };
    let _ = win.unminimize();
    let _ = win.show();
    let _ = win.set_focus();
    crate::window_watch::rescue_if_offscreen(&win);
}

pub fn install(app: &AppHandle, tooltip: &str) -> Result<(), String> {
    let show = MenuItem::with_id(app, "show", crate::i18n::t("ui.tray.show"), true, None::<&str>)
        .map_err(|e| e.to_string())?;
    let quit = MenuItem::with_id(app, "quit", crate::i18n::t("ui.tray.quit"), true, None::<&str>)
        .map_err(|e| e.to_string())?;
    let menu = Menu::with_items(app, &[&show, &quit]).map_err(|e| e.to_string())?;

    TrayIconBuilder::with_id("main")
        .tooltip(tooltip)
        .icon(
            app.default_window_icon()
                .cloned()
                .ok_or_else(|| "没有可用的窗口图标，托盘无法创建".to_string())?,
        )
        .menu(&menu)
        // 左键点图标是「打开窗口」，不是「弹菜单」。菜单只走右键 —— 这是
        // Windows 上所有托盘程序的约定。
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "show" => focus_main(app),
            "quit" => {
                shell_log!("用户从托盘菜单退出");
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            // **只认左键，而且只认松开那一下。**
            //
            // `TrayIconEvent::Click` 对每个按键都会触发，右键也不例外。而
            // Windows 上右键菜单是一个由隐藏消息窗口拥有的弹出菜单：菜单还在
            // 的时候去 focus 另一个窗口，系统会立刻把菜单收掉 —— 表现就是
            // 「右键菜单闪一下就没了」。
            //
            // 同时匹配 Down 的话，一次点击会触发两遍。
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                focus_main(&tray.app_handle().clone());
            }
        })
        .build(app)
        .map_err(|e| e.to_string())?;
    Ok(())
}
