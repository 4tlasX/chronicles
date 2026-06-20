#!/bin/bash
# Chronicles Desktop App — Local Server Launcher (macOS/Linux)

echo "Starting Chronicles Desktop App..."
echo ""
echo "Opening http://localhost:8000 in your browser..."
echo "Press Ctrl+C to stop the server."
echo ""

# Try Python 3 first, fall back to Python 2
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
else
    python -m SimpleHTTPServer 8000
fi
