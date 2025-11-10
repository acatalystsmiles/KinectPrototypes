@echo off
echo 🔷 Azure Kinect Bridge - Build and Run
echo.

echo 📦 Restoring NuGet packages...
dotnet restore
if errorlevel 1 (
    echo ❌ Failed to restore packages
    pause
    exit /b 1
)

echo 🔧 Building application...
dotnet build --configuration Release --platform x64
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.

echo 🚀 Starting Azure Kinect Bridge...
echo 📋 Remember:
echo   - Press Q to quit
echo   - Press S for statistics
echo   - Make sure your Kinect is connected
echo.

dotnet run --configuration Release

echo.
echo 🛑 Application stopped
pause