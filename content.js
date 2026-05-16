(function () {
  const CONFIG = {
    buttonText: 'join queue',
    cooldownMs: 500,
    fallbackPollMs: 100,      // Reduced from 400ms to 100ms for faster fallback
    channelId: null,          // Set to your channel ID string to restrict to one channel, e.g. '123456789'
    tag: '[AutoQueue]',
  };

  let lastClickTime = 0;

  function log(...args) {
    console.log(CONFIG.tag, ...args);
  }

  // ── Channel filter ────────────────────────
  function isCorrectChannel() {
    if (!CONFIG.channelId) return true;
    return window.location.href.includes(CONFIG.channelId);
  }

  // ── Audio ─────────────────────────────────
  let audioCtx = null;

  function unlockAudio() {
    if (audioCtx) return;
    audioCtx = new AudioContext();
    audioCtx.resume();
    log('Audio unlocked');
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  }
  document.addEventListener('click', unlockAudio);
  document.addEventListener('keydown', unlockAudio);

  function playBeep() {
    if (!audioCtx) { log('Audio not unlocked yet — click anywhere on Discord first'); return; }
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
      log('Beep played');
    } catch (e) { log('Beep error:', e); }
  }

  // ── Notification ──────────────────────────
  function notify() {
    if (Notification.permission === 'granted') {
      new Notification('Queue Joined!', { body: 'Auto-clicked Join Queue on Discord.' });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') {
          new Notification('Queue Joined!', { body: 'Auto-clicked Join Queue on Discord.' });
        }
      });
    }
  }

  // ── Click logic ───────────────────────────
  function tryClick(btn) {
    const now = Date.now();
    if (now - lastClickTime < CONFIG.cooldownMs) {
      log('Cooldown active — skipping duplicate click');
      return;
    }
    const label = btn.textContent?.trim() ?? '';
    if (!label.toLowerCase().includes(CONFIG.buttonText)) return;
    if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') {
      log('Button is disabled — skipping');
      return;
    }
    lastClickTime = now;
    log('Clicking button: "' + label + '"');
    btn.click();
    playBeep();
    notify();
  }

  // ── Scan all buttons ──────────────────────
  function scan() {
    if (!isCorrectChannel()) return;
    const candidates = document.querySelectorAll(
      'button, div[role="button"], [class*="button"]'
    );
    for (const el of candidates) {
      if (el.textContent?.trim().toLowerCase().includes(CONFIG.buttonText)) {
        log('Scan found: "' + el.textContent.trim() + '"');
        tryClick(el);
        return;
      }
    }
  }

  // ── MutationObserver ──────────────────────
  function startObserver() {
    const root = document.getElementById('app-mount') ?? document.body;
    const observer = new MutationObserver((mutations) => {
      if (!isCorrectChannel()) return;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue;
          // Check the node itself first for instant detection
          if (node.textContent?.trim().toLowerCase().includes(CONFIG.buttonText)) {
            const els = [node, ...node.querySelectorAll(
              'button, div[role="button"], [class*="button"]'
            )];
            for (const el of els) {
              if (el.textContent?.trim().toLowerCase().includes(CONFIG.buttonText)) {
                log('Observer caught: "' + el.textContent.trim() + '"');
                tryClick(el);
              }
            }
          }
        }
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    log('MutationObserver started on ' + (root.id || 'body'));
  }

  // ── SPA navigation watcher ────────────────
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      log('Navigation detected — observer still active');
    }
  }, 1500);

  // ── Boot ──────────────────────────────────
  function boot() {
    log('Discord AutoQueue extension loaded — watching for "Join Queue" buttons...');
    log('Click anywhere on Discord to unlock audio for the beep sound');
    startObserver();
    setInterval(scan, CONFIG.fallbackPollMs);
  }

  if (document.getElementById('app-mount')) {
    boot();
  } else {
    const wait = new MutationObserver(() => {
      if (document.getElementById('app-mount')) {
        wait.disconnect();
        boot();
      }
    });
    wait.observe(document.body, { childList: true, subtree: true });
  }
})();
