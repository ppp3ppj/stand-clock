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
        },
        Migration {
            version: 2,
            description: "add sound_enabled to timer_settings",
            sql: "ALTER TABLE timer_settings ADD COLUMN sound_enabled INTEGER NOT NULL DEFAULT 1;",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create session tracking tables",
            sql: "
            -- Sessions table to track individual timer sessions
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_type TEXT NOT NULL CHECK(session_type IN ('pomodoro', 'shortBreak', 'longBreak')),
                status TEXT NOT NULL CHECK(status IN ('completed', 'skipped', 'abandoned')),
                planned_duration INTEGER NOT NULL,
                actual_duration INTEGER NOT NULL,
                started_at TIMESTAMP NOT NULL,
                completed_at TIMESTAMP NOT NULL,
                date TEXT NOT NULL,
                break_activity TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
            CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(session_type);

            -- Daily stats table for aggregated statistics
            CREATE TABLE IF NOT EXISTS daily_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT UNIQUE NOT NULL,
                work_sessions_completed INTEGER DEFAULT 0,
                work_sessions_skipped INTEGER DEFAULT 0,
                break_sessions_completed INTEGER DEFAULT 0,
                break_sessions_skipped INTEGER DEFAULT 0,
                total_sessions_started INTEGER DEFAULT 0,
                total_work_time INTEGER DEFAULT 0,
                total_break_time INTEGER DEFAULT 0,
                total_standing_time INTEGER DEFAULT 0,
                total_exercise_time INTEGER DEFAULT 0,
                standing_breaks INTEGER DEFAULT 0,
                walking_breaks INTEGER DEFAULT 0,
                stretching_breaks INTEGER DEFAULT 0,
                other_breaks INTEGER DEFAULT 0,
                completion_rate REAL DEFAULT 0.0,
                focus_score REAL DEFAULT 0.0,
                is_streak_day INTEGER DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

            -- Streak info table to track user streaks
            CREATE TABLE IF NOT EXISTS streak_info (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_activity_date TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            INSERT OR IGNORE INTO streak_info (id, current_streak, longest_streak) VALUES (1, 0, 0);
            ",
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
