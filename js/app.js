// ===== MEDIBOOK JS =====

// Theme toggle
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

// Toast notifications
function showToast(msg, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// Auth helpers (localStorage mock)
function getUser() {
  const u = localStorage.getItem('medibook_user');
  return u ? JSON.parse(u) : null;
}

function setUser(user) {
  localStorage.setItem('medibook_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('medibook_user');
  // Detect if we're inside the /patient/ subfolder and go to the right root
  const inPatient = window.location.pathname.includes('/patient/');
  window.location.href = inPatient ? '../index.html' : 'index.html';
}

// Require auth
function requireAuth() {
  const user = getUser();
  if (!user) {
    const inPatient = window.location.pathname.includes('/patient/');
    window.location.href = inPatient ? '../login.html' : 'login.html';
    return null;
  }
  return user;
}

// Update nav for logged in state
function updateNav() {
  const user = getUser();
  const navActions = document.getElementById('navActions');
  if (!navActions) return;
  const inPatient = window.location.pathname.includes('/patient/');
  const dashHref  = inPatient ? 'dashboard.html'   : 'patient/dashboard.html';
  const loginHref = inPatient ? '../login.html'     : 'login.html';
  const regHref   = inPatient ? '../register.html'  : 'register.html';
  if (user) {
    navActions.innerHTML = `
      <button id="themeToggle" class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">🌙</button>
      <div class="profile-dropdown-wrap">
        <button class="profile-btn" onclick="toggleProfileDropdown()">👤 ${user.firstName || user.email.split('@')[0]}</button>
        <div class="profile-dropdown" id="profileDropdown">
          <a href="${dashHref}">📊 Dashboard</a>
          <button onclick="logout()">🚪 Logout</button>
        </div>
      </div>
    `;
  } else {
    navActions.innerHTML = `
      <button id="themeToggle" class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">🌙</button>
      <a href="${loginHref}" class="btn-nav btn-nav-outline">Login</a>
      <a href="${regHref}" class="btn-nav btn-nav-solid">Register</a>
    `;
  }
  initTheme();
}

function toggleProfileDropdown() {
  const dd = document.getElementById('profileDropdown');
  if (dd) dd.classList.toggle('show');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.profile-dropdown-wrap')) {
    const dd = document.getElementById('profileDropdown');
    if (dd) dd.classList.remove('show');
  }
});

// Scroll animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-scroll').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Doctors data
const DOCTORS = [
  { id: 1, name: 'Dr. John Smith', specialty: 'Cardiology', exp: 15, desc: 'Experienced cardiologist specializing in heart conditions, hypertension, and cardiac procedures.' },
  { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Neurology', exp: 12, desc: 'Board-certified neurologist specializing in brain disorders, epilepsy, and neurological conditions.' },
  { id: 3, name: 'Dr. Michael Brown', specialty: 'Orthopedics', exp: 18, desc: 'Orthopedic surgeon with expertise in joint replacement, sports injuries, and bone disorders.' },
  { id: 4, name: 'Dr. Emily Davis', specialty: 'Dermatology', exp: 10, desc: 'Dermatologist specializing in skin conditions, cosmetic procedures, and skin cancer treatment.' },
  { id: 5, name: 'Dr. David Wilson', specialty: 'Pediatrics', exp: 14, desc: 'Pediatrician with 14 years of experience in child healthcare, vaccinations, and developmental issues.' },
  { id: 6, name: 'Dr. Lisa Anderson', specialty: 'Ophthalmology', exp: 16, desc: 'Ophthalmologist specializing in eye surgery, cataract treatment, and vision correction procedures.' }
];

// Appointments helpers
function getAppointments() {
  const a = localStorage.getItem('medibook_appointments');
  return a ? JSON.parse(a) : [];
}

function saveAppointment(appt) {
  const appts = getAppointments();
  appt.id = Date.now();
  appt.status = 'upcoming';
  appts.push(appt);
  localStorage.setItem('medibook_appointments', JSON.stringify(appts));
}

function cancelAppointment(id) {
  const appts = getAppointments().map(a => a.id == id ? { ...a, status: 'cancelled' } : a);
  localStorage.setItem('medibook_appointments', JSON.stringify(appts));
}

// Medications helpers
function getMedications() {
  const m = localStorage.getItem('medibook_medications');
  return m ? JSON.parse(m) : [];
}

function saveMedication(med) {
  const meds = getMedications();
  med.id = Date.now();
  med.status = 'pending';
  meds.push(med);
  localStorage.setItem('medibook_medications', JSON.stringify(meds));
}

function updateMedStatus(id, status) {
  const meds = getMedications().map(m => m.id == id ? { ...m, status } : m);
  localStorage.setItem('medibook_medications', JSON.stringify(meds));
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateNav();
  initScrollAnimations();
});

// ===== SCROLL PROGRESS =====
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = pct + '%';
  });
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.textContent = '↑';
  btn.title = 'Back to top';
  btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
}

// ===== MOBILE HAMBURGER =====
function initMobileNav() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  // Add hamburger
  const ham = document.createElement('button');
  ham.className = 'hamburger';
  ham.innerHTML = '☰';
  ham.setAttribute('aria-label', 'Menu');
  navbar.appendChild(ham);

  // Build mobile menu
  const navLinks = navbar.querySelector('.nav-links');
  const navActions = navbar.querySelector('#navActions');
  if (!navLinks) return;

  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.id = 'mobileMenu';

  const ul = document.createElement('ul');
  navLinks.querySelectorAll('a').forEach(a => {
    const li = document.createElement('li');
    const link = a.cloneNode(true);
    li.appendChild(link);
    ul.appendChild(li);
  });

  const actions = document.createElement('div');
  actions.className = 'mobile-actions';
  const user = getUser();
  const inPatient = window.location.pathname.includes('/patient/');
  const mLoginHref = inPatient ? '../login.html' : 'login.html';
  const mRegHref   = inPatient ? '../register.html' : 'register.html';
  const mDashHref  = inPatient ? 'dashboard.html' : 'patient/dashboard.html';
  if (user) {
    actions.innerHTML = `<a href="${mDashHref}" class="btn btn-outline" style="flex:1; justify-content:center;">📊 Dashboard</a><button onclick="logout()" class="btn btn-primary" style="flex:1; justify-content:center;">🚪 Logout</button>`;
  } else {
    actions.innerHTML = `<a href="${mLoginHref}" class="btn btn-outline" style="flex:1; justify-content:center;">Login</a><a href="${mRegHref}" class="btn btn-primary" style="flex:1; justify-content:center;">Register</a>`;
  }

  menu.appendChild(ul);
  menu.appendChild(actions);
  document.body.appendChild(menu);

  ham.onclick = () => {
    menu.classList.toggle('open');
    ham.innerHTML = menu.classList.contains('open') ? '✕' : '☰';
  };

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      ham.innerHTML = '☰';
    }
  });
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-item .num').forEach(el => {
    const text = el.textContent;
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!num) return;
    const suffix = text.replace(/[0-9.]/g, '');
    let start = 0;
    const duration = 1500;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (num < 100 ? Math.floor(eased * num) : Math.round(eased * num)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { requestAnimationFrame(step); observer.unobserve(e.target); } });
    }, { threshold: 0.5 });
    observer.observe(el);
  });
}

// ===== ACCORDION =====
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const isOpen = header.classList.contains('open');
      // Close all
      document.querySelectorAll('.accordion-header').forEach(h => {
        h.classList.remove('open');
        h.nextElementSibling?.classList.remove('open');
      });
      if (!isOpen) {
        header.classList.add('open');
        body.classList.add('open');
      }
    });
  });
}

// ===== ENHANCED INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateNav();
  initScrollAnimations();
  initScrollProgress();
  initBackToTop();
  initMobileNav();
  animateCounters();
  initAccordions();
});
