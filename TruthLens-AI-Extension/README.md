# TruthLens AI Chrome Extension

This folder contains a loadable Chrome extension built with Manifest V3.

## What it does

- Opens a premium in-page TruthLens AI sidebar when you click the extension icon.
- `Verify News` hides the sidebar, waits for highlighted page text, previews it, and sends it to `POST /verify`.
- `Detect Deepfake` opens a full-screen snipping overlay so the user can drag a region and then:
  - capture an image from the visible tab
  - capture a video of the selected region using screen recording
- Shows explainable AI style result cards for both workflows.
- Falls back to local demo heuristics if your backend is offline.

## Backend expected by the extension

Default API base: `https://truthlens-backendd.onrender.com`

Routes:

- `POST /verify`
- `POST /deepfake`

Both requests are sent as `FormData`.

## Load in Chrome

1. Open `chrome://extensions`
2. Turn on `Developer mode`
3. Click `Load unpacked`
4. Select this folder:

`C:\Users\megha\Documents\Codex\2026-04-18-i-want-to-create-truthlens-ai`

## Notes

- Some Chrome pages and extension pages do not allow content scripts.
- For `Capture Video`, Chrome may ask the user to choose which tab/window/screen to record.
- If your Express server uses a different port, open TruthLens settings and change the API base URL.
