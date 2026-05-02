# MC-PVPTiers-Queue-Sniper

> A lightweight Chrome extension that automatically clicks the **"Join Queue"** button and plays a beep sound on the mctiers/pvptiers Discord servers the instant a tester opens queue — before it fills up.

---

## Credits

Made by **yiz**
- Discord: `yizuui`

## Installation

1. Download this repo as a ZIP (**Code → Download ZIP**) and unzip it, or clone it:
   ```bash
   git clone https://github.com/YOURUSERNAME/pvptiers-queue-sniper.git
   ```
2. Open Chrome and go to `chrome://extensions`
3. Toggle **Developer Mode** on in the top right corner
4. Click **Load unpacked** and select the `MC-PVPTiers-Queue-Sniper-main` folder
5. Open Discord in Chrome at `discord.com` and navigate to the pvptiers queue channel
6. Hard refresh with **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
7. Open the console with **Cmd+Option+J** (Mac) or **Ctrl+Shift+J** (Windows) and confirm you see:

```
[AutoQueue] ✅ Discord AutoQueue extension loaded — watching for "Join Queue" buttons...
```

---

## Usage

1. Open Discord in Chrome and navigate to the **pvptiers queue channel**
2. **Click anywhere on the Discord page once** to unlock the beep sound
3. Keep the Discord window visible on your screen *(see tip below)*
4. That's it — when a tester opens queue, the extension clicks **Join Queue** instantly
5. You'll hear a beep and receive a desktop notification confirming the click

> **Tip:** You don't have to stop what you're doing. Open Discord in a **separate Chrome window** (Cmd+N on Mac, Ctrl+N on Windows) and keep doing whatever you want in your main window. You can freely switch between windows — the extension runs in the background and will still detect and click the button automatically. Just don't minimize the Discord window entirely.

---

## Limitations

- **Chrome only** — this is a Chrome extension and will not work in the Discord desktop app or other browsers without modification

- **Discord window must not be minimized** — Chrome throttles JavaScript on fully minimized windows. As long as the Discord window is open somewhere — even if you are actively using another window — the extension runs at full speed. Simply switching focus to another window or app is completely fine

- **Must be on the queue channel** — Discord only loads messages for the channel you're currently viewing. The extension can't detect a button in a channel that isn't open. Open the queue channel in its own window and leave it there

- **Audio requires a click first** — browsers block audio until the user interacts with the page. Click anywhere on Discord once after loading to unlock the beep sound

- **Discord UI updates may break detection** — the extension finds buttons using standard HTML selectors. If Discord significantly changes how it renders message components, the selectors in `content.js` may need updating

- **Not guaranteed on slow connections** — if Discord is slow to render the button on your end, a faster connection could beat you to it

- **8 second cooldown** — after a successful click, the extension ignores the button for 8 seconds to prevent spam clicking. This is adjustable in `content.js`

---

## Configuration

Open `content.js` and edit the `CONFIG` block at the top:

```javascript
const CONFIG = {
  buttonText: 'join queue',   // Text to match (case-insensitive)
  cooldownMs: 8000,           // Cooldown after clicking (ms)
  fallbackPollMs: 400,        // How often the backup poll runs (ms)
};
```

---

## Debugging

Open the console (**Cmd+Option+J** on Mac) and filter by `[AutoQueue]` to see live logs.

To simulate a queue opening without waiting for a tester, paste this in the console:

```javascript
const fakeBtn = document.createElement('button');
fakeBtn.textContent = 'Join Queue';
document.body.appendChild(fakeBtn);
```

You should immediately see the extension detect and click it.

---

## Disclaimer

This tool is intended for personal use on the pvptiers Discord server. Use responsibly and in accordance with Discord's Terms of Service.

---
