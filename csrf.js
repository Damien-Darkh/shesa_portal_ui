// csrf.js - CSRF token plumbing. No side effects, so standalone pages (no nav) can import it too.
//
// Flask (Flask-WTF CSRFProtect):  base.html has <meta name="csrf-token" content="{{ csrf_token() }}"> and every POST form has
//   <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">      (see CSRF.md for the full list of actions)
// The prototype has no server, so it simulates the same flow with a per-tab token: the same markup, the same helpers.

/** The current token: from the <meta> tag when Flask rendered one, otherwise a per-tab prototype token. */
export function csrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]')?.content;
  if (meta && !meta.includes('{{')) return meta;
  try {
    let tk = sessionStorage.getItem('portal.csrf');
    if (!tk) { tk = (crypto.randomUUID && crypto.randomUUID()) || String(Math.random()).slice(2); sessionStorage.setItem('portal.csrf', tk); }
    return tk;
  } catch { return 'prototype'; }
}

/** fetch() for state-changing calls: adds the X-CSRFToken header (Flask-WTF reads it) on anything except GET/HEAD/OPTIONS. */
export function csrfFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers.set('X-CSRFToken', csrfToken());
  return fetch(url, { credentials: 'same-origin', ...options, headers });
}

/** Makes sure every POST form carries its token: fills the markup slot, or adds the hidden field if it's missing. */
export function ensureCsrfFields(root = document) {
  root.querySelectorAll('form').forEach(f => {
    if ((f.getAttribute('method') || 'get').toLowerCase() !== 'post') return;      // GET forms must never carry the token (it would leak into the URL)
    let input = f.querySelector('input[name="csrf_token"]');
    if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = 'csrf_token'; f.prepend(input); }
    if (!input.value || input.value.includes('{{')) input.value = csrfToken();
  });
}
