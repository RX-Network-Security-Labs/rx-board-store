const SUPABASE_URL = 'https://aowerzbtjjvxlcxieaxl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvd2VyemJ0amp2eGxjeGllYXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0MzAzNTIsImV4cCI6MjEwNzAwNjM1Mn0.uai3x2ri31AJCYmsF-vyJVkQ0MkGZM0K07tVD4ZO5fw';
const GITHUB_RAW = 'https://raw.githubusercontent.com/RX-Network-Security-Labs/rx-board-store/main';
const EDGE_FUNCTION_URL = 'https://aowerzbtjjvxlcxieaxl.supabase.co/functions/v1/handle-submission';
const ADMIN_PIN_KEY = 'rxbs_admin_verified';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── AUTH ──────────────────────────────────────────────
async function getUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}
async function getDeveloper(userId) {
  const { data } = await sb.from('developers').select('*').eq('id', userId).single();
  return data;
}
async function isAdmin(userId) {
  const { data } = await sb.from('admins').select('id').eq('id', userId).single();
  return !!data;
}
async function signOut() {
  await sb.auth.signOut();
  window.location.href = '/rx-board-store/';
}

// ── ADMIN 2FA ─────────────────────────────────────────
function isAdminVerifiedOnDevice() {
  try {
    const val = localStorage.getItem(ADMIN_PIN_KEY);
    if (!val) return false;
    const { verified, expires } = JSON.parse(val);
    if (Date.now() > expires) { localStorage.removeItem(ADMIN_PIN_KEY); return false; }
    return verified === true;
  } catch { return false; }
}

function setAdminVerifiedOnDevice() {
  // Cookie valid for 30 days
  const expires = Date.now() + (30 * 24 * 60 * 60 * 1000);
  localStorage.setItem(ADMIN_PIN_KEY, JSON.stringify({ verified: true, expires }));
}

async function sendAdminVerificationCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  sessionStorage.setItem('rxbs_admin_code', code);
  sessionStorage.setItem('rxbs_admin_code_expires', (Date.now() + 5 * 60 * 1000).toString());
  try {
    const { data: { session } } = await sb.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error('Not logged in');
    await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ type: 'admin_verify', code })
    });
  } catch(e) { console.error('Failed to send code:', e); }
  return code;
}

function verifyAdminCode(inputCode) {
  const stored = sessionStorage.getItem('rxbs_admin_code');
  const expires = parseInt(sessionStorage.getItem('rxbs_admin_code_expires') || '0');
  if (Date.now() > expires) return false;
  return inputCode.trim() === stored;
}

// ── ITEM HELPERS ──────────────────────────────────────
function getTypeTag(type) {
  const map = {
    'plugin':        { class: 'tag-plugin', icon: 'extension', label: '.rxpp', folder: 'plugins' },
    'language-pack': { class: 'tag-lang',   icon: 'language',  label: '.rxlp', folder: 'language-packs' },
    'voice-model':   { class: 'tag-voice',  icon: 'mic',       label: '.lsttm',folder: 'voice-models' }
  };
  return map[type] || map['plugin'];
}

function getItemIconUrl(item) {
  const tag = getTypeTag(item.type);
  // Try PNG first, then JPG — we store icon_ext in DB
  if (item.icon_ext) {
    return `${GITHUB_RAW}/${tag.folder}/${item.id}/icon.${item.icon_ext}`;
  }
  return null;
}

function getItemReadmeUrl(item) {
  const tag = getTypeTag(item.type);
  return `${GITHUB_RAW}/${tag.folder}/${item.id}/README.md`;
}

function renderItemIcon(item, size = 48) {
  const iconUrl = getItemIconUrl(item);
  const tag = getTypeTag(item.type);
  if (iconUrl) {
    return `<div class="item-icon" style="width:${size}px;height:${size}px">
      <img src="${iconUrl}" alt="${item.name} icon" onerror="this.parentElement.innerHTML='<span class=\\'material-icons-round\\' style=\\'font-size:${Math.round(size*0.5)}px\\'>${tag.icon}</span>'"/>
    </div>`;
  }
  return `<div class="item-icon" style="width:${size}px;height:${size}px">
    <span class="material-icons-round" style="font-size:${Math.round(size*0.5)}px">${tag.icon}</span>
  </div>`;
}

function renderStars(rating, total) {
  const filled = Math.round(rating || 0);
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="material-icons-round star ${i <= filled ? 'filled' : ''}">star</span>`;
  }
  return `<div class="stars">${stars}</div>${total ? `<span style="font-size:12px;color:var(--text-muted);margin-left:4px">(${total})</span>` : ''}`;
}

function renderItemCard(item, rating) {
  const tag = getTypeTag(item.type);
  const avg = rating?.avg_rating || 0;
  const total = rating?.total_reviews || 0;
  const iconUrl = getItemIconUrl(item);
  return `
    <a href="/rx-board-store/item/?id=${item.id}" class="item-card">
      <div class="item-header">
        <div class="item-icon">
          ${iconUrl
            ? `<img src="${iconUrl}" alt="${item.name}" onerror="this.parentElement.innerHTML='<span class=\\'material-icons-round\\' style=\\'font-size:24px\\'>${tag.icon}</span>'">`
            : `<span class="material-icons-round" style="font-size:24px">${tag.icon}</span>`
          }
        </div>
        <span class="tag ${tag.class}">
          <span class="material-icons-round">${tag.icon}</span>${tag.label}
        </span>
      </div>
      <div>
        <h3>${item.name}</h3>
        <p>${item.description}</p>
      </div>
      <div class="item-meta">
        <div class="item-meta-left">
          <span class="item-version">v${item.version} · ${item.size}</span>
          <span class="item-dev">${item.developers?.display_name || 'Unknown'}</span>
        </div>
        ${avg > 0
          ? `<div class="item-rating"><span class="material-icons-round">star</span>${avg} <span style="color:var(--text-muted);font-weight:400">(${total})</span></div>`
          : `<span style="font-size:12px;color:var(--text-muted)">No reviews</span>`
        }
      </div>
    </a>`;
}

// ── FOOTER ────────────────────────────────────────────
function renderFooter() {
  return `<footer>
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-brand">RX<em>Board</em> Store<p>Official plugins, language packs & voice models for RX Board.</p></div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>Store</h4>
            <ul>
              <li><a href="/rx-board-store/"><span class="material-icons-round">home</span>Home</a></li>
              <li><a href="/rx-board-store/plugins/"><span class="material-icons-round">extension</span>Plugins</a></li>
              <li><a href="/rx-board-store/language-packs/"><span class="material-icons-round">language</span>Languages</a></li>
              <li><a href="/rx-board-store/voice-models/"><span class="material-icons-round">mic</span>Voice Models</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Developers</h4>
            <ul>
              <li><a href="/rx-board-store/submit/"><span class="material-icons-round">upload</span>Submit</a></li>
              <li><a href="/rx-board-store/auth/"><span class="material-icons-round">login</span>Sign In</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Community</h4>
            <ul>
              <li><a href="https://github.com/RX-Network-Security-Labs" target="_blank"><span class="material-icons-round">code</span>GitHub</a></li>
              <li><a href="https://discord.gg/gFtjWYQTzf" target="_blank"><span class="material-icons-round">forum</span>Discord</a></li>
              <li><a href="https://t.me/rxnetworksecuritylabs" target="_blank"><span class="material-icons-round">send</span>Telegram</a></li>
              <li><a href="https://rx-network-security-labs.github.io/website/donate.html" target="_blank"><span class="material-icons-round">favorite</span>Donate</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 RX Network Security Labs · RX Board Store</p>
        <div class="footer-socials">
          <a href="https://github.com/RX-Network-Security-Labs" target="_blank">GitHub</a>
          <a href="https://discord.gg/gFtjWYQTzf" target="_blank">Discord</a>
          <a href="https://t.me/rxnetworksecuritylabs" target="_blank">Telegram</a>
        </div>
      </div>
    </div>
  </footer>`;
}


function renderAdminSidebar(activePage, pendingCount = 0) {
  const badge = pendingCount > 0 ? `<span class="nav-badge">${pendingCount}</span>` : '';
  return `
    <div class="admin-sidebar">
      <div class="admin-header-bar">
        <span class="material-icons-round">admin_panel_settings</span>Admin Panel
      </div>
      <ul class="admin-nav">
        <li><a href="/rx-board-store/admin/" class="${activePage==='overview'?'active':''}"><span class="material-icons-round">dashboard</span>Overview</a></li>
        <li><a href="/rx-board-store/admin/submissions/" class="${activePage==='submissions'?'active':''}"><span class="material-icons-round">pending_actions</span>Submissions ${badge}</a></li>
        <li><a href="/rx-board-store/admin/items/" class="${activePage==='items'?'active':''}"><span class="material-icons-round">inventory_2</span>All Items</a></li>
        <li><a href="/rx-board-store/admin/developers/" class="${activePage==='developers'?'active':''}"><span class="material-icons-round">group</span>Developers</a></li>
        <li style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
          <a href="/rx-board-store/dashboard/"><span class="material-icons-round">person</span>My Profile</a>
        </li>
        <li><a href="#" onclick="signOut()"><span class="material-icons-round">logout</span>Sign Out</a></li>
      </ul>
    </div>`;
}

// ── NAV + DRAWER ──────────────────────────────────────
function openDrawer() {
  document.getElementById('drawer')?.classList.add('open');
  document.getElementById('drawer-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('drawer-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

async function initNav() {
  const path = window.location.pathname;

  // Mark active links (desktop + drawer)
  document.querySelectorAll('.nav-links a, .drawer-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === '/rx-board-store/' && (path === '/rx-board-store/' || path.endsWith('/rx-board-store') || path.endsWith('/rx-board-store/'))) {
      a.classList.add('active');
    } else if (href !== '/rx-board-store/' && href && path.includes(href.replace('/rx-board-store','').replace(/\/$/,''))) {
      a.classList.add('active');
    }
  });

  const user = await getUser();
  const navAuth = document.getElementById('nav-auth');
  const drawerFooter = document.getElementById('drawer-footer');
  const drawerAuthLinks = document.getElementById('drawer-auth-links');

  let authHtml = '';
  let drawerAuthHtml = '';

  if (user) {
    const [dev, admin] = await Promise.all([getDeveloper(user.id), isAdmin(user.id)]);
    authHtml = `
      ${admin ? `<a href="/rx-board-store/admin/" class="btn btn-sm btn-outline" style="gap:4px"><span class="material-icons-round" style="font-size:15px">admin_panel_settings</span>Admin</a>` : ''}
      <a href="/rx-board-store/dashboard/" class="nav-user">
        <span class="material-icons-round">account_circle</span>
        ${dev?.display_name || 'Dashboard'}
      </a>
      <button onclick="signOut()" class="btn btn-sm btn-outline" title="Sign Out">
        <span class="material-icons-round" style="font-size:15px">logout</span>
      </button>`;

    drawerAuthHtml = `
      ${admin ? `<a href="/rx-board-store/admin/" class="btn btn-outline"><span class="material-icons-round">admin_panel_settings</span>Admin Panel</a>` : ''}
      <a href="/rx-board-store/dashboard/" class="btn btn-outline"><span class="material-icons-round">account_circle</span>${dev?.display_name || 'Dashboard'}</a>
      <button onclick="signOut()" class="btn btn-outline"><span class="material-icons-round">logout</span>Sign Out</button>`;
  } else {
    authHtml = `
      <a href="/rx-board-store/auth/" class="btn btn-sm btn-outline">Sign In</a>
      <a href="/rx-board-store/submit/" class="btn btn-sm btn-primary">
        <span class="material-icons-round" style="font-size:15px">upload</span>Submit
      </a>`;

    drawerAuthHtml = `
      <a href="/rx-board-store/auth/" class="btn btn-outline"><span class="material-icons-round">login</span>Sign In</a>
      <a href="/rx-board-store/submit/" class="btn btn-primary"><span class="material-icons-round">upload</span>Submit</a>`;
  }

  if (navAuth) navAuth.innerHTML = authHtml;
  if (drawerFooter) drawerFooter.innerHTML = drawerAuthHtml;
}

function injectDrawer() {
  // Add hamburger button to existing nav if missing
  const navInner = document.querySelector('.nav-inner');
  if (navInner && !document.getElementById('nav-toggle')) {
    const btn = document.createElement('button');
    btn.id = 'nav-toggle';
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = '<span class="material-icons-round">menu</span>';
    btn.onclick = openDrawer;
    // Insert before nav-auth if exists, otherwise at the end
    const auth = document.getElementById('nav-auth');
    if (auth) navInner.insertBefore(btn, auth);
    else navInner.appendChild(btn);
  }

  // Upgrade <nav> to have site-header class for blur effect
  const nav = document.querySelector('nav');
  if (nav && !nav.classList.contains('site-header')) {
    nav.classList.add('site-header');
  }

  if (document.getElementById('drawer')) return;

  const overlay = document.createElement('div');
  overlay.id = 'drawer-overlay';
  overlay.className = 'drawer-overlay';
  overlay.onclick = closeDrawer;

  const drawer = document.createElement('div');
  drawer.id = 'drawer';
  drawer.className = 'drawer';
  drawer.innerHTML = `
    <div class="drawer-header">
      <a href="/rx-board-store/" class="nav-logo">RX<em>Board</em> Store</a>
      <button class="drawer-close" onclick="closeDrawer()" aria-label="Close menu">
        <span class="material-icons-round">close</span>
      </button>
    </div>
    <nav class="drawer-nav">
      <a href="/rx-board-store/"><span class="material-icons-round">home</span>Home</a>
      <a href="/rx-board-store/plugins/"><span class="material-icons-round">extension</span>Plugins</a>
      <a href="/rx-board-store/language-packs/"><span class="material-icons-round">language</span>Language Packs</a>
      <a href="/rx-board-store/voice-models/"><span class="material-icons-round">mic</span>Voice Models</a>
      <a href="/rx-board-store/about/"><span class="material-icons-round">info</span>About</a>
      <a href="/rx-board-store/submit/"><span class="material-icons-round">upload</span>Submit</a>
    </nav>
    <div class="drawer-footer" id="drawer-footer"></div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
}

// ── FILE HELPERS ──────────────────────────────────────
function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function readAsText(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsText(file);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectDrawer();
  initNav();
  const footerEl = document.getElementById('footer');
  if (footerEl) footerEl.innerHTML = renderFooter();
});
