# Chronicles Desktop App — Complete Standalone

This folder contains the full, working Chronicles journaling application for desktop.

## ⚠️ Important: Must be served via local web server

Due to browser security (CORS), you **cannot** simply double-click `index.html`. You must serve this folder via a local web server.

## Quick Start

**Step 1: Navigate to this folder in Terminal/Command Prompt**

**Step 2: Start the local web server**

**macOS/Linux:**
```bash
./start-server.sh
```

**Windows:**
```bash
start-server.bat
```

Or manually (any OS):
```bash
python -m http.server 8000
```

**Step 3: Open in your browser**
- The app automatically opens at **http://localhost:8000**
- Or visit manually: http://localhost:8000

That's it! The app is now running locally and works completely offline.

## What's Inside

| File | Purpose |
|------|---------|
| `index.html` | App entry point — loads React, styles, and app code |
| `app.jsx` | Main application (React components, state, logic) |
| `styles.css` | Design system tokens, colors, typography, spacing |
| `_ds_bundle.js` | Compiled design system (Button, Icon, Card, Avatar, etc.) |

## Features

✓ **Dashboard** — tasks, upcoming events, wellness checks  
✓ **Journal** — quick capture, entry history  
✓ **Calendar** — date-based view  
✓ **Topics** — custom topic management  
✓ **Goals** — goal tracking  
✓ **Shopping** — shopping list  
✓ **Dark/Light mode** — toggle in Settings  
✓ **Sidebar navigation** — quick access to all sections  

## Offline

Once loaded, the app works completely offline—no external dependencies or internet connection needed.

## Customization

- **Edit behavior:** Modify `app.jsx` (React component logic)
- **Edit design:** Modify `styles.css` (colors, fonts, spacing)
- **Access tokens:** Use CSS custom properties like `var(--color-accent)`, `var(--text-primary)`, etc.

## Technology

- **React 18** — UI framework
- **Babel Standalone** — JSX transpilation
- **Chronicles Design System** — UI components and tokens
- **Vanilla CSS** — styling (no bundler needed)

---

For design system documentation, see the main Chronicles Design System project.
