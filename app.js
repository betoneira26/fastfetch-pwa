/* ==========================================================================
   Fastfetch Web PWA - Application Core Logic
   ========================================================================== */

(function () {
  'use strict';

  // --- State ---
  let currentTheme = 'theme-catppuccin';
  let currentLogoKey = 'auto';
  let deferredInstallPrompt = null;
  let startTime = performance.now();

  // --- ASCII Art Logos ---
  const LOGOS = {
    arch: [
      "      /\\      ",
      "     /  \\     ",
      "    /\\   \\    ",
      "   /      \\   ",
      "  /   ,,   \\  ",
      " /   |  |  -\  ",
      "/_-''    ''-_/"
    ].join('\n'),

    ubuntu: [
      "         _         ",
      "     ---(_)        ",
      " _/  ---  \\      ",
      "(_) |   |           ",
      "  \\  --- _/       ",
      "     ---(_)        "
    ].join('\n'),

    debian: [
      "  _____   ",
      " / ____\\  ",
      "| /    \\ |",
      "| |____/ / ",
      " \\_____/  "
    ].join('\n'),

    fedora: [
      "      ______   ",
      "     /  ____\\  ",
      "    /  / ___   ",
      "   /  / /   |  ",
      "  /  /_/ /_/   ",
      " /_______/     "
    ].join('\n'),

    nixos: [
      "  \\  \\ //  ",
      " ==\\__\\/   ",
      "   //   \\\\  ",
      "  //     \\\\ "
    ].join('\n'),

    alpine: [
      "   /\\ /\\       ",
      "  // \\/  \\      ",
      " //   \\   \\     ",
      "//     \\   \\    ",
      "//       \\   \\   "
    ].join('\n'),

    void: [
      "    _______   ",
      "   /   ____\\  ",
      "  /  /    / / ",
      " /  /____/ /  ",
      "/________/   "
    ].join('\n'),

    gentoo: [
      "   _-----_   ",
      "  / _---_ \\  ",
      " | /     \\ | ",
      " | \\     / | ",
      "  \\_---_/  /  ",
      "   `-----'   "
    ].join('\n'),

    apple: [
      "       .:'    ",
      "    __ :'__   ",
      " .'`  `-'  ``. ",
      ":          : ",
      ":          : ",
      " :.        :  ",
      "  `.__.-.__.'  "
    ].join('\n'),

    windows: [
      "  ######  ######  ",
      "  ######  ######  ",
      "  ######  ######  ",
      "                  ",
      "  ######  ######  ",
      "  ######  ######  ",
      "  ######  ######  "
    ].join('\n'),

    android: [
      "  -o          o-  ",
      "   \\________/   ",
      "   /  @  @  \\   ",
      "  |__________||  ",
      "  |  |    |  ||  ",
      "  |  |____|  ||  "
    ].join('\n'),

    chromeos: [
      "    .---.    ",
      "   /     \\   ",
      "  |  (O)  |  ",
      "   \\     /   ",
      "    '---'    "
    ].join('\n'),

    freebsd: [
      " /\\,-'''''-,/\\ ",
      " \\_)       (_/ ",
      " |           | ",
      " |           | ",
      "  ;         ;  ",
      "   '-_____-'   "
    ].join('\n'),

    tux: [
      "   .---.   ",
      "  / o o \\  ",
      "  \\___/  ",
      " /|   |\\ ",
      "//|   |\\\\",
      "/_|_|_|/ "
    ].join('\n'),

    fastfetch: [
      " _________  _________ ",
      "|   ___   ||   ___   |",
      "|  |___|  ||  |___|  |",
      "|   ___   ||   ___   |",
      "|  |   |__||  |   |__|",
      "|__|      |__|       "
    ].join('\n')
  };

  // --- System Information Detection ---
  async function detectSystemInfo() {
    const ua = navigator.userAgent;
    const platform = navigator.userAgentData?.platform || navigator.platform || 'Unknown';

    // OS Detection
    let os = 'Unknown OS';
    let defaultLogo = 'fastfetch';

    if (/Android/i.test(ua)) {
      os = 'Android';
      defaultLogo = 'android';
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      os = 'iOS / iPadOS';
      defaultLogo = 'apple';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      os = 'macOS ' + (ua.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || '');
      defaultLogo = 'apple';
    } else if (/Windows NT 10.0/i.test(ua)) {
      os = 'Windows 11 / 10';
      defaultLogo = 'windows';
    } else if (/CrOS/i.test(ua)) {
      os = 'ChromeOS';
      defaultLogo = 'chromeos';
    } else if (/Linux/i.test(ua)) {
      if (/Ubuntu/i.test(ua)) { os = 'Ubuntu Linux'; defaultLogo = 'ubuntu'; }
      else if (/Debian/i.test(ua)) { os = 'Debian Linux'; defaultLogo = 'debian'; }
      else if (/Fedora/i.test(ua)) { os = 'Fedora Linux'; defaultLogo = 'fedora'; }
      else if (/Arch/i.test(ua)) { os = 'Arch Linux'; defaultLogo = 'arch'; }
      else { os = 'GNU/Linux (' + platform + ')'; defaultLogo = 'tux'; }
    }

    // Browser Detection
    let browser = 'Browser Unknown';
    if (/Edg\//i.test(ua)) browser = 'Microsoft Edge ' + (ua.match(/Edg\/([0-9.]+)/)?.[1] || '');
    else if (/Chrome\//i.test(ua) && !/Chromium\//i.test(ua)) browser = 'Google Chrome ' + (ua.match(/Chrome\/([0-9.]+)/)?.[1] || '');
    else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox ' + (ua.match(/Firefox\/([0-9.]+)/)?.[1] || '');
    else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari ' + (ua.match(/Version\/([0-9.]+)/)?.[1] || '');

    // CPU & Concurrency
    const cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Unknown';

    // GPU via WebGL
    let gpu = 'Software / Unknown GPU';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpu;
        }
      }
    } catch (e) {
      gpu = 'WebGL Disabled';
    }

    // Helper: Format Bytes
    function formatBytes(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0) + ' ' + sizes[i];
    }

    // Memory (Navigator Device Memory + JS Heap via Performance API)
    let memory = 'Not exposed';
    let memoryRaw = {};
    const devMem = navigator.deviceMemory ? `~${navigator.deviceMemory} GiB RAM` : null;
    let heapInfo = null;

    if (performance && performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;
      const pct = Math.min(100, Math.max(1, Math.round((used / limit) * 100)));
      heapInfo = {
        used: formatBytes(used),
        limit: formatBytes(limit),
        pct
      };
    }

    if (devMem && heapInfo) {
      memory = `${devMem} <span class="meter-bar" title="Heap Usage: ${heapInfo.pct}%"><span class="meter-fill" style="width: ${heapInfo.pct}%;"></span></span> <span style="opacity: 0.8; font-size: 0.9em;">Heap: ${heapInfo.used} / ${heapInfo.limit} (${heapInfo.pct}%)</span>`;
      memoryRaw = { deviceRamGiB: navigator.deviceMemory, heapUsed: heapInfo.used, heapLimit: heapInfo.limit, heapPct: heapInfo.pct };
    } else if (devMem) {
      memory = devMem;
      memoryRaw = { deviceRamGiB: navigator.deviceMemory };
    } else if (heapInfo) {
      memory = `<span class="meter-bar" title="Heap: ${heapInfo.pct}%"><span class="meter-fill" style="width: ${heapInfo.pct}%;"></span></span> Heap: ${heapInfo.used} / ${heapInfo.limit} (${heapInfo.pct}%)`;
      memoryRaw = { heapUsed: heapInfo.used, heapLimit: heapInfo.limit, heapPct: heapInfo.pct };
    }

    // Display Resolution & Color Depth
    const resolution = `${window.screen.width}x${window.screen.height} @ ${window.devicePixelRatio}x (DPI: ${window.screen.colorDepth}-bit)`;

    // Battery API
    let batteryStatus = 'AC / Desktop';
    if (navigator.getBattery) {
      try {
        const b = await navigator.getBattery();
        const pct = Math.round(b.level * 100);
        batteryStatus = `${pct}% [${b.charging ? 'Charging ⚡' : 'Discharging'}]`;
      } catch (e) {}
    }

    // Network Connection
    let network = 'Online';
    if (navigator.connection) {
      const conn = navigator.connection;
      network = `${conn.effectiveType || ''} ${conn.type || ''} (rtt: ${conn.rtt || 0}ms, down: ${conn.downlink || 0}Mb/s)`.trim() || 'Online';
    }

    // Storage estimate (Quota, Usage, Percentage, and Persistence mode with fallback)
    let storage = 'Not available';
    let storageRaw = {};
    let storageDetected = false;

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        if (est && typeof est.quota === 'number' && est.quota > 0) {
          const usedFormatted = formatBytes(est.usage || 0);
          const quotaFormatted = formatBytes(est.quota || 0);
          const pct = (((est.usage || 0) / est.quota) * 100).toFixed(1);
          
          let persistedTag = '';
          if (navigator.storage.persisted) {
            try {
              const isPersisted = await navigator.storage.persisted();
              persistedTag = isPersisted ? ' [Persistent]' : ' [Best-effort]';
            } catch (e) {}
          }

          const barWidth = Math.min(100, Math.max(pct > 0 ? 2 : 0, pct));
          storage = `<span class="meter-bar" title="Storage: ${pct}%"><span class="meter-fill" style="width: ${barWidth}%;"></span></span> ${usedFormatted} / ${quotaFormatted} (${pct}%)${persistedTag}`;
          storageRaw = { used: usedFormatted, quota: quotaFormatted, usagePct: pct, persistence: persistedTag.trim() };
          storageDetected = true;
        }
      } catch (e) {}
    }

    // Fallback for non-secure contexts (LAN HTTP) or WebKit legacy storage
    if (!storageDetected) {
      try {
        // Measure localStorage consumption
        let lsUsedBytes = 0;
        if (window.localStorage) {
          for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
              lsUsedBytes += (localStorage[key].length + key.length) * 2;
            }
          }
        }
        const lsUsedFormatted = formatBytes(lsUsedBytes);
        const hasIdb = typeof indexedDB !== 'undefined' ? 'IndexedDB' : '';
        const hasLS = typeof localStorage !== 'undefined' ? 'LocalStorage' : '';
        const apis = [hasLS, hasIdb].filter(Boolean).join(' + ');

        if (!window.isSecureContext) {
          storage = `<span style="color: var(--warning);">${apis || 'Web Storage'}</span> <span style="opacity: 0.8; font-size: 0.9em;">(${lsUsedFormatted} used &bull; HTTP Context / Needs HTTPS for Quota API)</span>`;
        } else {
          storage = `${apis || 'Web Storage'} (${lsUsedFormatted} used)`;
        }
        storageRaw = { type: apis, used: lsUsedFormatted, secureContext: window.isSecureContext };
      } catch (err) {
        storage = 'Restricted by browser privacy settings';
      }
    }

    // Locale & Timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const locale = navigator.language || 'en-US';

    // Uptime (Page / Tab session)
    const sessionUptimeSec = Math.floor(performance.now() / 1000);
    const uptime = `${Math.floor(sessionUptimeSec / 60)}m ${sessionUptimeSec % 60}s`;

    return {
      user: 'user',
      host: window.location.hostname || 'localhost',
      os,
      defaultLogo,
      browser,
      resolution,
      cpuCores,
      gpu,
      memory,
      storage,
      batteryStatus,
      network,
      locale: `${locale} (${timezone})`,
      uptime,
      protocol: window.location.protocol.replace(':', '').toUpperCase()
    };
  }

  // --- Render to UI ---
  async function renderFetch(selectedLogo) {
    const start = performance.now();
    const info = await detectSystemInfo();

    // Resolve Logo
    let logoKey = selectedLogo || currentLogoKey;
    if (logoKey === 'auto') {
      logoKey = info.defaultLogo;
    }
    const asciiText = LOGOS[logoKey] || LOGOS.fastfetch;
    document.getElementById('ascii-logo').textContent = asciiText;

    // Set Header
    document.getElementById('fetch-user').textContent = info.user;
    document.getElementById('fetch-host').textContent = info.host;
    document.getElementById('window-title').textContent = `${info.user}@${info.host}: ~`;
    document.getElementById('cli-prompt-label').textContent = `${info.user}@${info.host}:~$ `;

    // Build Rows
    const entries = [
      { key: 'OS', val: info.os },
      { key: 'Host', val: info.host },
      { key: 'Uptime', val: info.uptime },
      { key: 'Browser', val: info.browser },
      { key: 'Display', val: info.resolution },
      { key: 'CPU', val: info.cpuCores },
      { key: 'GPU', val: info.gpu },
      { key: 'Memory', val: info.memory },
      { key: 'Storage', val: info.storage },
      { key: 'Battery', val: info.batteryStatus },
      { key: 'Network', val: info.network },
      { key: 'Locale', val: info.locale },
      { key: 'Protocol', val: info.protocol }
    ];

    const entriesContainer = document.getElementById('fetch-entries');
    entriesContainer.innerHTML = '';

    entries.forEach(item => {
      const row = document.createElement('div');
      row.className = 'fetch-row';
      row.innerHTML = `<span class="fetch-key">${item.key}:</span><span class="fetch-val">${item.val}</span>`;
      entriesContainer.appendChild(row);
    });

    const duration = (performance.now() - start).toFixed(2);
    document.getElementById('render-time').textContent = duration;
  }

  // --- Clock ---
  function startClock() {
    const clockEl = document.getElementById('live-clock');
    function update() {
      const now = new Date();
      clockEl.textContent = now.toTimeString().split(' ')[0];
    }
    setInterval(update, 1000);
    update();
  }

  // --- Copy plain text output ---
  function copyOutput() {
    const logo = document.getElementById('ascii-logo').textContent;
    const user = document.getElementById('fetch-user').textContent;
    const host = document.getElementById('fetch-host').textContent;
    const rows = Array.from(document.querySelectorAll('.fetch-row'))
      .map(r => `${r.querySelector('.fetch-key').textContent} ${r.querySelector('.fetch-val').textContent}`)
      .join('\n');

    const text = `${user}@${host}\n-------------------\n${rows}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Specs copied to clipboard!');
    }).catch(() => {
      prompt('Copy manually:', text);
    });
  }

  // --- Export PNG ---
  function exportPNG() {
    const canvas = document.getElementById('export-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 540;

    // Background
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title bar
    ctx.fillStyle = '#25253a';
    ctx.fillRect(0, 0, canvas.width, 40);
    ctx.fillStyle = '#ff5f56'; ctx.beginPath(); ctx.arc(20, 20, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffbd2e'; ctx.beginPath(); ctx.arc(38, 20, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#27c93f'; ctx.beginPath(); ctx.arc(56, 20, 6, 0, Math.PI * 2); ctx.fill();

    // Text info
    ctx.font = '14px monospace';
    ctx.fillStyle = '#89b4fa';
    
    const logoLines = document.getElementById('ascii-logo').textContent.split('\n');
    logoLines.forEach((line, idx) => {
      ctx.fillText(line, 40, 80 + idx * 22);
    });

    const user = document.getElementById('fetch-user').textContent;
    const host = document.getElementById('fetch-host').textContent;
    ctx.fillStyle = '#cba6f7';
    ctx.fillText(`${user}@${host}`, 300, 80);
    ctx.fillStyle = '#6c7086';
    ctx.fillText('----------------------------------', 300, 100);

    const rows = Array.from(document.querySelectorAll('.fetch-row'));
    rows.forEach((r, idx) => {
      const k = r.querySelector('.fetch-key').textContent;
      const v = r.querySelector('.fetch-val').innerText || r.querySelector('.fetch-val').textContent;
      ctx.fillStyle = '#89b4fa';
      ctx.fillText(k, 300, 125 + idx * 24);
      ctx.fillStyle = '#cdd6f4';
      ctx.fillText(v.replace(/\s+/g, ' ').trim(), 420, 125 + idx * 24);
    });

    const link = document.createElement('a');
    link.download = `fastfetch-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // --- Interactive Terminal CLI ---
  function handleCLICommand(cmdStr) {
    const cmd = cmdStr.trim();
    if (!cmd) return;

    const history = document.getElementById('terminal-history');
    const entry = document.createElement('div');
    entry.className = 'history-entry';

    const parts = cmd.split(' ');
    const action = parts[0].toLowerCase();
    const arg = parts[1];

    let responseText = '';

    switch (action) {
      case 'help':
        responseText = 'Available commands:\n  fetch            - Refresh system info\n  theme <name>     - catppuccin, tokyonight, dracula, gruvbox, nord, monokai, matrix, cyberpunk\n  logo <name>      - arch, ubuntu, debian, fedora, nixos, alpine, void, gentoo, apple, windows, tux, fastfetch\n  crt              - Toggle CRT scanline effect\n  clear / cls      - Clear terminal history\n  json             - Dump system info as JSON';
        break;
      case 'clear':
      case 'cls':
        history.innerHTML = '';
        return;
      case 'fetch':
        renderFetch();
        responseText = 'System specs refreshed.';
        break;
      case 'theme':
        if (arg) {
          const valid = ['catppuccin', 'tokyonight', 'dracula', 'gruvbox', 'nord', 'monokai', 'matrix', 'cyberpunk'];
          if (valid.includes(arg.toLowerCase())) {
            document.body.className = `theme-${arg.toLowerCase()}`;
            document.getElementById('theme-select').value = `theme-${arg.toLowerCase()}`;
            responseText = `Theme changed to ${arg}.`;
          } else {
            responseText = `Unknown theme. Choose from: ${valid.join(', ')}`;
          }
        } else {
          responseText = 'Usage: theme <name>';
        }
        break;
      case 'logo':
        if (arg && (LOGOS[arg.toLowerCase()] || arg === 'auto')) {
          currentLogoKey = arg.toLowerCase();
          document.getElementById('logo-select').value = currentLogoKey;
          renderFetch(currentLogoKey);
          responseText = `Logo set to ${arg}.`;
        } else {
          responseText = `Unknown logo. Available: ${Object.keys(LOGOS).join(', ')}`;
        }
        break;
      case 'crt':
        document.getElementById('crt-overlay').classList.toggle('hidden');
        responseText = 'CRT scanline filter toggled.';
        break;
      case 'json':
        detectSystemInfo().then(info => {
          entry.innerHTML = `<div class="history-cmd">$ ${cmd}</div><pre class="history-output">${JSON.stringify(info, null, 2)}</pre>`;
          history.appendChild(entry);
        });
        return;
      default:
        responseText = `bash: command not found: ${cmd}. Type 'help' for available commands.`;
    }

    entry.innerHTML = `<div class="history-cmd">$ ${cmd}</div><div class="history-output">${responseText}</div>`;
    history.appendChild(entry);

    // Auto scroll
    const body = document.getElementById('terminal-scroll');
    body.scrollTop = body.scrollHeight;
  }

  // --- Event Listeners ---
  function init() {
    startClock();
    renderFetch();

    // Controls
    document.getElementById('theme-select').addEventListener('change', (e) => {
      document.body.className = e.target.value;
    });

    document.getElementById('logo-select').addEventListener('change', (e) => {
      currentLogoKey = e.target.value;
      renderFetch(currentLogoKey);
    });

    document.getElementById('btn-refresh').addEventListener('click', () => renderFetch());
    document.getElementById('btn-copy').addEventListener('click', copyOutput);
    document.getElementById('btn-export').addEventListener('click', exportPNG);
    document.getElementById('btn-crt').addEventListener('click', () => {
      document.getElementById('crt-overlay').classList.toggle('hidden');
    });

    // CLI Input
    const inputEl = document.getElementById('cli-input');
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleCLICommand(inputEl.value);
        inputEl.value = '';
      }
    });

    // Service Worker & PWA Install
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Fastfetch PWA: Service Worker Active'))
        .catch(err => console.error('SW failed:', err));
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const btnInstall = document.getElementById('btn-install');
      btnInstall.classList.remove('hidden');

      btnInstall.addEventListener('click', () => {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          deferredInstallPrompt.userChoice.then(() => {
            deferredInstallPrompt = null;
            btnInstall.classList.add('hidden');
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
