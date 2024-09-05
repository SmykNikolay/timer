// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::process::Command;
use std::thread;
use std::time::Duration;


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, close_app_in])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}



#[tauri::command]
fn close_app_in(minutes: u64, app_name: String) -> Result<String, String> {
    let seconds = minutes * 60;
    let app_clone = app_name.clone();
    thread::spawn(move || {
        thread::sleep(Duration::from_secs(seconds));
        let output = Command::new("osascript")
            .arg("-e")
            .arg(format!("tell application \"{}\" to quit", app_clone))
            .output()
            .expect("Failed to execute osascript");

        if output.status.success() {
            println!("Приложение '{}' успешно закрыто.", app_clone);
        } else {
            eprintln!("Ошибка: Приложение '{}' не найдено или не удалось закрыть.", app_clone);
        }
    });
    Ok(format!("Приложение '{}' будет закрыто через {} минут(ы).", app_name, minutes))
}
