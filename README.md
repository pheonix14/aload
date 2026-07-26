# ALoad 📥
**The free, open-source all-in-one downloader for Android**

> No subscriptions. No ads. No limits. Just downloads.

[![GitHub release](https://img.shields.io/github/v/release/pheonix14/aload)](https://github.com/pheonix14/aload/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Author: phoenix14](https://img.shields.io/badge/Author-phoenix14-purple)](https://github.com/pheonix14)

---

## ✨ Features

| Platform | Downloads |
|----------|-----------|
| 🔴 YouTube | Videos, Audio, Playlists |
| 📸 Instagram | Reels, Stories, Posts |
| 👤 Facebook | Videos, Reels |
| 📌 Pinterest | **Pins + Full Board Bulk Download** |
| 🎵 TikTok | Videos (no watermark) |
| 🐦 X / Twitter | Videos |
| 🧲 Torrents | Magnet Links + .torrent files |
| 🔗 Direct URL | Any direct video/file link |

### Core Capabilities
- ⚡ **Super fast** multi-threaded downloads
- ⏸ **Pause & Resume** — even after 7 days offline
- 📋 **Bulk download** — paste 100 URLs at once
- 📌 **Pinterest Board** — download entire boards automatically
- 🎬 **Built-in Video Player** — plays any downloaded file
- 🎵 **Built-in Music Player** — background audio + lock screen
- 🔔 **Auto-update detection** — connected to this GitHub repo
- 🌙 **Dark theme** — stunning electric blue UI

---

## 📱 Install

Download the latest APK from [**Releases**](https://github.com/pheonix14/aload/releases/latest)

> Enable "Install from unknown sources" in Android Settings → Security

---

## 🔨 Build from Source

### Requirements
- Node.js 18+
- JDK 17
- Android Studio (with SDK 34)

### Steps

```bash
# 1. Clone
git clone https://github.com/pheonix14/aload.git
cd aload/ALoad

# 2. Install dependencies
npm install

# 3. Download yt-dlp binary
powershell -ExecutionPolicy Bypass -File scripts/download-ytdlp.ps1

# 4. Build APK
scripts/build-apk.bat
```

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Run on Device (Debug)
```bash
npx react-native run-android
```

---

## 🏗 Architecture

```
ALoad APK
├── React Native UI (TypeScript)
│   ├── Bottom Tab Nav: Home / Queue / Library
│   ├── Stack: Add Download / Settings / Players
│   └── Zustand global state
│
├── Embedded Node.js Server (port 11337)
│   ├── yt-dlp wrapper (YouTube/IG/FB/Pinterest/TikTok)
│   ├── WebTorrent engine (magnet + .torrent)
│   └── Bulk download queue
│
└── SQLite + AsyncStorage (pause/resume persistence)
```

---

## 🤝 Contributing

PRs welcome! Open an [issue](https://github.com/pheonix14/aload/issues) or submit a PR.

---

## ⚖️ Legal

ALoad is for downloading content **you own** or that is **freely available**. Respect copyright laws in your jurisdiction. The developers are not responsible for misuse.

---

**Made with ❤️ by [phoenix14](https://github.com/pheonix14)**
