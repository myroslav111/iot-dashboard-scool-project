

---

# 🌱 Smart Plant Monitoring & Control (IoT Projekt)

## 📌 Projektbeschreibung

Dieses Projekt ist eine IoT-Webanwendung zur Überwachung und Steuerung von Pflanzenbedingungen.
Die Anwendung simuliert Sensoren und ermöglicht es, Umweltwerte wie Temperatur, Luftfeuchtigkeit und Lichtstärke zu überwachen sowie eine Bewässerung zu steuern.

Das System basiert auf einer Kombination aus Backend-Logik, Datenbank und Web-Frontend.

---

## 🧠 Architektur

```text
Frontend (Web App / GitHub Pages)
        ↓ (HTTP API)
Node-RED (Backend)
        ↓
MQTT (Sensor Simulation)
        ↓
InfluxDB (Zeitreihendatenbank)
        ↓
Grafana (Visualisierung)
```

---

## ⚙️ Technologien

* Node.js
* Node-RED
* MQTT (Mosquitto Broker)
* InfluxDB
* Grafana
* HTML / CSS / JavaScript (Frontend)
* Chart.js (optional für Diagramme)

---

## 🔧 Funktionen

### 📡 Sensordaten (Simulation)

* 🌡 Temperatur (DHT22)
* 💧 Luftfeuchtigkeit (DHT22)
* ☀️ Lichtstärke (BH1750)

### 🌱 Steuerung

* 💦 Bewässerung per Button
* Statusanzeige (aktiv / inaktiv)

### 📊 Datenverarbeitung

* Speicherung in InfluxDB
* Visualisierung über Grafana
* API für Frontend-Zugriff

---

## 🌐 API Endpoints (Node-RED)

### 🔹 GET `/api/sensor`

Liefert aktuelle Sensordaten:

```json
{
  "temperature": 24.5,
  "humidity": 58.2,
  "lux": 420,
  "status": false
}
```

---

### 🔹 POST `/api/water`

Startet Bewässerung:

```json
{
  "message": "Watering started"
}
```

---

### 🔹 GET `/api/history`

Liefert historische Daten aus der Datenbank

---

## 💻 Frontend (Web App)

Die Web-App zeigt:

* Live Sensordaten
* Status der Pflanze
* Button zur Bewässerung

Technologie:

* Vanilla JavaScript (kein Framework)
* Fetch API für Kommunikation mit Backend

---

## 🚀 Installation & Start

### 1. Node-RED starten

```bash
node-red
```

---

### 2. MQTT Broker starten

```bash
sudo systemctl start mosquitto
```

---

### 3. InfluxDB starten

```bash
sudo systemctl start influxdb
```

---

### 4. Grafana starten

```bash
sudo systemctl start grafana-server
```

---

### 5. Web-App öffnen

```text
index.html im Browser öffnen
```

---

## ⚠️ Wichtige Hinweise

* Die Web-App greift nicht direkt auf die Datenbank zu
* Kommunikation erfolgt ausschließlich über Node-RED API
* Für externen Zugriff kann ein Tunnel (z. B. ngrok) verwendet werden

---

## 🧪 Simulation

Die Sensorwerte werden simuliert und im Tasmota-Format über MQTT gesendet.

Beispiel:

```json
{
  "Time": "2026-05-05T12:00:00",
  "DHT22": {
    "Temperature": 24.5,
    "Humidity": 58.2
  },
  "BH1750": {
    "Illuminance": 420
  }
}
```

---

## 🎯 Ziel des Projekts

* Verständnis von IoT-Architektur
* Nutzung von MQTT und Node-RED
* Entwicklung einer Webanwendung
* Datenvisualisierung mit Grafana
* Simulation realer Hardware

---

## 📈 Erweiterungsmöglichkeiten

* Automatische Bewässerung (Regeln)
* Mobile App (PWA)
* Mehrere Sensorgeräte
* Push-Benachrichtigungen
* Echtzeit-Charts im Frontend

---

## 👤 Autor

Myroslav Kozar
Schulprojekt – IoT & Webentwicklung

---

## 📄 Lizenz

Dieses Projekt dient zu Lernzwecken.

---

 👍
