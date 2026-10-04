// layout.js - shared header, navigation and UI helpers for every page.
// Mirrors templates/base.html + icons.html so the Jinja2 port is mechanical.
//
// Usage on every page:
//   <header id="site-header"></header>          (or keep <header class="header">, it is replaced)
//   <script type="module">
//     import { initLayout } from './layout.js';
//     initLayout();
//   </script>
//
// Pages that need the helpers import them by name:
//   import { initLayout, renderAvatar, esc, showFlash, requireAdmin, getIdParam } from './layout.js';

import { dbData } from './data.js';
import { t, getLang, setLang, fmtDate, fmtRelative, applyTranslations } from './i18n.js';
export { t, getLang, setLang, fmtDate, fmtRelative };
import { csrfToken, csrfFetch, ensureCsrfFields } from './csrf.js';
export { csrfToken, csrfFetch };
import { guardedSubmit, localizeValidation } from './forms.js';
export { guardedSubmit };

// ------------------------------------------------- prototype persistence --
// The prototype has no backend, so edits are kept in localStorage to survive page navigation.
// Flask: all of this is replaced by the database.
const USERS_KEY = 'portal.users', DEPT_KEY = 'portal.departments.v2';   // v2 = the complete list (edits and deletions persist too)
try {
  const saved = JSON.parse(localStorage.getItem(USERS_KEY) || 'null');
  if (Array.isArray(saved)) {
    dbData.usersDirectory = saved;
    const me = saved.find(u => u.id === dbData.currentUser.id);
    if (me) { dbData.currentUser.devices = me.devices; dbData.currentUser.is_admin = me.is_admin; }
  }
  const savedDepts = JSON.parse(localStorage.getItem(DEPT_KEY) || 'null');
  if (Array.isArray(savedDepts)) dbData.departments = savedDepts;
} catch { /* ignore */ }
// Prototype: every employee has a NAS account named after the local part of their email (same rule as app.py).
(dbData.usersDirectory || []).forEach(u => { if (!u.dsm_username && u.email) u.dsm_username = u.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 32); });
export const saveUsers = () => { try { localStorage.setItem(USERS_KEY, JSON.stringify(dbData.usersDirectory)); } catch { /* ignore */ } };

export const saveDepartments = () => { try { localStorage.setItem(DEPT_KEY, JSON.stringify(dbData.departments)); } catch { /* ignore */ } };

/** Admin action: creates a department. Flask: POST /admin/departments. */
export function addDepartment({ name, description = '', parent_id = null, manager_id = null }) {
  const d = { id: Math.max(0, ...dbData.departments.map(x => x.id)) + 1, name, description, parent_id, manager_id };
  dbData.departments.push(d); saveDepartments();
  return d;
}

/** Admin action: edits a department. Flask: POST /admin/departments/<id>. */
export function updateDepartment(id, fields) {
  const d = dbData.departments.find(x => x.id === id);
  if (d) { Object.assign(d, fields); saveDepartments(); reconcileAllManagers(); }
  return d;
}

/**
 * Rule: a department's manager must be a member of that department or one of its sub-departments.
 * Clears the manager role wherever `userId` no longer satisfies it (moved, deleted). Returns the names of
 * the departments they stopped managing. Flask: enforce in the department service + on employee edit/delete.
 */
export function reconcileManagerRoles(userId) {
  const u = (dbData.usersDirectory || []).find(x => x.id === userId), dept = u?.profile?.department_id, lost = [];
  dbData.departments.forEach(d => {
    if (d.manager_id !== userId) return;
    if (!u || !new Set([d.id, ...descendantIds(d.id)]).has(dept)) { d.manager_id = null; lost.push(d.name); }
  });
  if (lost.length) saveDepartments();
  return lost;
}
function reconcileAllManagers() { new Set(dbData.departments.map(d => d.manager_id).filter(Boolean)).forEach(reconcileManagerRoles); }

/** Ids of every department below `id` (so a department can't be moved under itself). */
export function descendantIds(id) {
  const out = new Set();
  const walk = p => dbData.departments.filter(d => d.parent_id === p).forEach(d => { if (!out.has(d.id)) { out.add(d.id); walk(d.id); } });
  walk(id);
  return out;
}

/** Employees (including disabled ones) and sub-departments that still depend on a department. */
export function departmentUsage(id) {
  return { members: (dbData.usersDirectory || []).filter(u => u.profile?.department_id === id).length,
           children: dbData.departments.filter(d => d.parent_id === id).length };
}

/** Admin action: deletes an empty department. Returns { ok, members, children }. Flask: POST /admin/departments/<id>/delete. */
export function deleteDepartment(id) {
  const use = departmentUsage(id);
  if (use.members || use.children) return { ok: false, ...use };
  dbData.departments = dbData.departments.filter(d => d.id !== id); saveDepartments();
  return { ok: true, ...use };
}

/** Reads an image file as a data URL so the prototype can keep it in localStorage. Flask: a real upload. */
export function readImageFile(file, maxKB = 300) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Only image files are allowed.'));
    if (file.size > maxKB * 1024) return reject(new Error(`Image too large (max ${maxKB} KB).`));
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Could not read the image.'));
    r.readAsDataURL(file);
  });
}

/** Fills a <select> with the departments (used by add/edit employee). */
export function fillDepartmentSelect(sel, selectedId = null) {
  sel.replaceChildren(new Option(t('Select a department'), ''));
  dbData.departments.forEach(d => sel.add(new Option(d.name, d.id)));
  if (selectedId != null) sel.value = String(selectedId);
}

/** Keeps Tab inside a modal. Call from the modal's keydown handler. */
export function trapFocus(container, e) {
  if (e.key !== 'Tab') return;
  const f = [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter(x => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

// --------------------------------------------------------- notifications --
// Read state is kept in localStorage so it survives page navigation in the prototype.
// Flask: replace with POST /notifications/read and a Notification.is_read column.
const READ_KEY = 'portal.readNotifications', NOTIF_EXTRA_KEY = 'portal.notifications.created';
try {
  JSON.parse(localStorage.getItem(NOTIF_EXTRA_KEY) || '[]').forEach(n => { if (!dbData.notifications.some(x => x.id === n.id)) dbData.notifications.push(n); });
  const ids = JSON.parse(localStorage.getItem(READ_KEY) || '[]');
  (dbData.notifications || []).forEach(n => { if (ids.includes(n.id)) n.is_read = true; });
} catch { /* storage unavailable: fall back to mock data */ }

/** The current user's notifications, newest first. */
export const myNotifications = () => (dbData.notifications || []).filter(n => n.user_id === dbData.currentUser.id).sort((a, b) => b.sent_at.localeCompare(a.sent_at));
export const getUnreadCount = () => myNotifications().filter(n => !n.is_read).length;

/** Creates a notification for each user id. Flask: insert Notification rows (and e-mail them if wanted). */
export function notifyUsers(userIds, { type, title, message, link = '#' }) {
  const made = userIds.map(uid => {
    const n = { id: Math.max(0, ...dbData.notifications.map(x => x.id)) + 1, user_id: uid, notification_type: type, title, message, link, is_read: false, sent_at: new Date().toISOString() };
    dbData.notifications.push(n);
    return n;
  });
  if (!made.length) return;
  try { const extra = JSON.parse(localStorage.getItem(NOTIF_EXTRA_KEY) || '[]'); localStorage.setItem(NOTIF_EXTRA_KEY, JSON.stringify(extra.concat(made))); } catch { /* ignore */ }
  updateNotificationBadge();
}
const otherAdminIds = userId => (dbData.usersDirectory || []).filter(u => u.is_admin && !u.disabled && u.id !== userId).map(u => u.id);

export function updateNotificationBadge() {
  const c = getUnreadCount();
  const badge = document.querySelector('.nav-bell .badge');
  if (badge) { badge.textContent = String(c); badge.hidden = !c; }
  const bell = document.querySelector('.nav-bell');
  if (bell) { bell.hidden = !c; bell.setAttribute('aria-label', `Notifications, ${c} unread`); }
}

/** Marks the given notification ids (or all, if omitted) as read and refreshes the header badge. */
export function markNotificationsRead(ids = null) {
  myNotifications().forEach(n => { if (!ids || ids.includes(n.id)) n.is_read = true; });
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(dbData.notifications.filter(n => n.is_read).map(n => n.id)));
  } catch { /* ignore */ }
  updateNotificationBadge();
}

// ---------------------------------------------------------- leave approvals --
// Decisions persist in localStorage so the badge stays right across pages in the prototype.
// Flask: pending count comes from a query; decideLeave() becomes POST /admin/leave/<id>/approve|deny.
const LEAVE_KEY = 'portal.leaveDecisions';
let leaveDecisions = {};
try { leaveDecisions = JSON.parse(localStorage.getItem(LEAVE_KEY) || '{}'); } catch { /* ignore */ }
const REQ_KEY = 'portal.leaveRequests';
try { JSON.parse(localStorage.getItem(REQ_KEY) || '[]').forEach(r => { if (!dbData.leaveRequests.some(x => x.id === r.id)) dbData.leaveRequests.push(r); }); } catch { /* ignore */ }
(dbData.leaveRequests || []).forEach(r => { if (leaveDecisions[r.id]) Object.assign(r, leaveDecisions[r.id]); });

/** Requests the current admin can act on (their own need another admin, so they aren't counted). */
export const getPendingLeaveCount = () =>
  (dbData.leaveRequests || []).filter(r => r.status === 'PENDING' && r.user_id !== dbData.currentUser?.id).length;

/** Refreshes every .js-leave-badge (Admin Panel nav item, admin page button, ...). */
export function updateLeaveBadge() {
  const c = getPendingLeaveCount();
  document.querySelectorAll('.js-leave-badge').forEach(b => { b.textContent = String(c); b.hidden = !c; });
  document.querySelectorAll('[data-nav="admin"]').forEach(a => {
    const label = c ? `Admin Panel, ${c} pending leave request${c > 1 ? 's' : ''}` : 'Admin Panel';
    a.setAttribute('aria-label', label); a.title = c ? `${c} pending leave request${c > 1 ? 's' : ''}` : '';
  });
}

/** Employee action: files a leave request. Flask: POST /leave. */
export function submitLeave({ leave_type, start_date, end_date, days_requested, reason = '' }) {
  const r = { id: Math.max(0, ...dbData.leaveRequests.map(x => x.id)) + 1, user_id: dbData.currentUser.id, leave_type, start_date, end_date,
    days_requested, reason, status: 'PENDING', approver_id: null, approver_comment: null, created_at: new Date().toISOString() };
  dbData.leaveRequests.push(r);
  notifyUsers(otherAdminIds(r.user_id), { type: 'LEAVE_REQUESTED', title: 'New leave request', link: 'admin.html#leave',
    message: `${fullName(dbData.currentUser)} requested ${leave_type} leave from ${start_date} to ${end_date}.` });
  try { const extra = JSON.parse(localStorage.getItem(REQ_KEY) || '[]'); extra.push(r); localStorage.setItem(REQ_KEY, JSON.stringify(extra)); } catch { /* ignore */ }
  updateLeaveBadge();
  return r;
}

/** Employee action: withdraws their own pending request. Flask: POST /leave/<id>/cancel. */
export function cancelLeave(id) {
  const r = dbData.leaveRequests.find(x => x.id === id);
  if (!r || r.status !== 'PENDING') return;
  notifyUsers(otherAdminIds(r.user_id), { type: 'LEAVE_CANCELLED', title: 'Leave request cancelled', link: 'admin.html#leave',
    message: `${fullName(dbData.currentUser)} cancelled their ${r.leave_type} leave from ${r.start_date} to ${r.end_date}.` });
  r.status = 'CANCELLED'; leaveDecisions[id] = { status: 'CANCELLED', approver_id: null, approver_comment: null };
  try { localStorage.setItem(LEAVE_KEY, JSON.stringify(leaveDecisions)); } catch { /* ignore */ }
  updateLeaveBadge();
}

export function decideLeave(id, status, comment = null) {
  const r = (dbData.leaveRequests || []).find(x => x.id === id);
  if (!r) return;
  const d = { status, approver_id: dbData.currentUser.id, approver_comment: comment };
  Object.assign(r, d);
  if (r.user_id !== dbData.currentUser.id) {
    const ok = status === 'APPROVED';
    notifyUsers([r.user_id], { type: ok ? 'LEAVE_APPROVED' : 'LEAVE_DENIED', title: ok ? 'Leave approved' : 'Leave denied', link: 'calander.html',
      message: `Your ${r.leave_type} leave from ${r.start_date} to ${r.end_date} was ${ok ? 'approved' : 'denied'}.` });
  }
  leaveDecisions[id] = d;
  try { localStorage.setItem(LEAVE_KEY, JSON.stringify(leaveDecisions)); } catch { /* ignore */ }
  updateLeaveBadge();
}

// ------------------------------------------------------------------ config --

const LOGO_SRC = './logo_full.svg';   // Flask: {{ url_for('static', filename='logo.svg') }}
const LOGOUT_HREF = '/logout';        // Flask: {{ url_for('logout') }}

// filename -> which nav item is highlighted
const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: 'index.html',     icon: 'layout-dashboard' },
  { key: 'directory', label: 'Directory', href: 'directory.html', icon: 'users' },
  // Leave — disabled for now. Re-enable together with the Leave sections in index.html:
  // { key: 'calendar',  label: 'Calendar',  href: 'calander.html',  icon: 'calendar-days' },
  // Departments — disabled for now. Also uncomment the departments.html entry in PAGE_TO_NAV:
  // { key: 'departments', label: 'Departments', href: 'departments.html', icon: 'building-2' },
  { key: 'profile',   label: 'Profile',   href: 'profile.html',   icon: 'user' },
];
const ADMIN_ITEM = { key: 'admin', label: 'Admin Panel', href: 'admin.html', icon: 'shield' };

const PAGE_TO_NAV = {
  'index.html': 'dashboard',
  'add_device.html': 'dashboard',
  'device_created.html': 'dashboard',
  'directory.html': 'directory',
  // 'calander.html': 'calendar',
  // 'departments.html': 'departments',
  'profile.html': 'profile',
  'change_dsm_password.html': 'profile',
  'admin.html': 'admin',
  'add_user.html': 'admin',
  'edit_user.html': 'admin',
  'admin_user_created.html': 'admin',
};

// ----------------------------------------------------------------- helpers --

/** HTML-escape a value. Only needed where you still build strings for innerHTML. */
export const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function initials(first = '', last = '') {
  return ((first[0] || '') + (last[0] || '')).toUpperCase() || '--';
}

/** Fills an .avatar-box with a photo, falling back to initials. No innerHTML. */
export function renderAvatar(box, { photoUrl, firstName = '', lastName = '' }) {
  if (!box) return;
  const showInitials = () => {
    const span = document.createElement('span');
    span.textContent = initials(firstName, lastName);
    box.replaceChildren(span);
  };

  if (!photoUrl) return showInitials();

  const img = document.createElement('img');
  img.alt = `${firstName} ${lastName}`.trim();
  img.addEventListener('error', showInitials, { once: true });
  img.src = photoUrl; // set after the listener is attached
  box.replaceChildren(img);
}

/** Reads ?id=123 as an integer, or null. */
export function getIdParam(name = 'id') {
  const n = parseInt(new URLSearchParams(window.location.search).get(name), 10);
  return Number.isNaN(n) ? null : n;
}

export function getUserById(id) {
  return (dbData.usersDirectory || []).find(u => u.id === id) || null;
}

export function fullName(u) {
  return [u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.email || '';
}

/** Redirects non-admins away. Returns true if the page may continue. */
export function requireAdmin(redirectTo = 'index.html') {
  if (!dbData.currentUser || !dbData.currentUser.is_admin) {
    window.location.replace(redirectTo);
    return false;
  }
  return true;
}

/** Refreshes Lucide icons after any DOM change that adds <i data-lucide>. */
export function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

/**
 * Flash message, same look as base.html's .flash block.
 * category: 'success' | 'error'
 */
export function showFlash(message, category = 'success', { timeout = 5000 } = {}) {
  let host = document.getElementById('flash-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'flash-host';
    const main = document.querySelector('main') || document.body;
    main.prepend(host);
  }

  const box = document.createElement('div');
  const cat = ['error', 'warning', 'info'].includes(category) ? category : 'success';
  box.className = `flash flash-${cat}`;
  box.setAttribute('role', cat === 'error' || cat === 'warning' ? 'alert' : 'status');

  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', ({ error: 'triangle-alert', warning: 'triangle-alert', info: 'info' }[cat] || 'check'));
  const text = document.createElement('span');
  text.textContent = message;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'flash-close';
  close.setAttribute('aria-label', 'Dismiss');
  close.textContent = '\u00d7';
  close.addEventListener('click', () => box.remove());

  box.append(icon, text, close);
  host.appendChild(box);
  refreshIcons();

  if (timeout) setTimeout(() => box.remove(), timeout);
  return box;
}

// ------------------------------------------------------------------ header --

function currentPage() {
  const file = window.location.pathname.split('/').pop() || 'index.html';
  return file.toLowerCase();
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c) node.append(c);
  return node;
}

function navLink(item, activeKey) {
  const a = el('a', { href: item.href, 'data-nav': item.key, class: 'nav-link' + (item.key === activeKey ? ' active' : '') });
  if (item.key === activeKey) a.setAttribute('aria-current', 'page');
  a.append(el('i', { 'data-lucide': item.icon }), el('span', { text: item.label }));
  if (item.key === 'admin') { const b = el('span', { class: 'badge js-leave-badge' }); b.hidden = true; a.append(b); }
  return a;
}

function buildHeader() {
  const user = dbData.currentUser;
  const activeKey = PAGE_TO_NAV[currentPage()] || null;

  const items = [...NAV_ITEMS];
  if (user && user.is_admin) items.push(ADMIN_ITEM);

  // Brand
  const logo = el('img', { src: LOGO_SRC, alt: 'Company Logo' });
  const brand = el('div', { class: 'header-brand' },
    el('a', { class: 'brand-logo-img', href: 'index.html' }, logo));

  // Nav
  const nav = el('nav', { id: 'nav-links', 'aria-label': 'Main' });
  items.forEach(item => nav.append(navLink(item, activeKey)));

  if (user) {
    const unread = (dbData.notifications || []).filter(n => !n.is_read).length;
    const bell = el('a', { href: 'index.html#notifications', class: 'nav-link nav-bell', 'aria-label': `Notifications, ${unread} unread` });
    bell.append(el('i', { 'data-lucide': 'bell' }), el('span', { class: 'nav-bell-label', text: 'Notifications' }));
    const bellBadge = el('span', { class: 'badge', text: String(unread) });
    bellBadge.hidden = !unread;
    bell.append(bellBadge);
    bell.hidden = !unread;
    nav.append(bell);
    nav.append(el('span', { class: 'nav-user', text: user.email }));
    const logout = el('a', { href: LOGOUT_HREF, class: 'nav-link nav-logout' });
    logout.append(el('i', { 'data-lucide': 'log-out' }), el('span', { text: 'Log out' }));
    nav.append(logout);
  }

  // Hamburger (visible on small screens via injected CSS)
  const toggle = el('button', {
    type: 'button',
    class: 'nav-toggle',
    'aria-label': 'Toggle navigation',
    'aria-expanded': 'false',
    'aria-controls': 'nav-links',
  }, el('i', { 'data-lucide': 'menu' }));

  const container = el('div', { class: 'header-container' }, [brand, toggle, nav]);

  const setOpen = open => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.replaceChildren(el('i', { 'data-lucide': open ? 'x' : 'menu' }));
    refreshIcons();
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest && e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', e => {
    if (!e.composedPath().includes(container)) setOpen(false);
  });

  return container;
}

// Styles the header needs that style.css doesn't have yet. Safe to move into
// style.css later and delete this block.

/** Renders the header into #site-header (or replaces an existing header.header). */
export function initLayout() {

  const mount = document.getElementById('site-header') || document.querySelector('header.header');
  if (mount) {
    mount.className = 'header';
    mount.replaceChildren(buildHeader());
  }

  updateLeaveBadge();
  const main = document.querySelector('main');
  if (main) {
    main.id = main.id || 'main-content'; main.tabIndex = -1;
    if (!document.querySelector('.skip-link')) document.body.prepend(el('a', { class: 'skip-link', href: '#' + main.id, text: 'Skip to main content' }));
  }
  ensureCsrfFields();
  localizeValidation();
  makeTablesFocusable();
  applyTranslations();
  refreshIcons();
}

/** Scrollable regions must be reachable by keyboard (tabindex + region + accessible name). */
function makeTablesFocusable() {
  document.querySelectorAll('.table-wrap').forEach(w => {
    const panel = w.closest('[role="tabpanel"]');
    const src = (panel && document.getElementById(panel.getAttribute('aria-labelledby'))) || w.closest('.card')?.querySelector('.card-title');
    const name = src ? [...src.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() : '';
    w.tabIndex = 0; w.setAttribute('role', 'region'); w.setAttribute('aria-label', name || 'Data table');
  });
}

// ------------------------------------------------------------------ dialogs --
// Replaces confirm()/prompt()/alert(): styled, translated, focus-trapped, Esc/backdrop to cancel.
// confirmDialog -> Promise<boolean>; promptDialog -> Promise<string|null>; alertDialog -> Promise<true>.
let dialogSeq = 0;
function openDialog({ title, message = '', confirmText = 'Confirm', cancelText = 'Cancel', danger = false, alertOnly = false, input = null }) {
  return new Promise(resolve => {
    const id = `dlg${++dialogSeq}`, prev = document.activeElement;
    const overlay = el('div', { class: 'modal-overlay', role: danger || alertOnly ? 'alertdialog' : 'dialog', 'aria-modal': 'true', 'aria-labelledby': `${id}-t`, 'aria-describedby': `${id}-d` });
    const card = el('div', { class: 'modal-card' });
    card.append(el('h3', { class: 'modal-title', id: `${id}-t`, text: title }), el('p', { class: 'modal-description', id: `${id}-d`, text: message }));
    let field = null;
    if (input) {
      field = el('input', { type: 'text', class: 'form-input', id: `${id}-i`, maxlength: '200', placeholder: input.placeholder || '' });
      const group = el('div', { class: 'form-group' }, [el('label', { class: 'form-label', for: `${id}-i`, text: input.label }), field]);
      group.style.marginTop = '1rem'; card.append(group);
    }
    const cancel = el('button', { type: 'button', class: 'btn btn-outline', text: cancelText });
    const ok = el('button', { type: 'button', class: `btn ${danger ? 'btn-red' : 'btn-primary'}`, text: confirmText });
    ok.style.marginTop = '0';
    card.append(el('div', { class: 'modal-actions' }, alertOnly ? [ok] : [cancel, ok]));
    overlay.append(card);
    const cancelValue = input ? null : alertOnly;
    const finish = v => { setInertExcept(overlay, false); overlay.remove(); document.body.style.overflow = ''; if (prev && prev.focus) prev.focus(); resolve(v); };
    ok.addEventListener('click', () => finish(input ? field.value.trim() : true));
    cancel.addEventListener('click', () => finish(cancelValue));
    overlay.addEventListener('click', e => { if (e.target === overlay) finish(cancelValue); });
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); finish(cancelValue); }
      else if (e.key === 'Enter' && field && e.target === field) { e.preventDefault(); ok.click(); }
      else trapFocus(overlay, e);
    });
    document.body.append(overlay); document.body.style.overflow = 'hidden'; setInertExcept(overlay, true);
    (field || (danger && !alertOnly ? cancel : ok)).focus();
  });
}
export const confirmDialog = o => openDialog(o);
export const alertDialog = o => openDialog({ ...o, alertOnly: true, confirmText: o.confirmText || 'OK' });
export const promptDialog = o => openDialog({ ...o, input: { label: o.label, placeholder: o.placeholder } });

/** While a dialog is open, everything behind it is inert: no Tab, no clicks, hidden from screen readers. */
export function setInertExcept(overlay, on) {
  [...document.body.children].forEach(c => { if (c !== overlay && !['SCRIPT', 'LINK', 'STYLE'].includes(c.tagName)) c.toggleAttribute('inert', on); });
}

// ---------------------------------------------------------- department dialogs --
/** Add / edit department pop-up (shared by the admin tab and the department page). Resolves with the saved department, or null. */
export function departmentDialog(id = null) {
  return new Promise(resolve => {
    const cur = dbData.departments.find(d => d.id === id) || null, uid = `dd${++dialogSeq}`, prev = document.activeElement;
    const banned = cur ? new Set([cur.id, ...descendantIds(cur.id)]) : new Set();   // can't move a department under itself
    const input = (key, max) => el('input', { type: 'text', class: 'form-input', id: `${uid}-${key}`, maxlength: String(max) });
    const select = (key, first, items, value) => {
      const s = el('select', { class: 'form-input', id: `${uid}-${key}` });
      s.add(new Option(first, '')); items.forEach(([v, l]) => s.add(new Option(l, v))); s.value = value ? String(value) : '';
      return s;
    };
    const group = (label, control, star) => el('div', { class: 'form-group' }, [
      el('label', { class: 'form-label', for: control.id, text: label }, star ? [el('span', { text: ' *', 'aria-hidden': 'true', style: 'color:#b91c1c' })] : []), control]);
    const name = input('n', 80), desc = input('d', 200);
    name.value = cur ? cur.name : ''; desc.value = cur ? cur.description || '' : '';
    const parent = select('p', 'None (top level)', dbData.departments.filter(d => !banned.has(d.id)).map(d => [d.id, d.name]), cur?.parent_id);
    const tree = cur ? new Set([cur.id, ...descendantIds(cur.id)]) : new Set();   // only people inside this department can manage it
    const candidates = (dbData.usersDirectory || []).filter(u => tree.has(u.profile?.department_id) && (!u.disabled || (cur && u.id === cur.manager_id)));
    const manager = select('m', 'No manager', candidates.map(u => [u.id, fullName(u)]), cur?.manager_id);
    const error = el('p', { class: 'error-text', role: 'alert' }); error.hidden = true;
    const form = el('form', { class: 'space-y', novalidate: '', method: 'post' }, [el('input', { type: 'hidden', name: 'csrf_token', value: csrfToken() }), group('Name', name, true), group('Description', desc), group('Parent department', parent), group('Manager', manager),
      el('p', { class: 'form-hint', text: candidates.length ? 'The manager must be a member of this department or one of its sub-departments.' : 'No employees yet: add employees to this department, then pick a manager.' }), error]);
    form.style.marginTop = '1.25rem';
    const cancel = el('button', { type: 'button', class: 'btn btn-outline', text: 'Cancel' });
    const submit = el('button', { type: 'submit', class: 'btn btn-primary', text: cur ? 'Save changes' : 'Add department' });
    submit.style.marginTop = '0';
    form.append(el('div', { class: 'modal-actions' }, [cancel, submit]));
    const overlay = el('div', { class: 'modal-overlay', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': `${uid}-t` }, [
      el('div', { class: 'modal-card', style: 'max-width:32rem;' }, [el('h3', { class: 'modal-title', id: `${uid}-t`, text: cur ? 'Edit department' : 'Add department' }), form])]);
    const finish = v => { setInertExcept(overlay, false); overlay.remove(); document.body.style.overflow = ''; if (prev && prev.isConnected && prev.focus) prev.focus(); resolve(v); };
    cancel.addEventListener('click', () => finish(null));
    overlay.addEventListener('click', e => { if (e.target === overlay) finish(null); });
    overlay.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); finish(null); } else trapFocus(overlay, e); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nm = name.value.trim();
      const dup = dbData.departments.some(d => d.id !== id && d.name.toLowerCase() === nm.toLowerCase());
      if (!nm || dup) { error.textContent = t(!nm ? 'Enter a department name.' : 'A department with this name already exists.'); error.hidden = false; name.focus(); return; }
      const f = { name: nm, description: desc.value.trim(), parent_id: Number(parent.value) || null, manager_id: Number(manager.value) || null };
      const saved = cur ? updateDepartment(id, f) : addDepartment(f);
      finish(saved);
      showFlash(`Department "${nm}" ${cur ? 'updated' : 'added'}.`, 'success');
    });
    document.body.append(overlay); document.body.style.overflow = 'hidden'; setInertExcept(overlay, true); name.focus();
  });
}

/** Delete flow: blocked while employees / sub-departments remain, otherwise asks first. Resolves true if deleted. */
export async function deleteDepartmentFlow(id) {
  const d = dbData.departments.find(x => x.id === id);
  if (!d) return false;
  const use = departmentUsage(id);
  if (use.members || use.children) {
    await alertDialog({ title: "Can't delete this department",
      message: use.members ? `Move its ${use.members} employee${use.members > 1 ? 's' : ''} to another department first.` : 'Move or delete its sub-departments first.' });
    return false;
  }
  if (!await confirmDialog({ title: 'Delete department?', message: `Delete "${d.name}"? This can't be undone.`, confirmText: 'Delete', danger: true })) return false;
  deleteDepartment(id); showFlash(`Department "${d.name}" deleted.`, 'success');
  return true;
}

// ------------------------------------------------------------------ back links --
// "Back" follows a trail of the pages visited in this tab (sessionStorage) instead of the browser referrer. A referrer
// ping-pongs (A -> B, then B's "back" opens A, whose referrer is now B ...). With a trail, arriving at a page that is
// already in it simply cuts the trail back to that page, so "back" always walks towards where the visit started.
// Flask: not needed on the server; keep this in the shared template script.
const BACK_LABELS = { 'directory.html': 'Back to directory', 'index.html': 'Back to dashboard', 'departments.html': 'Back to departments',
  'admin_department.html': 'Back to department', 'person.html': 'Back to colleague' };
const DETAIL_PAGES = ['person.html', 'admin_department.html', 'edit_user.html'];   // pages that call setupBackLink()
const TRAIL_KEY = 'portal.trail';

/** Points a "back" link at the previous page of the trail. `admin*` say which admin tab to return to. */
export function setupBackLink(a, { fallbackHref, fallbackLabel, adminHash = '', adminLabel = 'Back to employees' }) {
  const file = location.pathname.split('/').pop() || 'index.html', here = file + location.search;
  const entryFor = (f, search = '') => f === 'admin.html' ? { href: 'admin.html' + adminHash, label: adminLabel } : { href: f + search, label: BACK_LABELS[f] || 'Back' };
  let trail = [];
  try { trail = JSON.parse(sessionStorage.getItem(TRAIL_KEY) || '[]'); } catch { /* no storage */ }

  const at = trail.findIndex(e => e.href === here);
  if (at >= 0) {
    trail = trail.slice(0, at + 1);                       // reload, "back" or browser back: cut the trail back to this page
  } else {
    let from = null;
    try { const r = new URL(document.referrer); if (r.origin === location.origin && r.href !== location.href) from = { file: r.pathname.split('/').pop() || 'index.html', search: r.search }; } catch { /* no referrer */ }
    const continuing = from && DETAIL_PAGES.includes(from.file) && trail.length && trail[trail.length - 1].href === from.file + from.search;
    if (!continuing) trail = [from && !DETAIL_PAGES.includes(from.file) ? entryFor(from.file, from.search) : { href: fallbackHref, label: fallbackLabel }];   // new visit: start a new trail
    trail.push({ href: here, label: BACK_LABELS[file] || 'Back' });
  }
  try { sessionStorage.setItem(TRAIL_KEY, JSON.stringify(trail)); } catch { /* ignore */ }

  const prev = trail.length > 1 ? trail[trail.length - 2] : { href: fallbackHref, label: fallbackLabel };
  a.setAttribute('href', prev.href);
  const text = [...a.childNodes].reverse().find(n => n.nodeType === 3);
  if (text) text.nodeValue = ` ${prev.label}`;
}

/** Admin action: confirm, flag a forced password change, then show the new temporary password once. Flask: POST /admin/users/<id>/reset-dsm-password. */
export async function resetNasPasswordFlow(user) {
  if (!await confirmDialog({ title: 'Reset NAS password?', message: `Reset the NAS password for ${fullName(user)}? A temporary password is generated and they must set their own at next sign-in.`, confirmText: 'Reset password' })) return false;
  user.dsm_must_change_password = true; saveUsers();
  location.href = `admin_user_created.html?id=${user.id}`;
  return true;
}

// Buttons marked data-reload (e.g. the calendar load-failure message) reload the page; no inline handlers, so a strict CSP works.
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-reload]')) location.reload(); });

// Auto-run once the DOM is ready, so pages only need to import the module.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLayout, { once: true });
} else {
  initLayout();
}