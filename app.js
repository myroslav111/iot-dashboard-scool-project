/* =========================
    CONFIG
========================= */

// Backend API (Node-RED)
const API = "http://localhost:1880";
//const API = "http://172.30.120.166:1880";

// Grenzwerte für Pflanzenzustand
const LIMITS = {
  temp: { min: 10, max: 30 },
  hum: { min: 30, max: 70 },
  lux: { min: 200 },
  co2: {max: 1500}
};

// const LIMITS = {
//   temp: { min: 30, max: 40 },
//   hum: { min: 40, max: 70 },
//   lux: { min: 200 },
//   co2: {max: 1500}
// };


/* =========================
    DOM ELEMENTE
========================= */

const tempEl = document.getElementById("temp");
const humEl = document.getElementById("hum");
const luxEl = document.getElementById("lux");
const co2El = document.getElementById("co2");

const statusEl = document.getElementById("status");
const waterBtn = document.getElementById("waterBtn");

const tempCard = document.querySelector(".card:nth-child(1)");
const humCard  = document.querySelector(".card:nth-child(2)");
const luxCard  = document.querySelector(".card:nth-child(3)");
const co2Card  = document.querySelector(".card:nth-child(4)");

const chamomile = document.getElementById("chamomile");

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

// function setCardState(card, isGood) {
//   card.classList.remove("good", "bad");
//   card.classList.add(isGood ? "good" : "bad");
// }

function setCardState(card, level) {
  card.classList.remove("good", "warn", "bad");
  card.classList.add(level);
}

/**
 * Holt aktuelle Sensordaten vom Backend
 * und aktualisiert das UI
 */
async function loadData() {
  try {
    const res = await fetch(API + "/api/sensor");
    const data = await res.json();

    // Werte extrahieren (WICHTIG!)
    const temp = data.temperature;
    const hum  = data.humidity;
    const lux  = data.lux;
    const co2  = data.co2;

    // UI Update
    tempEl.innerText = temp + " °C";
    humEl.innerText = hum + " %";
    luxEl.innerText = lux + " lux";
    co2El.innerText = co2 + " ppm";

    // Temperatur
    setCardState(
      tempCard,
      temp >= LIMITS.temp.min && temp <= LIMITS.temp.max ? "good" : "bad"
    );

    // Feuchtigkeit
    setCardState(
      humCard,
      hum >= LIMITS.hum.min && hum <= LIMITS.hum.max ? "good" : "bad"
    );

    // Licht
    setCardState(
      luxCard,
      lux >= LIMITS.lux.min ? "good" : "bad"
    );

    // CO2
    setCardState(
      co2Card,
      co2 <= LIMITS.co2.max ? "good" : "bad"
    );

    // Status Anzeige
    statusEl.innerText =
      data.status === true
        ? "💦 Bewässerung aktiv..."
        : "🌱 Bereit / Normalbetrieb";


    const isGood =
    temp >= LIMITS.temp.min && temp <= LIMITS.temp.max &&
    hum >= LIMITS.hum.min && hum <= LIMITS.hum.max &&
    lux >= LIMITS.lux.min &&
    co2 <= LIMITS.co2.max;
  
  if (isGood) {
    chamomile.classList.remove("angry");
    chamomile.classList.add("happy");
  } else {
    chamomile.classList.remove("happy");
    chamomile.classList.add("angry");
  }

  } catch (e) {
    statusEl.innerText = "❌ Verbindung fehlgeschlagen";
  }
}
// async function loadData() {
//   try {
//     const res = await fetch(API + "/api/sensor");
//     const data = await res.json();

//     // UI Update
//     tempEl.innerText = data.temperature + " °C";
//     humEl.innerText = data.humidity + " %";
//     luxEl.innerText = data.lux + " lux";
//     co2El.innerText = data.co2 + " ppm"

//     // Temperatur
//     setCardState(
//       tempCard,
//       temp >= LIMITS.temp.min && temp <= LIMITS.temp.max
//     );

//     // Feuchtigkeit
//     setCardState(
//       humCard,
//       hum >= LIMITS.hum.min && hum <= LIMITS.hum.max
//     );

//     // Licht
//     setCardState(
//       luxCard,
//       lux >= LIMITS.lux.min
//     );

//     // CO2
//     setCardState(
//       co2Card,
//       co2 <= LIMITS.co2.max
//     );

//     // if (data.co2 < 800) {
//     //   co2El.style.color = "lightgreen";
//     // }
//     // else if (data.co2 < 1500) {
//     //   co2El.style.color = "orange";
//     // }
//     // else {
//     //   co2El.style.color = "red";
//     // }

//     // Status Anzeige
//     // statusEl.innerText =
//     //   data.status ? "💦 Bewässerung läuft..." : "✅ Normalbetrieb";

//     if (data.status === true) {
//       statusEl.innerText = "💦 Bewässerung aktiv...";
//     } else {
//       statusEl.innerText = "🌱 Bereit / Normalbetrieb";
//     }

//   } catch (e) {
//     statusEl.innerText = "❌ Verbindung fehlgeschlagen";
//   }
// }


/* =========================
    WATER CONTROL
========================= */

/**
 * Sendet Bewässerungs-Trigger ans Backend
 */
// async function water() {
//   try {
//     await fetch(API + "/api/water", { method: "POST" });
//     statusEl.innerText = "💦 Bewässerung gestartet!";

//   } catch (e) {
//     statusEl.innerText = "❌ Fehler beim Gießen";
//   }
// }

// async function water() {
//   try {
//     statusEl.innerText = "💦 Bewässerung startet...";

//     const res = await fetch(API + "/api/water", {
//       method: "POST"
//     });

//     const result = await res.json();

//     statusEl.innerText =
//       result.message || "💦 Pumpe läuft (4s)";

//     // optional: UI Hinweis nach 4 Sekunden
//     setTimeout(() => {
//       statusEl.innerText = "✅ Bewässerung abgeschlossen";
//     }, 4500);

//   } catch (e) {
//     console.error(e);
//     statusEl.innerText = "❌ Fehler beim Gießen";
//   }
// }

let wateringLock = false;

async function water() {
  if (wateringLock) return;

  wateringLock = true;
  statusEl.innerText = "💦 Bewässerung startet...";

  try {
    const res = await fetch(API + "/api/water", { method: "POST" });
    const result = await res.json();

    //statusEl.innerText = result.message || "💦 läuft...";

    statusEl.innerText = "💦 läuft...";

    setTimeout(() => {
      statusEl.innerText = "✅ abgeschlossen";
      wateringLock = false;
    }, 5000);

  } catch (e) {
    console.error(e);
    
    statusEl.innerText = "❌ Fehler beim Gießen";
    wateringLock = false;
  }
}


// async function togglePump() {
//   try {
//     const response = await fetch(API + "/api/togglePump", {
//       method: "POST"
//     });

//     if (!response.ok) {
//       throw new Error("HTTP Error");
//     }

//     const result = await response.json();

//     statusEl.innerText =
//       result.message || "💦 Pumpe umgeschaltet";

//   } catch (e) {
//     console.error(e);
//     statusEl.innerText = "❌ Fehler beim Schalten";
//   }
// }

// Button Event
waterBtn.addEventListener("click", water);


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

  if (data.co2 > LIMITS.co2.max) {
    warnings.push("🫁  CO₂ zu hoch")
  }

  return warnings;
}


/* =========================
    AUTO REFRESH
========================= */

// Live Daten alle 2 Sekunden aktualisieren
setInterval(loadData, 2000);
loadData();