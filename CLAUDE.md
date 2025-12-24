# Project: Stand Clock (Pomodoro Timer)

## 🔴 Critical Context (Read First)
- **Frontend**: TypeScript + SolidJS + Vite
- **Styling**: Tailwind CSS + DaisyUI
- **Icons**: Remix Icon
- **Backend**: Rust + Tauri v2
- **Package Manager**: bun
- **Database**: SQLite (via Tauri)
- **Architecture**: Repository pattern with Unit of Work

## Project Structure
```
src/                    # SolidJS frontend
  ├── components/       # SolidJS components
  ├── contexts/         # SolidJS contexts (Theme, Timer, Session)
  ├── hooks/           # Custom SolidJS hooks
  ├── pages/           # Page components
  ├── repositories/    # Data access layer
  └── utils/           # Utility functions

src-tauri/             # Rust backend
  ├── src/            # Rust source code
  └── Cargo.toml      # Rust dependencies
```

## Commands That Work
```bash
# Development
bun install              # Install dependencies
bun run tauri dev        # Start dev server with Tauri
bun run tauri build      # Build for production

# Type Checking
bun run typecheck        # TypeScript validation (if configured)

# Tauri-specific
cd src-tauri
cargo build              # Build Rust backend only
cargo run                # Run Rust backend only
cargo test               # Run Rust tests
```

## Key Features
- Pomodoro timer with customizable durations
- Session tracking and statistics
- Break activity management
- Theme customization
- Sound effects and notifications
- Session cycle visualization

## Important Files
- [vite.config.ts](vite.config.ts) - Vite configuration
- [tsconfig.json](tsconfig.json) - TypeScript configuration
- [src-tauri/tauri.conf.json](src-tauri/tauri.conf.json) - Tauri configuration
- [src-tauri/Cargo.toml](src-tauri/Cargo.toml) - Rust dependencies
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture documentation
- [REFACTORING.md](REFACTORING.md) - Refactoring notes

## Development Notes
- Uses Repository pattern for data persistence
- Session tracking via SolidJS Context
- Timer state managed with custom hooks
- SQLite database accessed through Tauri APIs
- Styled with Tailwind CSS + DaisyUI components
- Icons from Remix Icon library
