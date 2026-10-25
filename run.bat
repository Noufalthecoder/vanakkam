@echo off
rem ============================================================================
rem  LEMON MAJA - QUICK RUNNER & RUNNING INSTRUCTIONS
rem ============================================================================
rem  HOW TO USE:
rem    1. Open Command Prompt (cmd) or PowerShell in this folder.
rem    2. Simply type:
rem           run
rem       or in PowerShell:
rem           .\run
rem    3. The script will automatically:
rem       - Verify Node.js is installed
rem       - Install dependencies if missing (node_modules)
rem       - Start the Next.js development server at http://localhost:3000
rem       - Open your default browser to http://localhost:3000
rem
rem  HOW TO STOP:
rem    Press Ctrl + C in the terminal window.
rem ============================================================================

title Lemon Maja - Next.js Dev Server
cls

echo ============================================================================
echo                      LEMON MAJA APPLICATION RUNNER
echo ============================================================================
echo.

rem Step 1: Check Node.js installation
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not found in your system PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Node.js found:
node --version
echo.

rem Step 2: Check and install dependencies if node_modules is missing
if not exist "node_modules" (
    echo [2/3] First-time setup: Dependencies not found. Installing now...
    where pnpm >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        call pnpm install
    ) else (
        call npm install
    )
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Dependency installation failed.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully.
    echo.
) else (
    echo [2/3] Dependencies verified: node_modules present.
    echo.
)

rem Step 3: Launch dev server
echo [3/3] Starting development server...
echo.
echo ============================================================================
echo   Application URL : http://localhost:3000
echo   To Stop Server  : Press Ctrl + C
echo ============================================================================
echo.

rem Open browser in background after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

rem Run Next.js dev server with pnpm
where pnpm >nul 2>&1
if %ERRORLEVEL% equ 0 (
    call pnpm dev
) else (
    call npm run dev
)

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Server stopped with an error.
    pause
)
