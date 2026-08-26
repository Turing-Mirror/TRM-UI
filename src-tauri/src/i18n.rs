//! 壳侧 i18n —— 和 React 界面**共用同一批语言包**（`i18n/locales/*.json`）。
//!
//! 为什么壳也要 i18n：托盘菜单、通知、原生对话框的按钮文字都由 Rust 画，
//! 界面那边翻译得再全也管不到它们。共用一份语言包是为了不出现「界面是日文、
//! 托盘是中文」这种半拉子状态。
//!
//! 加载顺序：`<root>/i18n/locales/{code}.json` → 打进二进制的 zh-CN 兜底。
//! 找不到就用兜底，永远不会因为少一个文件而崩。

use std::collections::HashMap;
use std::path::Path;
use std::sync::{Mutex, OnceLock};

use serde_json::Value;

/// 兜底语言包，编译期打进二进制。
///
/// 必须有：安装包漏放资源、用户误删目录、绿色版被解压到只读位置 —— 这些情况下
/// 托盘菜单会变成一串 `tray.show` 这样的 key，比错误的翻译更难看懂。
const FALLBACK: &str = include_str!("../../i18n/locales/zh-CN.json");

const DEFAULT_LOCALE: &str = "zh-CN";

const SUPPORTED: &[&str] = &[
    "zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR", "es-ES", "fr-FR", "ru-RU",
];

pub fn supported(code: &str) -> bool {
    SUPPORTED.contains(&code)
}

struct State {
    locale: String,
    pack: Value,
    fallback: Value,
}

fn state() -> &'static Mutex<State> {
    static S: OnceLock<Mutex<State>> = OnceLock::new();
    S.get_or_init(|| {
        let fallback = serde_json::from_str(FALLBACK).unwrap_or(Value::Null);
        Mutex::new(State {
            locale: DEFAULT_LOCALE.into(),
            pack: fallback.clone(),
            fallback,
        })
    })
}

fn locales_dir(root: &Path) -> Vec<std::path::PathBuf> {
    vec![
        // 打包后 Tauri 把 resources 放在 exe 旁边
        root.join("shell-i18n").join("locales"),
        // 开发时直接读仓库里的那份
        root.join("i18n").join("locales"),
    ]
}

fn load_pack(root: &Path, code: &str) -> Option<Value> {
    for dir in locales_dir(root) {
        let p = dir.join(format!("{code}.json"));
        if let Ok(text) = std::fs::read_to_string(&p) {
            if let Ok(v) = serde_json::from_str::<Value>(&text) {
                return Some(v);
            }
        }
    }
    None
}

/// 启动时按配置里的语言初始化。配置为空（新装）时留在默认语言 ——
/// 系统语言的判断在前端做，那边拿得到 `navigator.language`。
pub fn init(root: &Path, code: &str) {
    let code = if supported(code) { code } else { DEFAULT_LOCALE };
    set_locale_at(root, code);
}

pub fn set_locale_at(root: &Path, code: &str) {
    if !supported(code) {
        return;
    }
    let pack = load_pack(root, code)
        .or_else(|| load_pack(root, DEFAULT_LOCALE))
        .unwrap_or_else(|| state().lock().map(|s| s.fallback.clone()).unwrap_or(Value::Null));
    if let Ok(mut s) = state().lock() {
        s.locale = code.to_string();
        s.pack = pack;
    }
}

// 模板给产品用的 API，模板本身没有调用点。别因为「没人用」把它删了 ——
// 删掉的那天，下一个产品会自己重写一遍，而且多半写得没有这个对。
#[allow(dead_code)]
pub fn current() -> String {
    state()
        .lock()
        .map(|s| s.locale.clone())
        .unwrap_or_else(|_| DEFAULT_LOCALE.into())
}

/// 点号路径查找，和前端 `dict.ts` 的 `lookup` 行为一致：
/// 逐段往下走，中途也试一次「剩下的整串当字面 key」，
/// 这样嵌套写法和平铺写法都能查到。
fn lookup<'a>(root: &'a Value, key: &str) -> Option<&'a str> {
    let parts: Vec<&str> = key.split('.').filter(|s| !s.is_empty()).collect();
    if parts.is_empty() {
        return None;
    }
    let mut cur = root;
    for (i, part) in parts.iter().enumerate() {
        let obj = cur.as_object()?;
        if let Some(next) = obj.get(*part) {
            cur = next;
            continue;
        }
        let rest = parts[i..].join(".");
        return obj.get(&rest).and_then(|v| v.as_str());
    }
    cur.as_str()
}

/// 翻译一条。查不到就把 key 原样返回 —— 开发时一眼看得出哪条漏了。
pub fn t(key: &str) -> String {
    let Ok(s) = state().lock() else {
        return key.to_string();
    };
    lookup(&s.pack, key)
        .or_else(|| lookup(&s.fallback, key))
        .unwrap_or(key)
        .to_string()
}

/// 带占位符的翻译。支持 `{name}`，以及从左到右按 `v0`、`v1`… 取值的裸 `{}`
/// —— 和前端 `interpolate` 同一套规则，一份语言包两边都能用。
// 模板给产品用的 API，模板本身没有调用点。别因为「没人用」把它删了 ——
// 删掉的那天，下一个产品会自己重写一遍，而且多半写得没有这个对。
#[allow(dead_code)]
pub fn t_vars(key: &str, vars: &HashMap<String, String>) -> String {
    interpolate(&t(key), vars)
}

/// 只有一个参数时的快捷写法。
// 模板给产品用的 API，模板本身没有调用点。别因为「没人用」把它删了 ——
// 删掉的那天，下一个产品会自己重写一遍，而且多半写得没有这个对。
#[allow(dead_code)]
pub fn t1(key: &str, v0: impl std::fmt::Display) -> String {
    let mut m = HashMap::new();
    m.insert("v0".to_string(), v0.to_string());
    t_vars(key, &m)
}

#[allow(dead_code)] // 经 t_vars 使用；t_vars 本身是给产品用的
fn interpolate(template: &str, vars: &HashMap<String, String>) -> String {
    let mut out = String::with_capacity(template.len());
    let mut rest = template;
    let mut slot = 0usize;
    while let Some(open) = rest.find('{') {
        out.push_str(&rest[..open]);
        let after = &rest[open + 1..];
        let Some(close) = after.find('}') else {
            // 没有配对的右括号：原样输出，不要吞掉剩下的文本。
            out.push_str(&rest[open..]);
            return out;
        };
        let name = &after[..close];
        let value = if name.is_empty() {
            let v = vars.get(&format!("v{slot}")).cloned();
            slot += 1;
            // 取不到就把 `{}` 原样留着 —— 悄悄变成空串会让人以为是文案写错了。
            v.unwrap_or_else(|| "{}".to_string())
        } else {
            vars.get(name).cloned().unwrap_or_default()
        };
        out.push_str(&value);
        rest = &after[close + 1..];
    }
    out.push_str(rest);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_embedded_fallback_actually_parses() {
        // 这份是编译期打进来的。它坏掉的话，托盘菜单会整片显示成 key。
        let v: Value = serde_json::from_str(FALLBACK).expect("兜底语言包必须是合法 JSON");
        assert!(v.is_object());
    }

    #[test]
    fn the_fallback_carries_the_keys_the_shell_uses() {
        let v: Value = serde_json::from_str(FALLBACK).unwrap();
        for key in ["ui.window.close", "ui.window.minimize"] {
            assert!(lookup(&v, key).is_some(), "兜底语言包缺 {key}");
        }
    }

    #[test]
    fn lookup_walks_dotted_paths() {
        let v: Value = serde_json::from_str(r#"{"a":{"b":{"c":"hit"}}}"#).unwrap();
        assert_eq!(lookup(&v, "a.b.c"), Some("hit"));
        assert_eq!(lookup(&v, "a.b.missing"), None);
        assert_eq!(lookup(&v, ""), None);
    }

    #[test]
    fn lookup_also_accepts_flat_keys() {
        // 同一份包里两种写法都要能查到。
        let v: Value = serde_json::from_str(r#"{"a":{"b.c":"flat"}}"#).unwrap();
        assert_eq!(lookup(&v, "a.b.c"), Some("flat"));
    }

    #[test]
    fn interpolate_fills_named_and_positional() {
        let mut m = HashMap::new();
        m.insert("name".to_string(), "Kara".to_string());
        m.insert("v0".to_string(), "1".to_string());
        m.insert("v1".to_string(), "2".to_string());
        assert_eq!(interpolate("你好 {name}", &m), "你好 Kara");
        assert_eq!(interpolate("{} / {}", &m), "1 / 2");
    }

    #[test]
    fn interpolate_leaves_unmatched_braces_alone() {
        let m = HashMap::new();
        // 缺参数时保留 `{}`，别悄悄变成空串 —— 那看起来像文案写错了。
        assert_eq!(interpolate("{}", &m), "{}");
        // 没配对的括号不许吞掉后面的文本。
        assert_eq!(interpolate("a {b", &m), "a {b");
    }

    #[test]
    fn unknown_key_returns_itself() {
        assert_eq!(t("nope.not.here"), "nope.not.here");
    }

    #[test]
    fn only_known_locales_are_accepted() {
        assert!(supported("ja-JP"));
        assert!(!supported("de-DE"));
        assert!(!supported(""));
    }
}
