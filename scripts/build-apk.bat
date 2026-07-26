@echo off
REM ALoad - Build Release APK (Windows)
REM Author: phoenix14

echo ╔══════════════════════════════════╗
echo ║   ALoad - APK Builder            ║
echo ║   by phoenix14                   ║
echo ╚══════════════════════════════════╝
echo.

REM Check if Android SDK is available
if not defined ANDROID_HOME (
    echo [ERROR] ANDROID_HOME not set. Please install Android Studio.
    echo Download: https://developer.android.com/studio
    exit /b 1
)

echo [1/4] Cleaning build...
cd android
call gradlew.bat clean
if errorlevel 1 goto :error

echo [2/4] Downloading yt-dlp binary...
cd ..
powershell -ExecutionPolicy Bypass -File scripts\download-ytdlp.ps1
if errorlevel 1 echo [WARN] yt-dlp download failed. Some features may not work.

echo [3/4] Building release APK...
cd android
call gradlew.bat assembleRelease
if errorlevel 1 goto :error

echo [4/4] Done!
echo.
echo ✅ APK location:
echo    android\app\build\outputs\apk\release\app-release.apk
echo.
echo Install on device with:
echo    adb install android\app\build\outputs\apk\release\app-release.apk
cd ..
goto :end

:error
echo.
echo ❌ Build failed. Check output above.
exit /b 1

:end
