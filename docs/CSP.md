# Content-Security-Policy for the portal

## State of the front end
- **No inline scripts.** Every page loads its code from `pages/<name>.js` (ES modules) plus the shared `layout.js`, `i18n.js`, `csrf.js`, `forms.js`, `config.js`, `data.js`.
- **No inline event handlers** (`onclick=` etc.). Reload buttons use `data-reload`, handled by one delegated listener in `layout.js`.
- **No inline `<style>` blocks.** The CSS that `layout.js` used to inject now lives in `style.css`; the calendar theme is `calendar.css`.
- **Everything is served from the same origin.** Lucide and FullCalendar are self-hosted in `vendor/`. No CDN, no Google Fonts.
- No `eval`, `new Function` or `javascript:` URLs.

## Recommended header
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'none';
  form-action 'self';
  frame-ancestors 'none'
```
- `script-src 'self'` is fully strict: injected markup can't run script.
- `style-src 'unsafe-inline'` is kept on purpose: the templates use `style=""` attributes in many places and FullCalendar injects its own
  `<style>` tag at runtime. Inline styles can't execute code, so the risk is low. To drop it later, move the `style=""` attributes into
  classes and pass a nonce to FullCalendar.
- `img-src data:` is needed because avatar photos are stored as data URLs in the prototype. With real uploads served from `/static/uploads` you can remove `data:`.
- `frame-ancestors 'none'` blocks clickjacking (add `X-Frame-Options: DENY` for old browsers).
- WorkOS: the login is a full-page redirect, so it needs nothing in `connect-src`. Logout and callback are redirects too.

## Where to set it
- **Flask:** `pip install flask-talisman`, then
  ```python
  from flask_talisman import Talisman
  Talisman(app, content_security_policy={
      "default-src": "'self'", "script-src": "'self'", "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"], "font-src": "'self'", "connect-src": "'self'",
      "object-src": "'none'", "base-uri": "'none'", "form-action": "'self'", "frame-ancestors": "'none'",
  }, force_https=False)   # TLS is terminated by the Synology reverse proxy
  ```
- **Or at the reverse proxy** (Synology: Control Panel > Login Portal > Advanced > Reverse Proxy > Custom Header): add the same header there. Do one or the other, not both.

## Roll-out
1. Start with `Content-Security-Policy-Report-Only` (same value) and open every page in both languages. Check the browser console for violations.
2. When it is clean, switch to the enforcing header.
3. `form-action 'self'`: the WorkOS sign-in is a redirect (GET), not a form post, so this is fine. Re-check if you ever post a form to another site.

## Other headers worth adding while you are there
`X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
