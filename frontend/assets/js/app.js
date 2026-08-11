/* ==========================================================
   KaJob — shared front-end behaviour (vanilla JS, no build step)
   ========================================================== */

function showToast(message){
  const toast = document.getElementById('toast');
  if(!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

function setFieldError(inputEl, message){
  const shell = inputEl.closest('.input-shell');
  const hint = inputEl.closest('.field').querySelector('.field-hint');
  if(message){
    shell.classList.add('error');
    hint.textContent = message;
  } else {
    shell.classList.remove('error');
    hint.textContent = '';
  }
}

function isValidEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function wirePasswordToggle(toggleBtn, inputEl){
  toggleBtn.addEventListener('click', () => {
    const isPassword = inputEl.type === 'password';
    inputEl.type = isPassword ? 'text' : 'password';
    toggleBtn.innerHTML = isPassword ? eyeOffIcon() : eyeIcon();
  });
}

function eyeIcon(){
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
}
function eyeOffIcon(){
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.6 18.6 0 0 1 4.22-5.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

/* ---------------- Login page ---------------- */
function initLoginPage(){
  const form = document.getElementById('login-form');
  if(!form) return;

  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  const toggleBtn = document.getElementById('login-eye');
  wirePasswordToggle(toggleBtn, passInput);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if(!isValidEmail(emailInput.value)){
      setFieldError(emailInput, 'Enter a valid email address');
      valid = false;
    } else {
      setFieldError(emailInput, '');
    }

    if(passInput.value.length < 6){
      setFieldError(passInput, 'Password must be at least 6 characters');
      valid = false;
    } else {
      setFieldError(passInput, '');
    }

    if(!valid) return;

    const name = emailInput.value.split('@')[0];
    localStorage.setItem('kajob_user', JSON.stringify({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: emailInput.value,
      role: localStorage.getItem('kajob_role') || 'worker'
    }));

    showToast('Welcome back — signing you in…');
    setTimeout(() => { window.location.href = 'home.html'; }, 700);
  });

  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => showToast('Social login is a demo in this build'));
  });
}

/* ---------------- Register page ---------------- */
function initRegisterPage(){
  const form = document.getElementById('register-form');
  if(!form) return;

  const nameInput = document.getElementById('reg-name');
  const emailInput = document.getElementById('reg-email');
  const passInput = document.getElementById('reg-password');
  const confirmInput = document.getElementById('reg-confirm');
  const confirmEye = document.getElementById('reg-confirm-eye');
  wirePasswordToggle(confirmEye, confirmInput);

  const roleButtons = document.querySelectorAll('.role-toggle button');
  let selectedRole = 'worker';
  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.dataset.role;
      document.getElementById('role-caption').textContent =
        selectedRole === 'worker'
          ? "You'll browse nearby jobs and get paid for piecework."
          : "You'll post jobs and hire trusted workers nearby.";
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if(nameInput.value.trim().length < 2){
      setFieldError(nameInput, 'Enter your full name');
      valid = false;
    } else setFieldError(nameInput, '');

    if(!isValidEmail(emailInput.value)){
      setFieldError(emailInput, 'Enter a valid email address');
      valid = false;
    } else setFieldError(emailInput, '');

    if(passInput.value.length < 6){
      setFieldError(passInput, 'Use at least 6 characters');
      valid = false;
    } else setFieldError(passInput, '');

    if(confirmInput.value !== passInput.value || !confirmInput.value){
      setFieldError(confirmInput, 'Passwords do not match');
      valid = false;
    } else setFieldError(confirmInput, '');

    if(!valid) return;

    localStorage.setItem('kajob_role', selectedRole);
    localStorage.setItem('kajob_user', JSON.stringify({
      name: nameInput.value.trim(),
      email: emailInput.value,
      role: selectedRole
    }));

    showToast('Account created — welcome to KaJob!');
    setTimeout(() => { window.location.href = 'home.html'; }, 700);
  });

  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => showToast('Social sign-up is a demo in this build'));
  });
}

/* ---------------- Home page ---------------- */
const JOBS = [
  { title: 'Yard clearing & grass cutting', loc: 'Chalala, 1.2 km away', pay: 'K180', time: 'Posted 4 min ago', badge: 'Same day', category: 'Gardening', icon: 'leaf' },
  { title: 'Load & offload furniture', loc: 'Kabulonga, 3.4 km away', pay: 'K350', time: 'Posted 10 min ago', badge: 'Urgent', category: 'Moving', icon: 'box' },
  { title: 'Kitchen tap is leaking', loc: 'Roma, 2.1 km away', pay: 'K220', time: 'Posted 22 min ago', badge: 'Verified poster', category: 'Plumbing', icon: 'wrench' },
  { title: 'Deep clean 3-bedroom house', loc: 'Woodlands, 4.6 km away', pay: 'K280', time: 'Posted 40 min ago', badge: 'Same day', category: 'Cleaning', icon: 'sparkle' },
  { title: 'Fix tripping circuit breaker', loc: 'Olympia, 1.8 km away', pay: 'K300', time: 'Posted 1 hr ago', badge: 'Urgent', category: 'Electrical', icon: 'bolt' },
  { title: 'Collect parcel & deliver', loc: 'Rhodes Park, 900 m away', pay: 'K90', time: 'Posted 2 hr ago', badge: 'Quick task', category: 'Errands', icon: 'run' },
];

function iconMarkup(name){
  const icons = {
    leaf: '<path d="M5 21c8 0 14-6 14-14V4h-3C8 4 5 10 5 18v3z"/><path d="M5 21c0-4 3-9 9-11"/>',
    box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 1 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4z"/>',
    sparkle: '<path d="M12 3l1.8 4.9L19 9l-5.2 1.9L12 16l-1.8-5.1L5 9l5.2-1.8z"/><path d="M19 15l.9 2.5L22 18l-2.1.7L19 21l-.9-2.3L16 18l2.1-.5z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
    run: '<circle cx="14" cy="4" r="2"/><path d="M6 20l3-6 3 2 2-5-5-3-3 4"/><path d="M13 12l3 2 3-1"/>'
  };
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.box}</svg>`;
}

function renderJobs(filter){
  const list = document.getElementById('job-list');
  if(!list) return;
  const items = filter && filter !== 'All'
    ? JOBS.filter(j => j.category === filter)
    : JOBS;

  list.innerHTML = items.map(job => `
    <div class="job-ticket">
      <div class="stub">${iconMarkup(job.icon)}</div>
      <div class="perforation"></div>
      <div class="details">
        <div class="row-top">
          <div>
            <h4>${job.title}</h4>
            <div class="loc">${job.loc}</div>
          </div>
          <div class="pay">${job.pay}</div>
        </div>
        <div class="meta-row">
          <span class="posted">${job.time}</span>
          <span class="badge">${job.badge}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function initHomePage(){
  const greetName = document.getElementById('greet-name');
  if(!greetName) return;

  let user = null;
  try{ user = JSON.parse(localStorage.getItem('kajob_user')); }catch(e){ user = null; }
  const name = (user && user.name) ? user.name.split(' ')[0] : 'Chundung';
  greetName.textContent = name;

  const roleCaption = document.getElementById('home-subtitle');
  if(roleCaption){
    roleCaption.textContent = (user && user.role === 'poster')
      ? 'Post a job and get it done today'
      : 'Nearby piecework, ready to grab';
  }

  renderJobs('All');

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderJobs(chip.dataset.category);
    });
  });

  document.querySelectorAll('[data-toast]').forEach(el => {
    el.addEventListener('click', () => showToast(el.dataset.toast));
  });

  const logoutBtn = document.getElementById('logout-btn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('kajob_user');
      window.location.href = 'login.html';
    });
  }
}

function initMobileDrawer(){
  const openBtn = document.getElementById('nav-toggle');
  const drawer = document.getElementById('mobile-drawer');
  if(!openBtn || !drawer) return;
  const closeBtn = drawer.querySelector('.close-btn');
  openBtn.addEventListener('click', () => drawer.classList.add('open'));
  closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
  drawer.addEventListener('click', (e) => { if(e.target === drawer) drawer.classList.remove('open'); });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initRegisterPage();
  initHomePage();
  initMobileDrawer();
});
