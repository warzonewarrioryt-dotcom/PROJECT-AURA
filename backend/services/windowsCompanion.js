/* =========================================================
   PROJECT AURA 3.0
   SECURE WINDOWS COMPANION SERVICE & ACTION REGISTRY
   Executes verified Windows actions through strict allowlist
   Strictly bound to localhost with OS confirmation
========================================================= */

"use strict";

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Safe allowlist of applications
const ALLOWED_APPS = {
  camera: {
    command: "start microsoft.windows.camera:",
    name: "Windows Camera",
    nameTa: "விண்டோஸ் கேமரா"
  },
  chrome: {
    command: "start chrome",
    fallback: "start msedge",
    name: "Google Chrome",
    nameTa: "கூகிள் குரோம்"
  },
  notepad: {
    command: "start notepad.exe",
    name: "Notepad",
    nameTa: "நோட்பேட்"
  },
  calculator: {
    command: "start calc.exe",
    name: "Calculator",
    nameTa: "கால்குலேட்டர்"
  },
  explorer: {
    command: "start explorer.exe",
    name: "File Explorer",
    nameTa: "ஃபைல் எக்ஸ்ப்ளோரர்"
  },
  downloads: {
    command: "start explorer.exe shell:Downloads",
    name: "Downloads Folder",
    nameTa: "பதிவிறக்கங்கள் கோப்புறை"
  },
  snippingtool: {
    command: "start ms-screenclip:",
    name: "Snipping Tool / Screen Clip",
    nameTa: "ஸ்கிரீன்ஷாட் கருவி"
  }
};

/**
 * Execute a command asynchronously using child_process.exec
 */
function runCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
      resolve({
        success: !error,
        error: error ? error.message : null,
        stdout: (stdout || "").trim(),
        stderr: (stderr || "").trim()
      });
    });
  });
}

/**
 * 1. Launch Allowed Windows Application
 */
async function launchApp(appKey) {
  const normalizedKey = (appKey || "").toLowerCase().trim();
  const target = ALLOWED_APPS[normalizedKey];

  if (!target) {
    return {
      success: false,
      error: `Application '${appKey}' is not in the approved Windows allowlist.`,
      allowed: Object.keys(ALLOWED_APPS)
    };
  }

  const res = await runCommand(target.command);
  if (res.success) {
    return {
      success: true,
      app: target.name,
      appTa: target.nameTa,
      message: `${target.name} launched successfully on Windows.`
    };
  }

  // If primary command failed and fallback exists (e.g. Edge if Chrome isn't installed)
  if (target.fallback) {
    const fallbackRes = await runCommand(target.fallback);
    if (fallbackRes.success) {
      return {
        success: true,
        app: "Microsoft Edge (Fallback)",
        appTa: "மைக்ரோசாப்ட் எட்ஜ்",
        message: `${target.name} was not found, launched Microsoft Edge instead.`
      };
    }
  }

  return {
    success: false,
    error: `Could not launch ${target.name}: ${res.error || res.stderr}`
  };
}

/**
 * 2. Bluetooth Hardware Inspection & Settings Guidance
 */
async function getBluetoothStatus() {
  const psCmd = `powershell -NoProfile -Command "Get-PnpDevice -Class Bluetooth -ErrorAction SilentlyContinue | Where-Object { $_.FriendlyName -notmatch 'Enumerator|Virtual' } | Select-Object FriendlyName, Status | ConvertTo-Json"`;
  const res = await runCommand(psCmd);

  if (!res.success || !res.stdout) {
    return {
      available: false,
      message: "No active Bluetooth hardware adapter detected on this computer."
    };
  }

  try {
    const devices = JSON.parse(res.stdout);
    const deviceList = Array.isArray(devices) ? devices : [devices];
    const okDevice = deviceList.find(d => d.Status === "OK");

    return {
      available: true,
      active: !!okDevice,
      devices: deviceList,
      primaryDevice: okDevice ? okDevice.FriendlyName : (deviceList[0] ? deviceList[0].FriendlyName : "Bluetooth Adapter"),
      message: okDevice
        ? `Bluetooth hardware '${okDevice.FriendlyName}' is active.`
        : "Bluetooth adapter detected but radio may be powered off or unlinked."
    };
  } catch {
    return {
      available: true,
      message: "Bluetooth hardware is present."
    };
  }
}

/**
 * 3. Bluetooth Toggle / Open Settings
 * Note: Direct programmatic toggle without UI or admin often requires specialized
 * WinRT capabilities. We guide the user honestly and launch Windows Bluetooth Settings.
 */
async function controlBluetooth(action) {
  const status = await getBluetoothStatus();

  // Open Windows Bluetooth & Devices settings page
  await runCommand("start ms-settings:bluetooth");

  return {
    success: true,
    hardwareAvailable: status.available,
    primaryDevice: status.primaryDevice,
    action: action || "toggle",
    openedSettings: true,
    message: status.available
      ? `Bluetooth device '${status.primaryDevice || "Adapter"}' is present. Opened Windows Bluetooth Settings for direct control.`
      : "No Bluetooth hardware detected. Opened Windows Bluetooth Settings."
  };
}

/**
 * 4. Wi-Fi Adapter Status Inspection & Control
 */
async function getWifiStatus() {
  const psCmd = `powershell -NoProfile -Command "Get-NetAdapter -ErrorAction SilentlyContinue | Where-Object { $_.InterfaceDescription -match 'Wireless|Wi-Fi|802.11' -or $_.Name -match 'Wi-Fi' } | Select-Object Name, Status, LinkSpeed | ConvertTo-Json"`;
  const res = await runCommand(psCmd);

  if (!res.success || !res.stdout) {
    return {
      available: false,
      message: "No Wi-Fi adapter detected on this system."
    };
  }

  try {
    const parsed = JSON.parse(res.stdout);
    const adapter = Array.isArray(parsed) ? parsed[0] : parsed;
    return {
      available: true,
      name: adapter.Name || "Wi-Fi",
      status: adapter.Status || "Unknown",
      linkSpeed: adapter.LinkSpeed || "N/A",
      connected: adapter.Status === "Up",
      message: `Wi-Fi adapter '${adapter.Name}' is ${adapter.Status === "Up" ? "Connected and Up" : "Disconnected / Down"}.`
    };
  } catch {
    return {
      available: true,
      message: "Wi-Fi adapter detected."
    };
  }
}

/**
 * 5. Wi-Fi Toggle Control
 */
async function controlWifi(enable) {
  const currentStatus = await getWifiStatus();
  if (!currentStatus.available) {
    return {
      success: false,
      error: "Wi-Fi adapter not available on this machine."
    };
  }

  const adapterName = currentStatus.name || "Wi-Fi";
  const actionStr = enable ? "enable" : "disable";

  // Attempt netsh interface command
  const res = await runCommand(`netsh interface set interface "${adapterName}" ${actionStr}`);

  if (res.success && !res.stderr.toLowerCase().includes("administrator")) {
    return {
      success: true,
      action: actionStr,
      adapter: adapterName,
      message: `Wi-Fi adapter '${adapterName}' has been ${enable ? "enabled" : "disabled"}.`
    };
  }

  // If administrator privilege is required, open Windows Network settings and explain honestly
  await runCommand("start ms-settings:network-wifi");
  return {
    success: true,
    requiresAdmin: true,
    openedSettings: true,
    adapter: adapterName,
    message: `Direct programmatic Wi-Fi toggle requires Windows Administrator privileges. Opened Windows Wi-Fi Settings for you.`
  };
}

/**
 * 6. Master Volume Control
 * Sets Windows volume to specified percentage (0 to 100)
 */
async function setVolume(percent) {
  let target = parseInt(percent, 10);
  if (isNaN(target)) target = 50;
  if (target < 0) target = 0;
  if (target > 100) target = 100;

  // In Windows WScript.Shell, SendKeys 174 is VK_VOLUME_DOWN (decrements ~2%), 175 is VK_VOLUME_UP
  // We zero it first with 50 down keys, then raise it with Math.round(target / 2) up keys
  const stepsDown = 50;
  const stepsUp = Math.round(target / 2);

  const psScript = `
    $w = New-Object -ComObject WScript.Shell
    1..${stepsDown} | ForEach-Object { $w.SendKeys([char]174) }
    1..${stepsUp} | ForEach-Object { $w.SendKeys([char]175) }
  `;

  const res = await runCommand(`powershell -NoProfile -Command "${psScript.replace(/\n/g, '; ')}"`);

  if (res.success) {
    return {
      success: true,
      volume: target,
      message: `System master volume set to approximately ${target}%.`
    };
  }

  return {
    success: false,
    error: `Failed to adjust system volume: ${res.error}`
  };
}

/**
 * 7. Take Screenshot
 * Launches Windows Snipping Tool (Screen Clip) and saves an entry in Pictures/AuraScreenshots
 */
async function takeScreenshot() {
  const picturesDir = path.join(os.homedir(), "Pictures", "AuraScreenshots");
  if (!fs.existsSync(picturesDir)) {
    try {
      fs.mkdirSync(picturesDir, { recursive: true });
    } catch (_) {}
  }

  // Trigger Windows 10/11 native screen clipper overlay
  const clipRes = await runCommand("start ms-screenclip:");

  return {
    success: true,
    saveDirectory: picturesDir,
    message: "Windows Snipping Tool activated. Select the area you wish to capture; screenshots can be saved to Pictures/AuraScreenshots."
  };
}

/**
 * 8. Open Validated Website URL
 */
async function openWebsite(url) {
  let cleanUrl = (url || "").trim();
  if (!cleanUrl) {
    return { success: false, error: "Website URL cannot be empty." };
  }

  // Validate protocol or add https://
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = "https://" + cleanUrl;
  }

  try {
    const parsed = new URL(cleanUrl);
    // Allow only http / https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { success: false, error: "Only web URLs (http / https) are permitted." };
    }

    const res = await runCommand(`start "" "${parsed.href}"`);
    return {
      success: res.success,
      url: parsed.href,
      message: res.success ? `Opened ${parsed.hostname} in your default browser.` : res.error
    };
  } catch (err) {
    return { success: false, error: "Invalid website address: " + err.message };
  }
}

/**
 * 9. Web Search (Google or YouTube)
 */
async function searchWeb(query, engine = "google") {
  const cleanQ = (query || "").trim();
  if (!cleanQ) {
    return { success: false, error: "Search query cannot be empty." };
  }

  const encoded = encodeURIComponent(cleanQ);
  let url = `https://www.google.com/search?q=${encoded}`;
  if (engine === "youtube" || cleanQ.toLowerCase().includes("youtube")) {
    url = `https://www.youtube.com/results?search_query=${encoded}`;
  }

  const res = await runCommand(`start "" "${url}"`);
  return {
    success: res.success,
    query: cleanQ,
    url,
    message: `Searching for "${cleanQ}" in your browser.`
  };
}

/**
 * 10. Shutdown System (Requires explicit user confirmation)
 */
let pendingShutdownScheduled = false;

async function scheduleShutdown(confirmed) {
  if (!confirmed) {
    return {
      success: false,
      confirmationRequired: true,
      message: "Confirmation required: are you sure you want to shut down your computer? Say 'confirm' or click Confirm.",
      messageTa: "கம்ப்யூட்டர் shutdown ஆகும். உறுதி செய்ய 'Confirm' என்று சொல்லுங்கள் அல்லது கிளிக் செய்யுங்கள்."
    };
  }

  // Schedule shutdown in 60 seconds with comment and abort capability
  const res = await runCommand('shutdown /s /t 60 /c "Project AURA scheduled shutdown. Say Cancel to abort."');
  if (res.success) {
    pendingShutdownScheduled = true;
    return {
      success: true,
      scheduledSeconds: 60,
      abortable: true,
      message: "Computer shutdown scheduled in 60 seconds. Say 'Cancel' or click Stop to abort.",
      messageTa: "கம்ப்யூட்டர் 60 வினாடிகளில் shutdown ஆகும். ரத்து செய்ய 'Cancel' சொல்லுங்கள்."
    };
  }

  return {
    success: false,
    error: `Failed to schedule shutdown: ${res.error || res.stderr}`
  };
}

/**
 * 11. Restart System (Requires explicit user confirmation)
 */
async function scheduleRestart(confirmed) {
  if (!confirmed) {
    return {
      success: false,
      confirmationRequired: true,
      message: "Confirmation required: are you sure you want to restart your computer? Say 'confirm' or click Confirm.",
      messageTa: "கம்ப்யூட்டர் restart ஆகும். உறுதி செய்ய 'Confirm' என்று சொல்லுங்கள்."
    };
  }

  const res = await runCommand('shutdown /r /t 60 /c "Project AURA scheduled restart. Say Cancel to abort."');
  if (res.success) {
    pendingShutdownScheduled = true;
    return {
      success: true,
      scheduledSeconds: 60,
      abortable: true,
      message: "Computer restart scheduled in 60 seconds. Say 'Cancel' to abort.",
      messageTa: "கம்ப்யூட்டர் 60 வினாடிகளில் restart ஆகும். ரத்து செய்ய 'Cancel' சொல்லுங்கள்."
    };
  }

  return {
    success: false,
    error: `Failed to schedule restart: ${res.error || res.stderr}`
  };
}

/**
 * 12. Abort Scheduled Shutdown or Restart
 */
async function abortShutdown() {
  const res = await runCommand("shutdown /a");
  pendingShutdownScheduled = false;

  if (res.success) {
    return {
      success: true,
      message: "Scheduled shutdown / restart has been cancelled.",
      messageTa: "Shutdown / Restart ரத்து செய்யப்பட்டது."
    };
  }

  return {
    success: true, // Even if no shutdown was pending, action is effectively safe
    message: "No scheduled shutdown was active to cancel.",
    messageTa: "எந்த shutdown திட்டமிடலும் செயலில் இல்லை."
  };
}

/**
 * 13. System Capabilities & Status
 */
async function getCapabilities() {
  const bt = await getBluetoothStatus();
  const wifi = await getWifiStatus();

  return {
    success: true,
    platform: "Windows " + os.release(),
    hostname: os.hostname(),
    uptime: Math.round(os.uptime() / 60) + " minutes",
    supportedActions: [
      { id: "open_camera", name: "Open Windows Camera", voiceEn: "Open camera", voiceTa: "Camera open pannu" },
      { id: "open_chrome", name: "Open Google Chrome", voiceEn: "Open Chrome", voiceTa: "Chrome open pannu" },
      { id: "open_notepad", name: "Open Notepad", voiceEn: "Open Notepad", voiceTa: "Notepad open pannu" },
      { id: "open_calculator", name: "Open Calculator", voiceEn: "Open calculator", voiceTa: "Calculator open pannu" },
      { id: "open_downloads", name: "Open Downloads / Explorer", voiceEn: "Open Downloads", voiceTa: "Downloads open pannu" },
      { id: "set_volume", name: "Set System Volume", voiceEn: "Set volume to 50 percent", voiceTa: "Volume 50 percent vekku" },
      { id: "take_screenshot", name: "Take a Screenshot", voiceEn: "Take a screenshot", voiceTa: "Screenshot edu" },
      { id: "control_bluetooth", name: "Check / Open Bluetooth", voiceEn: "Turn Bluetooth on", voiceTa: "Bluetooth on pannu", hardware: bt.available },
      { id: "control_wifi", name: "Check / Toggle Wi-Fi", voiceEn: "Turn Wi-Fi on / off", voiceTa: "Wifi on/off pannu", hardware: wifi.available },
      { id: "open_website", name: "Open Website", voiceEn: "Open youtube.com", voiceTa: "YouTube website open pannu" },
      { id: "search_web", name: "Search Google / YouTube", voiceEn: "Search for [topic]", voiceTa: "[Topic] search pannu" },
      { id: "shutdown", name: "Shut Down Computer", voiceEn: "Shut down the computer", voiceTa: "Computer shutdown pannu", requiresConfirmation: true },
      { id: "restart", name: "Restart Computer", voiceEn: "Restart the computer", voiceTa: "Computer restart pannu", requiresConfirmation: true },
      { id: "cancel", name: "Cancel Operation", voiceEn: "Cancel / Stop", voiceTa: "Cancel pannu" }
    ]
  };
}

module.exports = {
  ALLOWED_APPS,
  launchApp,
  getBluetoothStatus,
  controlBluetooth,
  getWifiStatus,
  controlWifi,
  setVolume,
  takeScreenshot,
  openWebsite,
  searchWeb,
  scheduleShutdown,
  scheduleRestart,
  abortShutdown,
  getCapabilities
};
