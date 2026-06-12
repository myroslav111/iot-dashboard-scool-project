/* =========================
    CONFIG
========================= */

// Backend API (Node-RED)
//const API = "http://localhost:1880";
const API = "http://172.30.135.123:1880";

// Grenzwerte für Pflanzenzustand
const LIMITS = {
  temp: { min: 10, max: 30 },
  hum: { min: 30, max: 70 },
  lux: { min: 200 }
};


/* =========================
    DOM ELEMENTE
========================= */

const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");
const luxEl = document.getElementById("lux");

const statusEl = document.getElementById("status");
const waterBtn = document.getElementById("waterBtn");
const pumpBtn = document.getElementById("pumpBtn");

pumpBtn.addEventListener(
    "click",
    togglePump
);

const statsBtn = document.getElementById("statsBtn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");


/* =========================
    NOTIFICATIONS SYSTEM
========================= */

// Cooldown für Notifications (Spam-Schutz)
let lastNotification = 0;

/**
 * Sendet Browser Notification (max 1 pro Minute)
 */
function sendNotification(message) {
  const now = Date.now();

  // Spam Schutz: 60 Sekunden Pause
  if (now - lastNotification < 60000) return;

  if (Notification.permission === "granted") {
    new Notification("🌱 Pflanzen Alarm", {
      body: message
    });

    lastNotification = now;
  }
}

// Notification Permission beim Start anfragen
if ("Notification" in window) {
  Notification.requestPermission();
}


/* =========================
   LIVE SENSOR DATA
========================= */

/**
 * Holt aktuelle Sensordaten vom Backend
 * und aktualisiert das UI
 */
async function loadData() {
  try {
    const res = await fetch(API + "/api/sensor");
    const data = await res.json();

    // UI Update
    tempEl.innerText = data.temperature + " °C";
    humEl.innerText = data.humidity + " %";
    luxEl.innerText = data.lux + " lux";

    // Status Anzeige
    statusEl.innerText =
      data.status ? "💦 Bewässerung läuft..." : "✅ Normalbetrieb";

  } catch (e) {
    statusEl.innerText = "❌ Verbindung fehlgeschlagen";
  }
}


/* =========================
    WATER CONTROL
========================= */

/**
 * Sendet Bewässerungs-Trigger ans Backend
 */
async function water() {
  try {
    await fetch(API + "/api/water", { method: "POST" });
    statusEl.innerText = "💦 Bewässerung gestartet!";

  } catch (e) {
    statusEl.innerText = "❌ Fehler beim Gießen";
  }
}

async function togglePump() {
  try {
    const response = await fetch(
      API + "/api/togglePump",
      {
        method: "POST"
      }
    );

    const result = await response.json();

    if(result.success){
      statusEl.innerText = "💦 Pumpe umgeschaltet";
    }

  } catch(e) {
    statusEl.innerText = "❌ Fehler beim Schalten";
  }
}


async function togglePump() {
  try {
    const response = await fetch(API + "/api/togglePump", {
      method: "POST"
    });

    if (!response.ok) {
      throw new Error("HTTP Error");
    }

    const result = await response.json();

    statusEl.innerText =
      result.message || "💦 Pumpe umgeschaltet";

  } catch (e) {
    console.error(e);
    statusEl.innerText = "❌ Fehler beim Schalten";
  }
}

// Button Event
waterBtn.addEventListener("click", water);


/* =========================
    MODAL / STATISTICS
========================= */

let chartTemp, chartHum, chartLux;

/**
 * Öffnet Statistik Modal + lädt Daten
 */
statsBtn.addEventListener("click", async () => {
  modal.style.display = "block";
  await loadStats();
});

/**
 * Modal schließen (X)
 */
closeModal.onclick = () => modal.style.display = "none";

/**
 * Klick außerhalb Modal schließt es
 */
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};


/* =========================
    STATISTICS LOADER
========================= */

/**
 * Lädt Verlauf aus Backend und rendert 3 Charts
 */
async function loadStats() {
  const res = await fetch(API + "/api/history");
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) return;

  // X-Achse (Zeit)
  const labels = data.map(d =>
    new Date(d.time).toLocaleTimeString()
  );

  // Y-Daten
  const temp = data.map(d => d.temperature);
  const hum = data.map(d => d.humidity);
  const lux = data.map(d => d.lux);

  /* =========================
      WARNUNGEN CHECK
  ========================= */

  const latest = data[0];
  const warnings = checkStatus(latest);

  const warningsBox = document.getElementById("warningsBox");

  warningsBox.innerHTML = warnings.length
    ? `<p style="color:red;font-weight:bold">⚠️ ${warnings.join(", ")}</p>`
    : `<p style="color:lightgreen">✅ Alles im optimalen Bereich</p>`;

  /* =========================
      OLD CHART CLEANUP
  ========================= */

  if (chartTemp) chartTemp.destroy();
  if (chartHum) chartHum.destroy();
  if (chartLux) chartLux.destroy();

  /* =========================
      TEMPERATURE CHART
  ========================= */

  chartTemp = new Chart(document.getElementById("chartTemp"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temp",
        data: temp,
        borderColor: "orange",
        borderWidth: 2
      }]
    }
  });

  /* =========================
      HUMIDITY CHART
  ========================= */

  chartHum = new Chart(document.getElementById("chartHum"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Humidity",
        data: hum,
        borderColor: "blue"
      }]
    }
  });

  /* =========================
      LUX CHART
  ========================= */

  chartLux = new Chart(document.getElementById("chartLux"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Lux",
        data: lux,
        borderColor: "yellow"
      }]
    }
  });
}


/* =========================
    STATUS ANALYSIS
========================= */

/**
 * Prüft Sensorwerte gegen Grenzwerte
 * und erzeugt Warnungen
 */
function checkStatus(data) {
  if (!data) return [];

  let warnings = [];

  if (data.temperature == null) return warnings;

  if (data.temperature > LIMITS.temp.max)
    warnings.push("🔥 Zu heiß");

  if (data.temperature < LIMITS.temp.min)
    warnings.push("❄️ Zu kalt");

  if (data.humidity < LIMITS.hum.min)
    warnings.push("🌵 Zu trocken");

  if (data.humidity > LIMITS.hum.max)
    warnings.push("💧 Zu feucht");

  if (data.lux < LIMITS.lux.min)
    warnings.push("🌑 Zu wenig Licht");

  return warnings;
}


/* =========================
    AUTO REFRESH
========================= */

// Live Daten alle 2 Sekunden aktualisieren
setInterval(loadData, 2000);
loadData();