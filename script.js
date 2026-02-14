/* ============================================================
   SafeHer — Women Safety Evidence Portal
   JavaScript: Geolocation, Hospital Finder, Case Filing,
   Case Tracking, Privacy Features
   ============================================================ */

// ─── Sample Hospital Dataset ───────────────────────────────────
const HOSPITALS = [
  {
    id: 'city-general',
    name: 'City General Hospital — Forensic Unit',
    address: '42 Medical Drive, City Centre',
    lat: 13.0827,
    lng: 80.2707,
    phone: '+91 44 2530 0000',
    open24: true,
    forensicUnit: true,
  },
  {
    id: 'women-care',
    name: "Women's Care Medical Center",
    address: '15 Healthcare Avenue, Nungambakkam',
    lat: 13.0569,
    lng: 80.2425,
    phone: '+91 44 2825 0000',
    open24: true,
    forensicUnit: true,
  },
  {
    id: 'district-med',
    name: 'District Medical College Hospital',
    address: '108 College Road, Egmore',
    lat: 13.0732,
    lng: 80.2609,
    phone: '+91 44 2819 0000',
    open24: true,
    forensicUnit: true,
  },
  {
    id: 'govt-hospital',
    name: "Government Hospital — Women's Wing",
    address: '1 Government Rd, Triplicane',
    lat: 13.0590,
    lng: 80.2780,
    phone: '+91 44 2844 0000',
    open24: true,
    forensicUnit: true,
  },
  {
    id: 'mercy-hospital',
    name: 'Mercy Hospital — SAFE Center',
    address: '78 Mercy Lane, T. Nagar',
    lat: 13.0418,
    lng: 80.2341,
    phone: '+91 44 2434 0000',
    open24: false,
    forensicUnit: true,
  },
];

// ─── Global State ──────────────────────────────────────────────
let map = null;
let userMarker = null;
let hospitalMarkers = [];
let currentStep = 1;
let selectedHospital = null;
let generatedCaseId = null;

// ─── Initialization ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initDisclaimer();
  initNavbar();
  initQuickExit();
  initMap();
  initLocationDetection();
  initCaseForm();
  initCaseTracking();
  initScrollAnimations();
});

// ─── Disclaimer Modal ──────────────────────────────────────────
function initDisclaimer() {
  const modal = document.getElementById('disclaimerModal');
  const acceptBtn = document.getElementById('modalAccept');
  const closeBtn = document.getElementById('modalClose');

  // Show modal on first visit
  if (!sessionStorage.getItem('safeher_disclaimer_accepted')) {
    setTimeout(() => {
      modal.classList.add('active');
    }, 500);
  }

  acceptBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    sessionStorage.setItem('safeher_disclaimer_accepted', 'true');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    sessionStorage.setItem('safeher_disclaimer_accepted', 'true');
  });
}

// ─── Navbar ────────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile toggle
  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 200;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = navLinks.querySelector(`a[href="#${id}"]`);
      if (link) {
        if (scrollY >= top && scrollY < top + height) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  });
}

// ─── Quick Exit ────────────────────────────────────────────────
function initQuickExit() {
  const quickExitBtn = document.getElementById('quickExit');

  function quickExit() {
    // Clear session storage
    sessionStorage.clear();
    // Replace current history entry
    window.location.replace('https://www.google.com');
  }

  quickExitBtn.addEventListener('click', quickExit);

  // ESC key to exit
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      quickExit();
    }
  });
}

// ─── Map Initialization ────────────────────────────────────────
function initMap() {
  try {
    map = L.map('hospital-map', {
      center: [13.0627, 80.2507],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Add hospital markers
    HOSPITALS.forEach((hospital) => {
      const marker = L.marker([hospital.lat, hospital.lng])
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;">
          <strong style="font-size:14px;">${hospital.name}</strong><br/>
          <span style="color:#666;font-size:12px;">${hospital.address}</span><br/>
          <span style="color:#666;font-size:12px;">📞 ${hospital.phone}</span><br/>
          <span style="color:${hospital.open24 ? '#22c55e' : '#f59e0b'};font-size:12px;font-weight:600;">
            ${hospital.open24 ? '● Open 24/7' : '● Check Hours'}
          </span>
        </div>`
        );
      hospitalMarkers.push({ marker, hospital });
    });
  } catch (e) {
    console.log('Map initialization deferred — Leaflet may not be loaded yet.');
  }
}

// ─── Location Detection ────────────────────────────────────────
function initLocationDetection() {
  const btn = document.getElementById('detectLocationBtn');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const coordinates = document.getElementById('coordinates');

  btn.addEventListener('click', () => {
    btn.innerHTML = '<span class="spinner"></span> Detecting...';
    btn.disabled = true;

    if (!navigator.geolocation) {
      statusText.textContent = 'Geolocation not supported by your browser';
      btn.innerHTML = '📍 Detect My Location';
      btn.disabled = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        statusDot.classList.add('active');
        statusText.textContent = 'Location detected successfully';
        coordinates.textContent = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;

        btn.innerHTML = '✅ Location Detected';
        btn.disabled = false;

        // Center map on user
        if (map) {
          map.setView([latitude, longitude], 14);

          // Add user marker
          if (userMarker) map.removeLayer(userMarker);
          userMarker = L.circleMarker([latitude, longitude], {
            radius: 10,
            fillColor: '#2dd4bf',
            fillOpacity: 0.8,
            color: '#fff',
            weight: 2,
          })
            .addTo(map)
            .bindPopup('<strong>📍 Your Location</strong>')
            .openPopup();
        }

        // Find and display nearest hospitals
        displayNearestHospitals(latitude, longitude);
      },
      (error) => {
        statusText.textContent = 'Unable to detect location. Showing default hospitals.';
        btn.innerHTML = '📍 Retry Detection';
        btn.disabled = false;

        // Show all hospitals without distance
        displayNearestHospitals(null, null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// ─── Calculate Distance ────────────────────────────────────────
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─── Display Nearest Hospitals ─────────────────────────────────
function displayNearestHospitals(userLat, userLng) {
  const listEl = document.getElementById('hospitalList');
  let sorted = [...HOSPITALS];

  if (userLat !== null && userLng !== null) {
    sorted = sorted.map((h) => ({
      ...h,
      distance: getDistanceKm(userLat, userLng, h.lat, h.lng),
    }));
    sorted.sort((a, b) => a.distance - b.distance);
  }

  listEl.innerHTML = sorted
    .map(
      (h) => `
    <div class="hospital-card${selectedHospital === h.id ? ' selected' : ''}" data-id="${h.id}" onclick="selectHospital('${h.id}')">
      <div class="hospital-name">🏥 ${h.name}</div>
      <div class="hospital-address">${h.address}</div>
      <div class="hospital-meta">
        ${h.distance ? `<span class="hospital-distance">📍 ${h.distance.toFixed(1)} km away</span>` : ''}
        <span>${h.open24 ? '🟢 Open 24/7' : '🟡 Check Hours'}</span>
        <span>📞 ${h.phone}</span>
      </div>
    </div>
  `
    )
    .join('');
}

// ─── Select Hospital ───────────────────────────────────────────
function selectHospital(id) {
  selectedHospital = id;

  // Update visual selection
  document.querySelectorAll('.hospital-card').forEach((card) => {
    card.classList.toggle('selected', card.getAttribute('data-id') === id);
  });

  // Update form dropdown
  const select = document.getElementById('selectedHospital');
  if (select) {
    select.value = id;
  }

  // Pan map to hospital
  const hospital = HOSPITALS.find((h) => h.id === id);
  if (hospital && map) {
    map.setView([hospital.lat, hospital.lng], 15);
    const mData = hospitalMarkers.find((m) => m.hospital.id === id);
    if (mData) mData.marker.openPopup();
  }
}

// ─── Case Form ─────────────────────────────────────────────────
function initCaseForm() {
  const form = document.getElementById('caseForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitCase();
  });
}

function nextStep(current) {
  // Validate current step
  if (!validateStep(current)) return;

  if (current === 3) {
    // Build review summary before moving to step 4
    buildReviewSummary();
  }

  currentStep = current + 1;
  showStep(currentStep);
  updateProgress(currentStep);
}

function prevStep(current) {
  currentStep = current - 1;
  showStep(currentStep);
  updateProgress(currentStep);
}

function showStep(step) {
  document.querySelectorAll('.form-step').forEach((el) => el.classList.remove('active'));
  const el = document.getElementById(`step${step}`);
  if (el) el.classList.add('active');
}

function updateProgress(step) {
  const dots = document.querySelectorAll('.progress-dot');
  const lines = document.querySelectorAll('.progress-line');

  dots.forEach((dot) => {
    const s = parseInt(dot.dataset.step);
    dot.classList.remove('active', 'completed');
    if (s === step) dot.classList.add('active');
    else if (s < step) dot.classList.add('completed');
  });

  lines.forEach((line, i) => {
    line.classList.toggle('active', i < step - 1);
  });
}

function validateStep(step) {
  if (step === 1) {
    const date = document.getElementById('incidentDate').value;
    if (!date) {
      shakeElement(document.getElementById('incidentDate'));
      return false;
    }
  }
  if (step === 3) {
    const hospital = document.getElementById('selectedHospital').value;
    if (!hospital) {
      shakeElement(document.getElementById('selectedHospital'));
      return false;
    }
  }
  return true;
}

function shakeElement(el) {
  el.style.borderColor = '#dc2626';
  el.style.animation = 'shake 0.5s ease';
  el.addEventListener('animationend', () => {
    el.style.animation = '';
  }, { once: true });
  el.addEventListener('input', () => {
    el.style.borderColor = '';
  }, { once: true });
  el.addEventListener('change', () => {
    el.style.borderColor = '';
  }, { once: true });
}

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

function buildReviewSummary() {
  const date = document.getElementById('incidentDate').value;
  const time = document.getElementById('incidentTime').value || 'Not specified';
  const location = document.getElementById('incidentLocation').value || 'Not specified';
  const description = document.getElementById('description').value || 'Not provided';
  const hospital = document.getElementById('selectedHospital');
  const hospitalName = hospital.options[hospital.selectedIndex]?.text || 'Not selected';
  const policeStation = document.getElementById('policeStation');
  const policeName = policeStation.options[policeStation.selectedIndex]?.text || 'Auto-assigned';

  const reviewEl = document.getElementById('reviewSummary');
  reviewEl.innerHTML = `
    <div style="background:var(--bg-glass);border:1px solid var(--border-glass);border-radius:var(--radius-md);padding:24px;backdrop-filter:blur(10px);">
      <h4 style="font-family:var(--font-heading);font-weight:600;margin-bottom:16px;color:var(--accent-teal);">📋 Report Summary</h4>
      <div style="display:grid;gap:12px;">
        <div style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--border-subtle);">
          <span style="color:var(--text-muted);font-size:0.88rem;">Date of Incident</span>
          <span style="font-weight:500;font-size:0.88rem;">${date}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--border-subtle);">
          <span style="color:var(--text-muted);font-size:0.88rem;">Time</span>
          <span style="font-weight:500;font-size:0.88rem;">${time}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--border-subtle);">
          <span style="color:var(--text-muted);font-size:0.88rem;">Location</span>
          <span style="font-weight:500;font-size:0.88rem;">${location}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--border-subtle);">
          <span style="color:var(--text-muted);font-size:0.88rem;">Hospital</span>
          <span style="font-weight:500;font-size:0.88rem;">${hospitalName}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid var(--border-subtle);">
          <span style="color:var(--text-muted);font-size:0.88rem;">Police Station</span>
          <span style="font-weight:500;font-size:0.88rem;">${policeName}</span>
        </div>
        <div style="padding-top:4px;">
          <span style="color:var(--text-muted);font-size:0.88rem;">Description</span>
          <p style="font-size:0.88rem;margin-top:6px;color:var(--text-secondary);line-height:1.6;">${description}</p>
        </div>
      </div>
    </div>
  `;
}

function submitCase() {
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
  submitBtn.disabled = true;

  // Generate anonymous case ID
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  generatedCaseId = `WS-${year}-${random}`;

  // Simulate submission delay
  setTimeout(() => {
    document.getElementById('generatedCaseId').textContent = generatedCaseId;

    // Store case data in session for tracking demo
    const caseData = {
      id: generatedCaseId,
      date: document.getElementById('incidentDate').value,
      hospital:
        document.getElementById('selectedHospital').options[
          document.getElementById('selectedHospital').selectedIndex
        ]?.text,
      status: 'filed',
      created: new Date().toISOString(),
    };
    const cases = JSON.parse(sessionStorage.getItem('safeher_cases') || '[]');
    cases.push(caseData);
    sessionStorage.setItem('safeher_cases', JSON.stringify(cases));

    // Show success step
    currentStep = 5;
    showStep(5);

    // Update progress to all completed
    document.querySelectorAll('.progress-dot').forEach((d) => {
      d.classList.remove('active');
      d.classList.add('completed');
    });
    document.querySelectorAll('.progress-line').forEach((l) => l.classList.add('active'));

    submitBtn.innerHTML = '🛡️ Submit Anonymous Report';
    submitBtn.disabled = false;
  }, 2000);
}

function copyCaseId() {
  if (generatedCaseId) {
    navigator.clipboard
      .writeText(generatedCaseId)
      .then(() => {
        const btn = event.target.closest('.btn');
        const original = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        setTimeout(() => {
          btn.innerHTML = original;
        }, 2000);
      })
      .catch(() => {
        // Fallback
        prompt('Copy your Case ID:', generatedCaseId);
      });
  }
}

// ─── Case Tracking ─────────────────────────────────────────────
function initCaseTracking() {
  const trackBtn = document.getElementById('trackBtn');
  const trackInput = document.getElementById('trackInput');

  trackBtn.addEventListener('click', () => trackCase());
  trackInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') trackCase();
  });
}

function trackCase() {
  const input = document.getElementById('trackInput').value.trim();
  const resultEl = document.getElementById('trackResult');
  const timelineEl = document.getElementById('trackTimeline');

  if (!input) {
    shakeElement(document.getElementById('trackInput'));
    return;
  }

  // Check session storage for filed cases
  const cases = JSON.parse(sessionStorage.getItem('safeher_cases') || '[]');
  const found = cases.find((c) => c.id === input);

  resultEl.classList.add('active');

  if (found) {
    const createdDate = new Date(found.created);
    const formattedDate = createdDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    timelineEl.innerHTML = `
      <div class="timeline-item completed">
        <h4>📋 Case Filed</h4>
        <div class="timeline-date">${formattedDate}</div>
        <p>Anonymous report successfully filed. Case ID: <strong>${found.id}</strong></p>
      </div>
      <div class="timeline-item completed">
        <h4>🏥 Hospital Allocated</h4>
        <div class="timeline-date">${formattedDate}</div>
        <p>Assigned to: <strong>${found.hospital || 'Selected Hospital'}</strong>. Please visit at your earliest convenience for forensic examination.</p>
      </div>
      <div class="timeline-item current">
        <h4>🔬 Awaiting Evidence Collection</h4>
        <div class="timeline-date">Pending your visit</div>
        <p>Please visit the allocated hospital for your forensic examination. Evidence will be collected and documented by trained medical staff.</p>
      </div>
      <div class="timeline-item">
        <h4>📤 Report Sent to Police</h4>
        <div class="timeline-date">—</div>
        <p>The forensic report will be encrypted and sent to the assigned police station after evidence collection.</p>
      </div>
      <div class="timeline-item">
        <h4>🔍 Under Investigation</h4>
        <div class="timeline-date">—</div>
        <p>Police will begin investigating based on the forensic evidence. You can check back here for updates.</p>
      </div>
    `;
  } else {
    // Demo with a fake case for demonstration
    timelineEl.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <span style="font-size:3rem;display:block;margin-bottom:16px;">🔍</span>
        <h4 style="font-family:var(--font-heading);font-weight:600;margin-bottom:8px;">Case Not Found</h4>
        <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.7;">
          No case found with ID <strong style="color:var(--accent-teal);">${input}</strong>.<br/>
          Please check the ID and try again. If you just filed a case, your ID was shown on the confirmation screen.
        </p>
      </div>
    `;
  }
}

// ─── Scroll Animations ─────────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  // Apply to sections and cards
  const animatedEls = document.querySelectorAll(
    '.step-card, .emergency-card, .section-header, .form-container, .track-container, .privacy-banner'
  );
  animatedEls.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
}
