//! 应用设置 —— `User_Data/app_config.json`。
//!
//! 有意做成**自由的 JSON 字典**而不是强类型 struct：产品各自要存的东西差别
//! 很大，模板不该替它们定 schema。壳只保证四件事：
//!
//!   1. 缺键时用默认值补齐（`defaults()`）—— 升级加了新键，老配置不会读出 null；
//!   2. 写入是原子的（临时文件 + rename），中途断电不会留半份 JSON；
//!   3. 解析失败时**把坏文件改名留档**，不是直接覆盖 —— 用户的设置可能还救得回来；
//!   4. 只做浅合并（patch），前端不必每次都回传整份配置。

use std::path::Path;

use serde_json::{json, Map, Value};

use crate::logging::shell_log;

/// 壳自己要用的键。产品把自己的键加在这里。
///
/// 每一个键都要有默认值。少一个默认值，界面上那一项在新装的机器上就是空的，
/// 而空和「用户特意清掉了」长得一模一样。
pub fn defaults() -> Map<String, Value> {
    let mut m = Map::new();
    // 界面语言。为空表示还没选过 —— 由前端按系统语言预选。
    m.insert("ui_locale".into(), json!(""));
    // 配色：system / light / dark。
    m.insert("theme_mode".into(), json!("system"));
    // 壁纸。空表示不画。
    m.insert("wallpaper_path".into(), json!(""));
    m.insert("wallpaper_blur".into(), json!(40));
    m.insert("wallpaper_opacity".into(), json!(70));
    // 关掉窗口时是收进托盘还是真的退出。
    m.insert("close_to_tray".into(), json!(false));
    m
}

fn merge_defaults(mut cfg: Map<String, Value>) -> Map<String, Value> {
    for (k, v) in defaults() {
        cfg.entry(k).or_insert(v);
    }
    cfg
}

/// 读配置。任何失败都退回默认值 —— 这个函数不许失败，调用方全都在启动路径上。
pub fn read(root: &Path) -> Map<String, Value> {
    let path = crate::paths::app_config_path(root);
    let Ok(text) = std::fs::read_to_string(&path) else {
        return merge_defaults(Map::new());
    };
    match serde_json::from_str::<Value>(&text) {
        Ok(Value::Object(m)) => merge_defaults(m),
        _ => {
            // 坏文件改名留档，**不要**直接覆盖。用户可能改错了一个字符，
            // 手工救得回来；覆盖掉就真没了。
            let bak = path.with_extension("json.bad");
            let _ = std::fs::rename(&path, &bak);
            shell_log!("配置无法解析，已留档到 {}，本次使用默认值", bak.display());
            merge_defaults(Map::new())
        }
    }
}

/// 整份写回。原子替换：先写临时文件再 rename，中途断电不会留半份 JSON。
pub fn write_all(root: &Path, cfg: &Map<String, Value>) -> Result<(), String> {
    let path = crate::paths::app_config_path(root);
    if let Some(dir) = path.parent() {
        std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    }
    let body = serde_json::to_string_pretty(cfg).map_err(|e| e.to_string())?;
    let tmp = path.with_extension("json.tmp");
    std::fs::write(&tmp, body).map_err(|e| e.to_string())?;
    // Windows 上 rename 到已存在的文件会失败，先删。这一步失败不致命 ——
    // 目标不存在时删除本来就会报错。
    let _ = std::fs::remove_file(&path);
    std::fs::rename(&tmp, &path).map_err(|e| e.to_string())
}

/// 浅合并一批键并落盘，返回合并后的整份配置。
///
/// 浅合并是有意的：深合并会让「把某个对象清空」变得无法表达 —— 前端传
/// `{}` 的意思是「这一项设为空对象」，深合并会把它理解成「什么都别改」。
pub fn patch(root: &Path, patch: &Map<String, Value>) -> Result<Map<String, Value>, String> {
    let mut cfg = read(root);
    for (k, v) in patch {
        cfg.insert(k.clone(), v.clone());
    }
    write_all(root, &cfg)?;
    Ok(cfg)
}

/// 取字符串键，缺了或类型不对就返回空串。
pub fn str_of(cfg: &Map<String, Value>, key: &str) -> String {
    cfg.get(key).and_then(|v| v.as_str()).unwrap_or("").to_string()
}

pub fn bool_of(cfg: &Map<String, Value>, key: &str) -> bool {
    cfg.get(key).and_then(|v| v.as_bool()).unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmp_root(tag: &str) -> std::path::PathBuf {
        let p = std::env::temp_dir().join(format!("trm-ui-cfg-{}-{}", tag, std::process::id()));
        let _ = std::fs::remove_dir_all(&p);
        std::fs::create_dir_all(p.join("User_Data")).unwrap();
        p
    }

    #[test]
    fn every_default_key_has_a_value() {
        // 少一个默认值，界面上那一项在新装的机器上就是空的。
        for (k, v) in defaults() {
            assert!(!v.is_null(), "{k} 的默认值是 null");
        }
    }

    #[test]
    fn reading_a_missing_file_gives_defaults() {
        let root = tmp_root("missing");
        let cfg = read(&root);
        assert_eq!(str_of(&cfg, "theme_mode"), "system");
        let _ = std::fs::remove_dir_all(&root);
    }

    #[test]
    fn patch_is_shallow_and_survives_a_round_trip() {
        let root = tmp_root("patch");
        let mut p = Map::new();
        p.insert("theme_mode".into(), json!("dark"));
        let cfg = patch(&root, &p).unwrap();
        assert_eq!(str_of(&cfg, "theme_mode"), "dark");
        // 没被 patch 的键必须留着
        assert_eq!(cfg.get("wallpaper_blur"), Some(&json!(40)));
        // 落盘之后再读出来仍然是它
        assert_eq!(str_of(&read(&root), "theme_mode"), "dark");
        let _ = std::fs::remove_dir_all(&root);
    }

    #[test]
    fn a_corrupt_file_is_kept_aside_not_overwritten() {
        let root = tmp_root("corrupt");
        let path = crate::paths::app_config_path(&root);
        std::fs::write(&path, "{ this is not json").unwrap();
        let cfg = read(&root);
        // 退回默认值，同时坏文件还在
        assert_eq!(str_of(&cfg, "theme_mode"), "system");
        assert!(path.with_extension("json.bad").is_file());
        let _ = std::fs::remove_dir_all(&root);
    }

    #[test]
    fn an_upgrade_that_adds_a_key_does_not_read_null() {
        let root = tmp_root("upgrade");
        // 老版本存下的配置里没有 close_to_tray
        std::fs::write(
            crate::paths::app_config_path(&root),
            r#"{"theme_mode":"light"}"#,
        )
        .unwrap();
        let cfg = read(&root);
        assert_eq!(str_of(&cfg, "theme_mode"), "light");
        assert_eq!(cfg.get("close_to_tray"), Some(&json!(false)));
        let _ = std::fs::remove_dir_all(&root);
    }
}
