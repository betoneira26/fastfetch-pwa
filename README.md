# Fastfetch Web PWA

A modern, lightweight **Fastfetch / Neofetch clone for the web**, designed as an installable Progressive Web App (PWA) with zero external runtime dependencies.

---

## ✨ Features

- **Hardware & System Inspection (Web APIs):**
  - OS, Architecture & Platform detection
  - CPU logical cores (`navigator.hardwareConcurrency`)
  - GPU vendor & unmasked renderer detection via WebGL context
  - Memory estimation (`navigator.deviceMemory`)
  - Storage quota & usage estimate (`navigator.storage.estimate`)
  - Battery status & charging indicator (Battery API)
  - Network connection info (RTT, downlink, effective type)
  - Screen resolution, pixel ratio & color depth
  - Local timezone, locale, session uptime & protocol
- **15 ASCII Distribution Logos:** Auto-detects your OS or lets you select logos for Arch, Ubuntu, Debian, Fedora, NixOS, Alpine, Void, Gentoo, macOS (Apple), Windows 11, Android, ChromeOS, FreeBSD, Tux (Linux), and Fastfetch.
- **8 Color Themes:** Catppuccin Mocha, Tokyo Night, Dracula, Gruvbox Dark, Nord, Monokai Pro, Matrix Green, and Cyberpunk.
- **Retro CRT Mode:** Toggleable scanline and vignette overlay effect.
- **Built-in Interactive CLI:** Terminal input line supporting commands like `help`, `fetch`, `theme <name>`, `logo <name>`, `crt`, `clear`, and `json`.
- **Export & Share:** Export clean PNG screenshots directly from canvas or copy formatted plain text to clipboard.
- **Offline PWA Support:** Service Worker caching (`sw.js`) with Web App Manifest (`manifest.json`) for standalone home screen / desktop installation.

---

## 📁 Project Structure

```
fastfetch-pwa/
├── index.html      # Main HTML structure and UI layout
├── style.css       # Terminal styling, themes, and CRT scanline overlay
├── app.js         # System detection logic, ASCII logos, and CLI handler
├── manifest.json   # PWA manifest configuration
├── sw.js         # Service worker for offline caching
├── icon.svg       # Vector PWA application icon
└── README.md      # Documentation
```

---

## 🚀 Getting Started

Serve the directory using any static HTTP server:

```bash
cd /home/simon/projects/fastfetch-pwa
python3 -m http.server 8080
```

Open your browser and navigate to:

```
http://localhost:8080
```

---

## 💻 CLI Commands

Within the terminal prompt at the bottom of the page, you can run:

| Command | Description |
|---|---|
| `help` | Lists all available interactive CLI commands |
| `fetch` | Refreshes and re-renders the system specification table |
| `theme <name>` | Switches theme (`catppuccin`, `tokyonight`, `dracula`, `gruvbox`, `nord`, `monokai`, `matrix`, `cyberpunk`) |
| `logo <name>` | Sets ASCII logo (`arch`, `ubuntu`, `debian`, `fedora`, `nixos`, `alpine`, `void`, `gentoo`, `apple`, `windows`, `android`, `chromeos`, `freebsd`, `tux`, `fastfetch`, `auto`) |
| `crt` | Toggles retro CRT scanline overlay |
| `json` | Dumps raw detected system information in JSON format |
| `clear` / `cls` | Clears terminal history |
