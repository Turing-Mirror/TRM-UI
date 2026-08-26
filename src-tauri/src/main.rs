// 正式构建不要控制台窗口。去掉这一行，用户双击 exe 会先弹一个黑框。
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    trm_ui_lib::run()
}
