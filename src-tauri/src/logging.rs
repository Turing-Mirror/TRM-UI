//! 产品日志。
//!
//! 正式构建没有控制台（`windows_subsystem = "windows"`），所以诊断信息只能
//! 落盘。布局按频道分目录、按天分文件 —— 不是一个无限长的文件，也不是每次
//! 启动开一个新文件：
//!
//! ```text
//! User_Data/logs/
//!   shell/2026-08-26.log
//! ```
//!
//! 保留 48 小时，按文件修改时间，启动时清一次。

use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

static LOG_PATH: std::sync::OnceLock<Option<PathBuf>> = std::sync::OnceLock::new();
/// 串行化追加。写入又小又稀，不存在竞争压力。
static WRITE_LOCK: Mutex<()> = Mutex::new(());

/// 单个文件的上限。超了就滚存一份，保证「今天这份」还读得动。
const MAX_BYTES: u64 = 2 * 1024 * 1024;
/// 保留时长。启动时按修改时间扫一遍。
pub const RETAIN: Duration = Duration::from_secs(2 * 24 * 3600);

pub const CH_SHELL: &str = "shell";

/// 把日志指向产品根。只认第一次调用 —— 免得中途有人把日志重定向走。
pub fn init(root: &Path) {
    let _ = fs::create_dir_all(logs_dir(root).join(CH_SHELL));
    let _ = LOG_PATH.set(Some(daily_path(root, CH_SHELL)));
    sweep(root);
}

fn logs_dir(root: &Path) -> PathBuf {
    crate::paths::logs_dir(root)
}

/// 当前 shell 的当天文件；`init` 没跑过就是 None。
pub fn path() -> Option<PathBuf> {
    LOG_PATH.get().cloned().flatten()
}

pub fn daily_path(root: &Path, channel: &str) -> PathBuf {
    let dir = logs_dir(root).join(channel);
    let _ = fs::create_dir_all(&dir);
    let day = chrono::Local::now().format("%Y-%m-%d");
    dir.join(format!("{day}.log"))
}

fn rotate_if_huge(p: &Path) {
    if fs::metadata(p).map(|m| m.len()).unwrap_or(0) > MAX_BYTES {
        let _ = fs::rename(p, p.with_extension("log.1"));
    }
}

/// 追加一行。**永不 panic、永不阻塞失败** —— 记日志不许成为把软件搞挂的那一环。
pub fn write(line: &str) {
    // 开发时终端里能看到；Windows 正式构建下这一句流向空，正是下面那个文件
    // 存在的全部理由。
    eprintln!("[trm-ui] {line}");

    let Some(p) = path() else {
        return;
    };
    let stamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
    let _guard = WRITE_LOCK.lock().unwrap_or_else(|e| e.into_inner());
    if let Some(dir) = p.parent() {
        let _ = fs::create_dir_all(dir);
    }
    rotate_if_huge(&p);
    if let Ok(mut f) = OpenOptions::new().create(true).append(true).open(&p) {
        let _ = writeln!(f, "{stamp} {line}");
    }
}

fn is_log_name(name: &str) -> bool {
    name.ends_with(".log") || name.ends_with(".log.1")
}

/// 删掉超过保留期的日志，返回删了几个。
pub fn sweep(root: &Path) -> usize {
    let cutoff = std::time::SystemTime::now()
        .checked_sub(RETAIN)
        .unwrap_or(std::time::UNIX_EPOCH);
    sweep_dir(&logs_dir(root), cutoff)
}

fn sweep_dir(dir: &Path, cutoff: std::time::SystemTime) -> usize {
    let Ok(rd) = fs::read_dir(dir) else {
        return 0;
    };
    let mut n = 0;
    for e in rd.flatten() {
        let p = e.path();
        if p.is_dir() {
            n += sweep_dir(&p, cutoff);
            continue;
        }
        let name = p
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("")
            .to_ascii_lowercase();
        if !is_log_name(&name) {
            continue;
        }
        let older = fs::metadata(&p)
            .and_then(|m| m.modified())
            .map(|t| t < cutoff)
            .unwrap_or(false);
        if older && fs::remove_file(&p).is_ok() {
            n += 1;
        }
    }
    n
}

/// 两种写法：`shell_log!("x={x}")` 和 `shell_log!(some_string)`。
///
/// 第二条分支是必须的：运行时拼好的字符串（比如从语言包取出来的）里可能含有
/// `{}`，当成格式串会 panic。
macro_rules! shell_log {
    ($fmt:literal $($arg:tt)*) => {
        $crate::logging::write(&format!($fmt $($arg)*))
    };
    ($msg:expr) => {
        $crate::logging::write(&format!("{}", $msg))
    };
}
pub(crate) use shell_log;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn writing_without_init_is_a_no_op() {
        // 单元测试里从不调 init()。这一句不许 panic。
        write("hello from a test");
    }

    #[test]
    fn rotation_threshold_holds_a_startup_trace() {
        // 一次冷启动的日志大约几十 KB。滚存门槛低于这个数的话，
        // 用户报障时「今天这份」里可能连启动过程都没了。
        const _: () = assert!(MAX_BYTES >= 512 * 1024);
    }

    #[test]
    fn retain_is_two_days() {
        assert_eq!(RETAIN, Duration::from_secs(2 * 24 * 3600));
    }

    #[test]
    fn only_log_files_are_swept() {
        assert!(is_log_name("2026-08-26.log"));
        assert!(is_log_name("2026-08-26.log.1"));
        // 用户数据目录里可能有别的东西，扫日志不许连它们一起删。
        assert!(!is_log_name("app_config.json"));
        assert!(!is_log_name("wallpaper.png"));
    }
}
