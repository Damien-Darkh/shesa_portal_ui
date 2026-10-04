# Employee Portal: UI Prototype

A clickable front-end prototype for the company employee portal, written in plain HTML, CSS and JavaScript (ES modules). There is **no backend**: all data is mock data kept in the browser. It exists to settle the design, copy, accessibility and behaviour **before** the pages are ported to Flask/Jinja2 templates (the Flask app already exists: `app.py`, `models.py`, WorkOS login, WireGuard/OPNsense, Synology NAS).

The default language is **Italian**; English can be selected on the Profile page.

---

## 1. Running it

ES modules do not load from `file://`, so serve the folder over HTTP:

```bash
cd portal-prototype
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

No build step, no npm, no CDN. Everything (Lucide icons, FullCalendar) is self-hosted in `vendor/`.

**You must supply `logo.svg`** (the favicon, referenced as `./logo.svg` on every page). `logo_full.svg` (header logo) is included.

### Who am I logged in as?
There is no login. `data.js` defines `currentUser` (Damien Vance, **admin**). To see the staff (non-admin) view, set `is_admin: false` in `data.js` (in both `currentUser` and the matching entry in `usersDirectory`) and reload. Admin-only pages redirect non-admins to the dashboard.

### Resetting the prototype
Edits are persisted so they survive page navigation. To restore the original mock data, clear the site's storage (DevTools → Application → Clear site data), or remove these keys:

| Storage | Keys |
|---|---|
| `localStorage` | `portal.users`, `portal.departments.v2`, `portal.readNotifications`, `portal.notifications.created`, `portal.leaveDecisions`, `portal.leaveRequests`, `portal.lang` |
| `sessionStorage` | `portal.trail` (back-link history), `portal.csrf` (prototype CSRF token) |

---

## 2. Folder layout

```
index.html, admin.html, ...      one HTML file per page (see §3)
pages/<page>.js                  the script for each page (no inline JS anywhere)
layout.js                        shared header/nav, dialogs, notifications, leave + department helpers, back-links
i18n.js                          Italian dictionary + patterns, date/relative-time formatting
csrf.js                          CSRF token helpers (prototype stand-in for Flask-WTF)
forms.js                         double-submit guard + Italian validation messages
config.js                        feature switches
data.js                          mock database (mirrors models.py)
style.css                        design tokens, layout, cards, forms, buttons, modals, responsive rules
components.css                   status pills, tables, tabs, callouts, pager, notification list
calendar.css                     FullCalendar theme
vendor/                          lucide.min.js, fullcalendar.min.js, fullcalendar-it.min.js (self-hosted)
docs/CSRF.md, docs/CSP.md        security guides for the Flask port
_port/icons_additions.html       new Jinja icon macros to append to templates/icons.html
```

---

## 3. Pages

| Page | Audience | What it does |
|---|---|---|
| `index.html` | everyone | Dashboard: profile card, personal details, notifications, VPN devices |
| `directory.html` | everyone | Search people by name/email/job title, filter by department |
| `person.html?id=` | everyone (admins see more) | Colleague profile. Admins also get account details, org chart, devices, leave history and balances, plus Edit and Reset NAS password |
| `profile.html` | everyone | Read-only own details, language selector, link to change NAS password |
| `add_device.html`, `device_created.html` | everyone | Create a WireGuard device; one-time QR/config screen; Windows launcher download |
| `change_dsm_password.html` | everyone | Change the NAS password |
| `force_password_change.html` | everyone (forced) | First-login flow with no navigation, requirement checklist |
| `calander.html` | everyone | Leave calendar and request form *(disabled, see §5)* |
| `admin.html` | admin | Tabs: Employees, Leave approvals, Leave calendar, Departments |
| `add_user.html`, `edit_user.html` | admin | Create / edit an employee, access flags, NAS reset, devices, delete |
| `admin_user_created.html` | admin | Shows the temporary NAS password **once** |
| `admin_department.html?id=` | admin | Department detail: manager, sub-departments, members; edit/delete |
| `departments.html` | none | Employee-facing department view, **not linked anywhere** (candidate for removal) |
| `403.html`, `404.html`, `500.html`, `account_disabled.html` | system | Error pages. These use a logo-only header and must not depend on `data.js` |

---

## 4. Behaviour and rules worth knowing

**Roles.** Only **Admin** and **Staff**. Admins cannot approve their own leave (another admin must) and cannot disable, demote or delete themselves.

**Devices.** Disabling an account revokes all active devices and flags them `auto_revoked`. Re-enabling restores only those, never a device the employee disconnected themselves. This mirrors `app.py`.

**NAS accounts.** The username is the sanitised local part of the email (max 32 chars). New accounts always require a password change at first sign-in. The temporary password is shown once.

**Departments.** Can be nested. A department's manager must belong to that department or one of its sub-departments. If a manager is moved or deleted, the manager role is cleared automatically (`reconcileManagerRoles`). A department cannot be deleted while it has members or sub-departments, and cannot be moved under itself.

**Leave.** Request validation: dates in order, at least one weekday, no overlap with the employee's own pending/approved requests. Colleagues' approved leave is visible without its type (sick leave stays private). Decisions: approve, or deny with an optional reason.

**Notifications.** Created on: leave requested (to other admins), approved/denied (to the requester), cancelled (to other admins). Marked read when opened or after 2 seconds on screen. The header bell is hidden when nothing is unread.

**Back links.** Detail pages keep a trail in `sessionStorage` so "Back" walks toward where the visit started and never ping-pongs between two pages.

**Double submit.** Data forms use `guardedSubmit()`, which disables the button, shows a spinner and "Saving…", and ignores repeat submits.

---

## 5. Feature switches

| Switch | Where | State |
|---|---|---|
| Leave filters (employee, date range) on the Leave approvals tab | `config.js` → `FEATURES.leaveFilters` | **off** |
| Leave / Calendar nav and dashboard sections | commented blocks in `layout.js` (`NAV_ITEMS`, `PAGE_TO_NAV`) and `index.html` | **off** |
| Departments page for employees | commented entries in `layout.js` | **off** |

The leave screens and logic are complete; they are hidden from navigation only.

---

## 6. Conventions (please keep to them)

- **No inline scripts, styles or event handlers.** Page code goes in `pages/<name>.js`; styling in the CSS files. This is what lets the site run with a strict Content-Security-Policy (`docs/CSP.md`). Use `data-*` attributes plus delegated listeners, not `onclick=`.
- **Escape everything user-supplied** that is placed into `innerHTML` with `esc()` from `layout.js` (names, emails, job titles, device names, notification text, link targets). Prefer `textContent` / DOM building where practical.
- **Translations.** The English string in the HTML/JS is the key. Add the Italian text to `IT` in `i18n.js`; text that contains a name or number goes in `PATTERNS`. Mark content that must never be translated (names, usernames) with `data-no-i18n`. Dates: use `fmtDate()`; relative times: `fmtRelative()`.
- **Forms.** Every form is `method="post"` with `<input type="hidden" name="csrf_token" value="" data-csrf>`; the script fills it. GET forms never carry a token.
- **Dialogs.** Use `confirmDialog`, `alertDialog`, `promptDialog` (never `confirm()`/`alert()`/`prompt()`). Custom modals must call `trapFocus()` and `setInertExcept()` so the page behind them is inert, and restore focus on close.
- **Accessibility.** Keep: skip link, labelled inputs, `role="alert"` for errors / `role="status"` for confirmations, tab semantics with arrow-key support, keyboard-reachable scrollable tables, `prefers-reduced-motion` support, 44px touch targets on touch devices. The `hidden` attribute always wins over flex/inline-flex (`[hidden]{display:none!important}`).
- **Design tokens** live at the top of `style.css`: `--primary #005f94`, `--primary-hover #004a75`, `--accent-light #e6f5fc`, `--accent-text #0073b3`. Primary and text colours were chosen to meet WCAG AA contrast.
- **Responsive range:** about 320px phones up to unfolded tri-fold screens. Italian labels are longer than English, so buttons wrap on narrow screens rather than overflow.

---

## 7. Porting to Flask / Jinja2

The prototype mirrors the existing `templates/` (same class names, same icon set, same page names), so the port is mostly mechanical.

| Prototype | Becomes |
|---|---|
| `data.js` and every `localStorage` block | the database (`models.py`); delete them |
| `layout.js` header/nav | `base.html`; icons come from `icons.html` macros (add `_port/icons_additions.html`) |
| `i18n.js` | Flask-Babel plus a `User.language` column (default `it`) |
| `csrf.js` | Flask-WTF `CSRFProtect`; see `docs/CSRF.md` for every action and the button-to-form conversions |
| JS-only action buttons (disconnect, delete, approve, deny, cancel) | small `<form method="post">` elements with the token; keep the confirm dialog on `submit` |
| `pages/*.js` | keep, minus the mock-data code; they still handle dialogs, tabs, validation and UX |
| Notification creation in `layout.js` | server-side rows on the same events (and emails if wanted) |
| CSP header | Flask-Talisman or the Synology reverse proxy; see `docs/CSP.md` |

Housekeeping while porting:
- Rename `calander.html` / `pages/calander.js` to `calendar.*`.
- Make **logout a POST**; remove the `/account/profile` POST (employees cannot edit their profile; admins do).
- Decide whether `departments.html` is removed or becomes a read-only employee view.
- Replace the QR placeholder in `device_created.html` with the real `/devices/<id>/qr` image and the mock config text with the real one-time `.conf`.
- Real photo uploads replace the data-URL avatars (then `data:` can be dropped from `img-src`).

---

## 8. Known gaps

- Cross-user behaviour (for example another admin receiving a notification) cannot be seen, because the prototype is always logged in as one user.
- Italian text on the narrowest screens (≈320px) still deserves a visual check on a real device.
- No automated browser tests yet (a Playwright script covering the main flows is a sensible next step).
- `development.md` in the repository is out of date (mentions HR Manager, Okta, Elasticsearch) and should be rewritten or removed.
- Notification emails and server-side validation exist only as notes for the Flask side.
