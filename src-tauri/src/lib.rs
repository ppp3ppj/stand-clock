use tauri_plugin_sql::{Migration, MigrationKind};
use std::fs;
use tauri::Manager;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        // Define your migrations here
        Migration {
            version: 1,
            description: "create timer_settings table",
            sql: "CREATE TABLE IF NOT EXISTS timer_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                work_duration INTEGER NOT NULL DEFAULT 25,
                short_break_duration INTEGER NOT NULL DEFAULT 5,
                long_break_duration INTEGER NOT NULL DEFAULT 15,
                sessions_before_long_break INTEGER NOT NULL DEFAULT 4,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            INSERT OR IGNORE INTO timer_settings (id, work_duration, short_break_duration, long_break_duration, sessions_before_long_break)
            VALUES (1, 25, 5, 15, 4);",
            kind: MigrationKind::Up,
        }
    ];
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:standclock.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            #[cfg(target_os = "linux")]
            {
                let cache_dir = app.path().cache_dir()?;
                let package_info = app.package_info();
                let app_name = package_info.name.as_str();
                let app_cache = cache_dir.join(app_name);
                if app_cache.exists() {
                    let _ = fs::remove_dir_all(&app_cache);
                }
                
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
