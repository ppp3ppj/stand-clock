# Tauri + Solid + Typescript

This template should help get you started developing with Tauri, Solid and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

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

**Windows (from Linux using cargo-xwin):**
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