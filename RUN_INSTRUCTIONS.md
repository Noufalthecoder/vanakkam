# Lemon Maja - Running Instructions

Complete instructions to run and develop the **Lemon Maja** web application on Windows.

---

## ⚡ Quick Start (One Simple Command)

If you are using Windows **Command Prompt (`cmd`)**:

1. Open **Command Prompt** in the project folder:
   ```cmd
   cd "c:\Users\Mohammed Noufal V\Downloads\lemon maja"
   ```
2. Type and hit **Enter**:
   ```cmd
   run
   ```
   *(or `run.bat`)*

**What `run` does automatically:**
- Verifies that Node.js is installed.
- Automatically installs dependencies if `node_modules` is not yet installed.
- Starts the Next.js TurboPack development server.
- Opens your browser automatically to `http://localhost:3000`.

---

## 🛠 Manual Execution

If you prefer running commands manually:

### Prerequisites
- **Node.js** (v18.x or newer, v20+ recommended)
- **pnpm** (v10+ recommended) or **npm**

### Step 1: Install Dependencies (First time only)
```bash
pnpm install
```
*(If pnpm is not available, you can use `npm install`)*

### Step 2: Start the Development Server
```bash
pnpm dev
```
*(or `npm run dev`)*

The server will start at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🚀 Available Scripts

| Command | Description |
|---|---|
| `run` or `run.bat` | One-command launcher (checks dependencies, starts server, opens browser) |
| `pnpm dev` | Starts the Next.js development server with Turbopack |
| `pnpm build` | Compiles production bundle |
| `pnpm start` | Runs the compiled production build |

---

## 🛑 How to Stop the Server

In the command prompt or terminal running the server:
- Press `Ctrl + C`
- When prompted `Terminate batch job (Y/N)?`, type `Y` and press `Enter`.

---

## ❓ Troubleshooting

- **Port 3000 in use:** Next.js will automatically fall back to port 3001 (`http://localhost:3001`).
- **Command not found (pnpm):** You can install pnpm globally via `npm install -g pnpm`, or run with `npm run dev`.
- **Node.js missing:** Download and install Node.js from [https://nodejs.org/](https://nodejs.org/).
