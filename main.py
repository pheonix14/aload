"""
ALoad - All-in-One Downloader for PC (Windows / macOS / Linux)
Developed by phoenix14

DISCLAIMER:
This software is developed strictly for EDUCATIONAL AND RESEARCH PURPOSES ONLY.
The author (phoenix14) takes no responsibility for any misuse of this tool.
Users are solely responsible for ensuring compliance with applicable laws, copyright, and platform Terms of Service.
"""

import os
import sys
import argparse
import subprocess
import urllib.parse
import json
from concurrent.futures import ThreadPoolExecutor

VERSION = "1.0.0"
AUTHOR = "phoenix14"
GITHUB_REPO = "pheonix14/aload"

DISCLAIMER_TEXT = f"""
======================================================================
ALoad PC Downloader v{VERSION}
Developed by {AUTHOR} | Open Source

NOTICE:
This software is provided strictly for educational and research
purposes. Ensure you have proper authorization before downloading any
media content. Respect copyright laws and platform terms of service.
======================================================================
"""

def check_ytdlp():
    try:
        subprocess.run(["yt-dlp", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return True
    except Exception:
        return False

def install_ytdlp():
    print("[INFO] yt-dlp is required. Installing via pip...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "yt-dlp"], check=True)
        print("[SUCCESS] yt-dlp installed successfully.")
        return True
    except Exception as e:
        console_err(f"Failed to install yt-dlp automatically: {e}")
        console_err("Please install yt-dlp manually using: pip install yt-dlp")
        return False

def console_err(msg):
    sys.stderr.write(f"[ERROR] {msg}\n")

def detect_platform(url):
    u = url.lower().strip()
    if u.startswith("magnet:") or u.endswith(".torrent"):
        return "torrent"
    if "youtube.com" in u or "youtu.be" in u:
        return "youtube"
    if "instagram.com" in u:
        return "instagram"
    if "facebook.com" in u or "fb.watch" in u:
        return "facebook"
    if "pinterest.com" in u or "pin.it" in u:
        return "pinterest"
    if "tiktok.com" in u:
        return "tiktok"
    if "twitter.com" in u or "x.com" in u:
        return "twitter"
    if "reddit.com" in u:
        return "reddit"
    return "direct"

def download_single(url, output_dir="downloads", format_type="video", quality="best"):
    os.makedirs(output_dir, exist_ok=True)
    platform = detect_platform(url)
    print(f"[INFO] Target: {url}")
    print(f"[INFO] Detected Platform: {platform.upper()}")
    print(f"[INFO] Output Directory: {os.path.abspath(output_dir)}")

    cmd = ["yt-dlp", "--newline", "--continue", "--no-playlist"]

    if format_type == "audio":
        cmd.extend(["-f", "bestaudio", "-x", "--audio-format", "mp3"])
    else:
        quality_map = {
            "1080p": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
            "720p": "bestvideo[height<=720]+bestaudio/best[height<=720]",
            "480p": "bestvideo[height<=480]+bestaudio/best[height<=480]",
            "360p": "bestvideo[height<=360]+bestaudio/best[height<=360]",
            "best": "bestvideo+bestaudio/best"
        }
        fmt = quality_map.get(quality, quality_map["best"])
        cmd.extend(["-f", fmt])

    if platform == "pinterest" and ("/board/" in url or "/boards/" in url):
        print("[INFO] Pinterest Board URL detected. Extracting all pins...")
        cmd.remove("--no-playlist")
        cmd.extend(["--playlist-items", "1-500"])

    output_template = os.path.join(output_dir, "%(title)s.%(ext)s")
    cmd.extend(["-o", output_template, url])

    try:
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
        for line in process.stdout:
            line_str = line.strip()
            if line_str:
                print(line_str)
        process.wait()
        if process.returncode == 0:
            print(f"[SUCCESS] Download completed for: {url}")
            return True
        else:
            console_err(f"Download process failed with exit code {process.returncode}")
            return False
    except Exception as e:
        console_err(f"Download failed: {e}")
        return False

def download_bulk(file_path_or_urls, output_dir="downloads", format_type="video", quality="best", max_workers=3):
    urls = []
    if isinstance(file_path_or_urls, str) and os.path.isfile(file_path_or_urls):
        with open(file_path_or_urls, "r", encoding="utf-8") as f:
            urls = [line.strip() for line in f if line.strip() and not line.startswith("#")]
    elif isinstance(file_path_or_urls, list):
        urls = [u.strip() for u in file_path_or_urls if u.strip()]
    else:
        console_err("Invalid input for bulk download.")
        return

    print(f"[INFO] Starting bulk download of {len(urls)} URLs with {max_workers} parallel workers...")
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(download_single, u, output_dir, format_type, quality) for u in urls]
        for future in futures:
            future.result()

def interactive_cli():
    print(DISCLAIMER_TEXT)

    if not check_ytdlp():
        if not install_ytdlp():
            sys.exit(1)

    while True:
        print("\nSelect an option:")
        print("1. Download Single URL (YouTube, Instagram, Facebook, Pinterest, TikTok, etc.)")
        print("2. Download Pinterest Board (Bulk pins)")
        print("3. Bulk Download from Text File (List of URLs)")
        print("4. Exit")

        choice = input("\nEnter choice [1-4]: ").strip()
        if choice == "1":
            url = input("Enter URL: ").strip()
            if not url:
                continue
            fmt = input("Format (1: Video, 2: Audio) [default: 1]: ").strip()
            format_type = "audio" if fmt == "2" else "video"
            quality = "best"
            if format_type == "video":
                q = input("Quality (best, 1080p, 720p, 480p) [default: best]: ").strip()
                if q:
                    quality = q
            download_single(url, format_type=format_type, quality=quality)
        elif choice == "2":
            url = input("Enter Pinterest Board URL: ").strip()
            if not url:
                continue
            download_single(url, format_type="video", quality="best")
        elif choice == "3":
            file_path = input("Enter path to file containing URLs: ").strip()
            if not os.path.exists(file_path):
                console_err(f"File not found: {file_path}")
                continue
            download_bulk(file_path)
        elif choice == "4":
            print("[INFO] Exiting ALoad PC Downloader. Goodbye.")
            break
        else:
            print("[WARNING] Invalid option. Please select 1-4.")

def main():
    parser = argparse.ArgumentParser(
        description="ALoad PC Downloader — Developed by phoenix14 (Educational Purpose Only)"
    )
    parser.add_argument("url", nargs="?", help="URL to download (Single URL or Pinterest Board)")
    parser.add_argument("-b", "--bulk", help="Path to text file with URLs for bulk download")
    parser.add_argument("-o", "--output", default="downloads", help="Output directory path (default: downloads)")
    parser.add_argument("-f", "--format", choices=["video", "audio"], default="video", help="Output format type")
    parser.add_argument("-q", "--quality", choices=["best", "1080p", "720p", "480p", "360p"], default="best", help="Video quality")
    parser.add_argument("-w", "--workers", type=int, default=3, help="Max parallel downloads for bulk mode")

    args = parser.parse_args()

    if not check_ytdlp():
        if not install_ytdlp():
            sys.exit(1)

    if args.bulk:
        download_bulk(args.bulk, args.output, args.format, args.quality, args.workers)
    elif args.url:
        download_single(args.url, args.output, args.format, args.quality)
    else:
        interactive_cli()

if __name__ == "__main__":
    main()
