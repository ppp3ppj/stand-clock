# StandClock

A modern Pomodoro timer desktop application with system tray support, designed to help you maintain focus and take regular breaks.

## Features

- Customizable work and break durations
- Short and long break cycles
- Activity tracking for breaks (stretch, walk, exercise, hydrate, etc.)
- Session history tracking
- System tray integration - minimize to tray and continue running in background
- Single instance - only one app window can run at a time
- Auto-popup notifications when break time starts or ends
- Sound notifications for timer completion
- Cross-platform support (Windows, Linux)

## Tech Stack

### Frontend
- **[Solid.js](https://www.solidjs.com/)** - Reactive UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vite.dev/)** - Fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[DaisyUI](https://daisyui.com/)** - Tailwind CSS component library
- **[@solidjs/router](https://github.com/solidjs/solid-router)** - Client-side routing

### Backend
- **[Tauri 2.0](https://tauri.app/)** - Rust-based desktop app framework
- **[Rust](https://www.rust-lang.org/)** - Systems programming language
- **[SQLite](https://www.sqlite.org/)** - Embedded database for session history

### Tauri Plugins
- `tauri-plugin-sql` - Database integration
- `tauri-plugin-single-instance` - Prevent multiple app instances
- `tauri-plugin-shell` - Shell command execution
- `tauri-plugin-opener` - File/URL opening

## Development

### Linux (X11) Prerequisites

Install required system dependencies:

**Debian/Ubuntu:**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**Arch Linux:**
```bash
sudo pacman -Syu
sudo pacman -S webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module gtk3 libappindicator-gtk3 librsvg libvips
```

**Fedora:**
```bash
sudo dnf check-update
sudo dnf install webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel
```

### Run Development Server

```bash
bun run tauri:dev
```

### Build

**Linux:**
```bash
bun run tauri:build
```

**Windows:**
```bash
bun run build:windows
```

## Sound Credits

### UI Sounds
- **Click Sounds** - [Kenney.nl UI Audio](https://kenney.nl/assets/ui-audio)
  - `click1.ogg` - Used for button interactions
  - Licensed under CC0 1.0 Universal (Public Domain)

### Notification Sounds
- **Notification Bell** - [Mixkit Sound Effects](https://mixkit.co/free-sound-effects/)
  - `mixkit-notification-bell-592.wav` - Timer completion notification
  - Free for commercial and non-commercial use
  - Source: https://mixkit.co/free-sound-effects/notification/

## Resources
- [Tauri Documentation](https://tauri.app/)
- [Solid.js Documentation](https://www.solidjs.com/)
- [DaisyUI Components](https://daisyui.com/)