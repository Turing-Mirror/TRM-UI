//! 产品根目录与 User_Data 的位置。
//!
//! 「根目录」有两种形态，必须都认得：
//!   - **安装后**：exe 旁边就是根，`User_Data/` 和 `frontend/` 都在同级。
//!   - **开发时**：`cargo run` 的 exe 在 `src-tauri/target/debug/`，根在上面几层。
//!
//! 认错根的后果是安静的：日志写进了一个谁也不会去看的目录，配置存到了另一个
//! 地方，重启之后用户的设置「自己没了」。所以这里宁可多试几种形态。

use std::path::{Path, PathBuf};

/// 根目录的标记文件。换产品时改这里 —— 挑一个**一定会跟着产品走**的文件，
/// 别挑 `package.json` 这种开发时才有的。
const ROOT_MARKERS: &[&str] = &["User_Data", "frontend", "trm-ui.root"];

fn looks_like_root(p: &Path) -> bool {
    ROOT_MARKERS.iter().any(|m| p.join(m).exists())
}

/// 产品根目录。
///
/// 顺序：环境变量 → 从 exe 往上找 → 从 cwd 往上找 → 退回 cwd。
/// 每一步都要求命中标记，找不到才往下走。
pub fn product_root() -> PathBuf {
    // 1) 环境变量。打包测试和开发时用，正式运行不该依赖它。
    if let Ok(v) = std::env::var("TRM_ROOT") {
        let p = PathBuf::from(v);
        if p.is_dir() {
            return p;
        }
    }

    // 2) 从 exe 往上爬。安装后第一层就命中；cargo run 时要爬过
    //    target/debug → target → src-tauri。
    if let Ok(exe) = std::env::current_exe() {
        let mut cur = exe.parent().map(|p| p.to_path_buf());
        for _ in 0..8 {
            let Some(p) = cur.clone() else { break };
            if looks_like_root(&p) {
                return p;
            }
            // `.../src-tauri/target/debug` → 仓库根在 src-tauri 的上一层
            if p.join("src-tauri").is_dir() {
                return p;
            }
            cur = p.parent().map(|x| x.to_path_buf());
        }
        // 一路没命中：安装后的形态就是「exe 旁边」，直接用它。
        // 首次运行时 User_Data 还不存在，标记自然命不中 —— 这一步不能省。
        if let Some(dir) = exe.parent() {
            return dir.to_path_buf();
        }
    }

    // 3) 当前工作目录及其上层。`npm run tauri dev` 从仓库根起，
    //    直接 `cargo run` 从 src-tauri 起。
    if let Ok(cwd) = std::env::current_dir() {
        if looks_like_root(&cwd) || cwd.join("src-tauri").is_dir() {
            return cwd;
        }
        if cwd.ends_with("src-tauri") {
            if let Some(repo) = cwd.parent() {
                return repo.to_path_buf();
            }
        }
        return cwd;
    }

    PathBuf::from(".")
}

/// 用户数据。**产品自己的文件和用户的文件必须分开**：升级安装会覆盖产品目录，
/// 用户数据放进去就会在某次更新后凭空消失。
pub fn user_data(root: &Path) -> PathBuf {
    root.join("User_Data")
}

pub fn logs_dir(root: &Path) -> PathBuf {
    user_data(root).join("logs")
}

pub fn app_config_path(root: &Path) -> PathBuf {
    user_data(root).join("app_config.json")
}

/// 启动时建目录。失败不致命 —— 只读安装位置（Program Files）下写不进去是
/// 真实存在的情况，日志和配置各自会退化成「不落盘」，软件本身照常用。
pub fn ensure_user_dirs(root: &Path) -> std::io::Result<()> {
    std::fs::create_dir_all(logs_dir(root).join("shell"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn user_data_never_sits_outside_the_root() {
        let root = Path::new("/opt/app");
        assert!(user_data(root).starts_with(root));
        assert!(logs_dir(root).starts_with(user_data(root)));
        assert!(app_config_path(root).starts_with(user_data(root)));
    }

    #[test]
    fn product_root_always_answers() {
        // 任何环境下都必须给出一个路径，不能 panic —— 它跑在 main 的第一行。
        let r = product_root();
        assert!(!r.as_os_str().is_empty());
    }
}
