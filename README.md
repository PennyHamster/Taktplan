# Taktplan

**Ein schlankes und effizientes Aufgabenmanagement-Tool für kleine Teams.**

---

### Was ist Taktplan?

Taktplan ist eine webbasierte Anwendung, die entwickelt wurde, um die Zuweisung und Verfolgung von Aufgaben zwischen Führungskräften und Mitarbeitern zu vereinfachen. Das Ziel ist es, eine zentrale, übersichtliche Plattform zu schaffen, auf der alle aufgabenrelevanten Informationen gebündelt sind und der Fortschritt transparent nachverfolgt werden kann.

### ✨ Core Features (MVP)

* **Aufgaben-Board:** Verwalten Sie Aufgaben in einem intuitiven Kanban-Board mit den Spalten `In Bearbeitung`, `Erledigt` und `Später`.
* **Priorisierung:** Weisen Sie jeder Aufgabe eine von drei Prioritätsstufen zu (1: Sehr dringend, 2: Dringend, 3: Bei Leerlauf), um den Fokus zu lenken.
* **Zentrale Informationen:** Fügen Sie jeder Aufgabe Beschreibungen, Links und Dateianhänge (z.B. Screenshots) hinzu.
* **Bearbeitung & Historie:** Aufgaben können jederzeit aktualisiert werden. Die "Erledigt"-Spalte dient als nachvollziehbare Historie.
* **Sichere Authentifizierung:** Benutzer können sich sicher anmelden, um auf ihre Aufgaben zuzugreifen.

### 💻 Technologie-Stack (Vorschlag)

* **Backend:** Node.js mit Express.js / NestJS
* **Frontend:** React / Vue.js
* **Datenbank:** PostgreSQL
* **Containerisierung:** Docker & Docker Compose

### 🚀 Getting Started / Installation

Um das Projekt lokal zu starten, folgen Sie diesen Schritten.

**Voraussetzungen:**
* Node.js (v18 oder höher)
* Docker und Docker Compose

**1. Repository klonen:**
```bash
git clone [https://github.com/DEIN-BENUTZERNAME/Taktplan.git](https://github.com/DEIN-BENUTZERNAME/Taktplan.git)
cd Taktplan
```

**2. Backend aufsetzen:**
Navigieren Sie in den Backend-Ordner und erstellen Sie eine `.env`-Datei basierend auf der `.env.example`.
```bash
cd backend
cp .env.example .env
# Passen Sie die Werte in der .env an (z.B. Datenbank-Passwort)
```

**3. Frontend aufsetzen:**
Navigieren Sie in den Frontend-Ordner und erstellen Sie bei Bedarf ebenfalls eine `.env`-Datei für die API-URL.
```bash
cd ../frontend
# Ggf. eine .env-Datei für VITE_API_BASE_URL erstellen
```

**4. Anwendung mit Docker starten:**
Starten Sie das gesamte Projekt (Backend, Frontend, Datenbank) aus dem Hauptverzeichnis.
```bash
cd ..
docker-compose up --build
```

Die Anwendung sollte nun verfügbar sein:
* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:3001`

### 🔐 Sicherheitsaspekte

Dieses Projekt legt großen Wert auf Sicherheit. Die wichtigsten Grundsätze sind in den [PRD-Dokumenten](LINK-ZUM-PRD) festgehalten und umfassen unter anderem:
* Hashing von Passwörtern (bcrypt)
* Schutz vor SQL-Injection und XSS
* Gesicherte API-Endpunkte mittels JWT-Authentifizierung
* Strikte serverseitige Validierung aller Eingaben
* Sicherer Umgang mit Dateiuploads

### 🗺️ Roadmap (Zukünftige Features)

* **Phase 2:** Multi-User-Fähigkeit & Kommentare
* **Phase 3:** Dashboard mit Statistiken & Zeiterfassung
* **Phase 4:** Integrationen mit Kalender-Apps
