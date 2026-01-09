use tauri_plugin_sql::{Migration, MigrationKind};
use std::fs;
use tauri::{Manager, menu::{Menu, MenuItem}, tray::{TrayIconBuilder, TrayIconEvent}};
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
            description: "create initial database schema",
            sql: "CREATE TABLE IF NOT EXISTS timer_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                work_duration INTEGER NOT NULL DEFAULT 25,
                short_break_duration INTEGER NOT NULL DEFAULT 5,
                long_break_duration INTEGER NOT NULL DEFAULT 15,
                sessions_before_long_break INTEGER NOT NULL DEFAULT 4,
                sound_enabled INTEGER NOT NULL DEFAULT 1,
                default_break_activity TEXT DEFAULT 'ask' CHECK (default_break_activity IN ('ask', 'stretch', 'walk', 'exercise', 'hydrate', 'rest', 'other')),
                show_cycle_preview INTEGER NOT NULL DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            INSERT OR IGNORE INTO timer_settings (id, work_duration, short_break_duration, long_break_duration, sessions_before_long_break, sound_enabled, default_break_activity, show_cycle_preview)
            VALUES (1, 25, 5, 15, 4, 1, 'ask', 1);

            CREATE TABLE IF NOT EXISTS session_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_type TEXT NOT NULL CHECK (session_type IN ('pomodoro', 'shortBreak', 'longBreak')),
                event_type TEXT NOT NULL CHECK (event_type IN ('completed', 'skipped', 'manual_switch')),
                timestamp TEXT NOT NULL DEFAULT (datetime('now')),
                duration INTEGER NOT NULL,
                expected_duration INTEGER NOT NULL,
                session_number INTEGER,
                activity_type TEXT CHECK (activity_type IN ('stretch', 'walk', 'exercise', 'hydrate', 'rest', 'other')),
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE INDEX idx_session_history_timestamp ON session_history(timestamp DESC);
            CREATE INDEX idx_session_history_type ON session_history(session_type, event_type);",
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
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // When a second instance is launched, focus the existing window
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            // Create tray menu
            let show_i = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            // Build tray icon
            let _tray = TrayIconBuilder::with_id("main")
                .tooltip("StandClock")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.unminimize();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button, button_state, .. } = event {
                        if button == tauri::tray::MouseButton::Left && button_state == tauri::tray::MouseButtonState::Up {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.unminimize();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            // Prevent window close from exiting app - just hide it
            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        // Prevent the window from closing
                        api.prevent_close();
                        // Hide the window instead
                        let _ = window_clone.hide();
                    }
                });
            }

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
