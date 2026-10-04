# CSRF protection: how the prototype maps to Flask

## What is in the prototype
- Every `<form>` that submits data is `method="post"` and has a token slot right after the opening tag:
  `<input type="hidden" name="csrf_token" value="" data-csrf>`
- `csrf.js` fills the slot (`ensureCsrfFields()`, run by `layout.js` on every page and by `force_password_change.html`).
  It also exports `csrfToken()` and `csrfFetch()` (adds the `X-CSRFToken` header to non-GET calls).
- Forms built in JavaScript (the add/edit department pop-up) create their own hidden field.
- GET forms never carry a token (it would end up in the URL). There are none left in the prototype.

## Flask wiring (production)
```python
# requirements.txt: Flask-WTF
from flask_wtf.csrf import CSRFProtect, CSRFError

csrf = CSRFProtect(app)                      # checks every POST/PUT/PATCH/DELETE
app.config["WTF_CSRF_TIME_LIMIT"] = None     # token lives as long as the session, so long-open forms don't fail

@app.errorhandler(CSRFError)
def csrf_error(e):
    return render_template("403.html", message="The form expired. Reload the page and try again."), 400
```
- `base.html` `<head>`: `<meta name="csrf-token" content="{{ csrf_token() }}">`
- Every POST form: replace `value=""` with `value="{{ csrf_token() }}"` (or `{{ form.hidden_tag() }}` with Flask-WTF forms).
- `fetch()` calls: use `csrfFetch(url, { method: 'POST', body })` so the header is sent.
- Keep `SESSION_COOKIE_SAMESITE="Lax"` (already set): it is a second layer, not a replacement.

## Every state-changing action (all must be POST + token)
| Action | Endpoint | Where |
|---|---|---|
| Add device (self / for an employee) | `/devices/add`, `/admin/users/<id>/devices/add` | add_device, edit_user |
| Disconnect / reconnect / delete device | `/devices/<id>/revoke`, `/reconnect`, `/delete` | dashboard, edit_user |
| Add employee | `/admin/users/add` | add_user |
| Save employee profile / access | `/admin/users/<id>/edit` (+ `/toggle`, `/toggle_admin`) | edit_user |
| Delete employee | `/admin/users/<id>/delete` | edit_user |
| Reset NAS password (admin) | `/admin/users/<id>/reset-dsm-password` | person |
| Change NAS password | `/account/change-dsm-password` | change_dsm_password, force_password_change |
| Interface language | `/account/language` | profile |
| Mark notifications read | `/notifications/read` (fetch + header) | dashboard |
| Request / cancel leave | `/leave`, `/leave/<id>/cancel` | calander |
| Approve / deny leave | `/admin/leave/<id>/approve`, `/deny` | admin |
| Add / edit / delete department | `/admin/departments`, `/<id>`, `/<id>/delete` | admin, admin_department |

Buttons that are plain `<button>`s with JS in the prototype (disconnect, reconnect, delete, approve, deny, cancel) must become small
`<form method="post">` elements in Jinja, each with the token, with the confirm dialog on `submit`.

## Also fix while you are there
- **Logout is a GET link** (`/logout`). Make it `methods=["POST"]` and render it as a form button with the token.
- `/account/profile` POST is no longer needed: employees can't edit their profile (admins do, in the admin panel).
- State-changing routes must not respond to GET. `launcher-script` is the one intentional GET with side effects; it is protected by its one-time token instead.

## Test
1. POST any route above without the token: expect 400 and the friendly page.
2. Submit each form normally: expect success.
3. Open a form, log out and in again, submit the old form: expect 400.
