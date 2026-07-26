# ALoad

All-in-One Open Source Downloader for Mobile (Android APK) and PC (Windows / macOS / Linux)

Developed by phoenix14 | Open Source | MIT License

---

## STRICT EDUCATIONAL AND RESEARCH DISCLAIMER

THIS SOFTWARE IS DEVELOPED AND DISTRIBUTED STRICTLY FOR EDUCATIONAL, DEMONSTRATION, AND RESEARCH PURPOSES ONLY.

The developer (phoenix14) assumes no responsibility or liability for any misuse, unauthorized downloading, copyright infringement, or violation of any platform Terms of Service.

Users are solely responsible for ensuring that their use of this software complies with all applicable local, national, and international laws, regulations, and third-party terms of use.

---

## Overview

ALoad is a free, high-performance, open-source media downloading tool created by phoenix14. It provides unified media extraction capabilities across Android mobile devices and desktop PC platforms.

### Supported Target Services
- YouTube (Videos, Audio, Playlists)
- Instagram (Reels, Posts, Stories)
- Facebook (Videos, Reels)
- Pinterest (Single Pins and Full Board Bulk Extraction)
- TikTok (Videos without watermark)
- X / Twitter (Videos)
- Torrents (Magnet URIs and .torrent files)
- Direct URLs (Any HTTP/HTTPS direct media link)

---

## PC Users (Windows / macOS / Linux)

PC users can run ALoad natively using Python 3.

### Requirements for PC
- Python 3.8 or higher
- yt-dlp (automatically installed by main.py if missing)

### How to Run on PC

```bash
# 1. Clone the repository
git clone https://github.com/pheonix14/aload.git
cd aload/ALoad

# 2. Run interactive CLI
python main.py
```

### PC Command-Line Interface (CLI) Usage

```bash
# Download a single video or URL
python main.py "https://www.youtube.com/watch?v=EXAMPLE"

# Download a Pinterest Board (Bulk pins)
python main.py "https://www.pinterest.com/username/boardname/"

# Download audio-only (MP3)
python main.py -f audio "https://www.youtube.com/watch?v=EXAMPLE"

# Specify quality
python main.py -q 1080p "https://www.youtube.com/watch?v=EXAMPLE"

# Bulk download from a text file containing URLs
python main.py -b urls.txt -o downloads/ -w 4
```

---

## Mobile Users (Android APK)

ALoad is also built as a standalone Android application using React Native 0.86 with an embedded background engine.

### Android Features
- Multi-threaded background downloads
- 7-Day offline Pause and Resume state engine
- Built-in Video Player (0.5x to 2.0x playback speed control)
- Built-in Music Player (background audio and queue controls)
- In-App GitHub Update Detection (polls pheonix14/aload releases)

### Building the Android APK

```bash
# 1. Install dependencies
npm install

# 2. Download yt-dlp ARM64 binary for Android bundling
powershell -ExecutionPolicy Bypass -File scripts/download-ytdlp.ps1

# 3. Build Release APK (Windows)
scripts/build-apk.bat
```

The resulting APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## Architecture Summary

```
ALoad Ecosystem
|
+-- PC Version (main.py)
|   +-- Python 3 CLI & API Wrapper
|   +-- Native yt-dlp engine
|   +-- Concurrent ThreadPool Execution
|
+-- Mobile Version (Android APK)
    +-- React Native 0.86 UI Layer
    +-- Embedded Node.js Engine (Port 11337)
    +-- WebTorrent Engine
    +-- SQLite / AsyncStorage State Persistence
```

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

Developed with open-source principles by phoenix14.
https://github.com/pheonix14/aload
