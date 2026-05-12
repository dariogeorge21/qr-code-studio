# Export Page (Download Screen) — Plain-English Guide

This folder contains the **Export Page**, the screen where someone downloads the QR code they designed.

File it documents:
- `page.tsx` (the “Download your QR code” screen)

---

## 1) What this screen is for
When a user finishes designing a QR code (colors, logo, frame, text, etc.), they land here to:
- See a preview of their QR code
- Choose a **file format** (PNG / SVG / JPEG / WebP)
- Choose a **resolution** (1× to 4×)
- Optionally turn on **transparent background** (only for PNG/WebP)
- Click **Download QR Code**

After a successful download, the user is sent to the “Thank you” page.

---

## 2) What the user sees
On this page, the user sees:
- A **Back** button (goes back to the previous step)
- A title (“Your QR Code is Ready to Download”)
- A **QR preview**
- Buttons to select:
  - **Format** (PNG, SVG, JPEG, WebP)
  - **Resolution** (1×, 2×, 3×, 4×)
- A toggle for **Transparent Background** (only shown for PNG/WebP)
- A big **Download** button
- An error message if they try to download without entering content
- A small note when SVG is selected: “SVG exports QR code only (no text overlays or frame)”

---

## 3) Where the QR settings come from (important)
This page does not ask the user to redesign anything.

Instead, it reads the current QR configuration from an in-app “settings store” called `useQRStore`.
That store holds things like:
- The content encoded in the QR code (URL/text/etc.)
- QR size, padding, error correction
- Colors and gradients
- Corner/eye styles
- Optional logo image and sizing
- Optional text overlays (title, caption, background text)
- Optional frame/border settings

Think of `useQRStore` as: “the QR designer’s current settings”.

---

## 4) What happens when the user clicks “Download QR Code”
### Step A — Safety check
If the QR content field is empty, the page shows:
- “Please enter content first”

Nothing is downloaded.

### Step B — Export generation (the file is built in the browser)
If content exists, the page generates the download file **on the user’s device** (in the browser), using the library `qr-code-styling`.

There are two export paths:

#### If the user selected SVG
- It generates an **SVG** directly.
- Limitation: **SVG export includes only the QR code itself**.
  - It does **not** include extra canvas composition like title, caption, background text, or decorative frame.

#### If the user selected PNG / JPEG / WebP
- It generates a QR image first.
- Then it creates a new “final” image by drawing layers on a canvas:
  - Optional background (unless “transparent background” is on)
  - Optional repeated or positioned background text
  - Optional title (top)
  - The QR image (center)
  - Optional caption (bottom)
  - Optional border/frame

### Step C — Download
The browser saves the file by creating a temporary download link and “clicking” it programmatically.
The filename is automatically generated from:
- The title (if any) + “qrcode” + a timestamp

Example idea:
- `my-title-qrcode-1715530123456.png`

### Step D — Lightweight analytics event (no QR content stored)
After starting the download, the page sends a small “downloaded” event to:
- `POST /api/qr-events`

This event is described in the code as:
- “Log detailed download event — fire and forget (no QR content stored)”

It includes:
- The QR type from the URL (the `[type]` part)
- The export format (png/svg/jpeg/webp)
- A set of yes/no flags like:
  - whether colors were changed from default
  - whether styles were changed
  - whether a frame was enabled
  - whether a logo was added
  - whether any text overlays were added

It **does not** send the actual QR content (the URL/text) in this “downloaded” event.

### Step E — Redirect
About 0.5 seconds later, the user is redirected to:
- `/thank-you`

---

## 5) Meaning of the key choices on the page
### Format
- **PNG**: high quality, supports transparency
- **WebP**: modern image format, supports transparency
- **JPEG**: smaller files sometimes, but **no transparency**
- **SVG**: scalable vector, but in this app it’s “QR only” (no overlays/frame)

### Resolution (1× to 4×)
This scales up the exported image for better quality at larger sizes.
Higher numbers = larger file, more pixels.

### Transparent Background
Only shown for PNG/WebP because JPEG does not support transparency.

---

## 6) Common questions / troubleshooting
- **“Why is the download button disabled?”**
  - Because there is no content to encode into the QR code, or export is currently in progress.

- **“Why doesn’t my title/caption/frame appear in SVG?”**
  - By design: SVG export is QR code only.

- **“Why does the page say ‘Export failed’?”**
  - The QR export library didn’t return data, the browser couldn’t create a blob, or there was an unexpected runtime error.

---

## 7) Quick glossary (non-technical)
- **Export**: creating a downloadable file
- **Format**: the type of file (PNG/JPEG/WebP/SVG)
- **Resolution**: how detailed the image is (more pixels)
- **Transparent background**: no solid color behind the QR code
- **Frame/Border**: a decorative outline around the final image
