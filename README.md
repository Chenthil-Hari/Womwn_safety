# Women Safety Evidence Portal (SafeHer)

A confidential, privacy-first web portal designed to help sexual assault survivors preserve forensic evidence, find specialized hospitals, and file anonymous police reports without exposing their identity.

---

## Key Features

### 🛡️ Safety & Stealth Features
- **Quick Exit (`Esc`)**: Instantly closes the portal and redirects to Google without storing session history. Intelligently closes modals first if open.
- **Tab Title Masking**: Automatically masks the tab title to *"Google Search"* and changes the favicon whenever the user switches away or minimizes the tab.
- **Cover Your Tracks Guide**: Built-in modal providing step-by-step instructions on private browsing, selective history deletion, and preventing shared account sync.

### ⏳ Time-Critical Forensic Guidance
- **72-Hour Evidence Window Checklist**: Clear, compassionate guidelines on preserving physical and DNA evidence (paper bags over plastic, avoiding bathing/washing before medical examination, STI PEP and emergency contraception windows).
- **"What to Expect at the Hospital" Walkthrough**: Demystifies the Sexual Assault Forensic Exam (SAFE) protocol, chaperone rights, and explains free medical care mandates.

### 🏥 Hospital Finder & Mapping
- **Geolocation & Nationwide Directory**: Instant GPS detection + live text search for specialized forensic centers across major Indian metro cities (Chennai, Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata).
- **One-Tap Google Maps Navigation**: Direct link to turn-by-turn directions for each hospital.
- **Real-Time Search & Status**: Instant filtering by hospital name, city, or 24/7 forensic unit status.

### 📝 Anonymous Reporting & Tracking
- **Zero Personal Identifiers**: Form collects only incident details, approximate time/area, and hospital preferences — no names, phone numbers, or emails.
- **Unique Case ID**: Generates an anonymous tracking ID (e.g., `WS-2026-XXXX`).
- **Persistent Local Tracking**: Case status persists across sessions in local storage so survivors can safely check updates without being erased by Quick Exit.
- **XSS & Injection Protected**: Complete input sanitization on all dynamic preview and review steps.

### 🚨 Comprehensive Emergency Contacts
- **Women Helpline**: 181 (24/7 National Commission for Women)
- **Silent Help (WhatsApp)**: 7217-735-372 (Direct WhatsApp text emergency line for situations where voice calling is unsafe)
- **Police Emergency**: 112 / 100 (PAN-India Integrated Emergency)
- **One Stop Crisis Center (Sakhi)**: 7827-170-170 (Medical, legal, and counseling integration)

### 📱 Progressive Web App (PWA)
- **Offline Reliability**: Powered by a Service Worker (`sw.js`) and Web App Manifest (`manifest.json`) so emergency helplines and evidence preservation guidelines remain accessible even if cellular data drops.

---

## Technologies Used
- **HTML5 & Web Components**: Accessible, semantic structure with ARIA live regions and progress indicators.
- **CSS3 Design System**: Responsive dark glassmorphism theme, CSS variables, and WCAG AA-compliant contrast ratios.
- **Vanilla JavaScript (ES6+)**: Zero external JS dependencies (except Leaflet for maps); client-side sanitization and event delegation.
- **Leaflet.js & OpenStreetMap**: Interactive dark-themed map layer.
- **Service Worker & Manifest**: PWA offline caching.

---

## How to Run
Simply open `index.html` in any modern web browser or serve via any static web server (e.g. `npx serve`, Live Server, or Python `http.server`).
