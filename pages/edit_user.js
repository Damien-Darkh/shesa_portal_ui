// Page script for edit_user.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { requireAdmin, getIdParam, getUserById, fullName, fillDepartmentSelect, saveUsers, showFlash, refreshIcons, t, confirmDialog, fmtDate, renderAvatar, readImageFile, reconcileManagerRoles, setupBackLink, resetNasPasswordFlow, guardedSubmit, esc } from '../layout.js';

    document.addEventListener('DOMContentLoaded', () => {
      if (!requireAdmin()) return;
      const $ = id => document.getElementById(id);
      const me = dbData.currentUser, user = getUserById(getIdParam());
      setupBackLink($('eu-back'), { fallbackHref: 'admin.html', fallbackLabel: 'Back to employees', adminHash: '#employees', adminLabel: 'Back to employees' });
      if (!user) { $('eu-missing').hidden = false; return; }
      $('eu-content').hidden = false;
      const self = user.id === me.id;
      user.profile = user.profile || {};

      function header() {
        $('eu-name').textContent = fullName(user); $('eu-email').textContent = user.email;
        $('eu-status').innerHTML = `<span class="status ${user.disabled ? 'status--off' : 'status--active'}"><span class="pulse"></span>${user.disabled ? 'Disabled' : 'Active'}${user.is_admin ? ' · Admin' : ''}</span>`;
      }
      function fill() {
        const p = user.profile;
        $('f-first').value = user.first_name || ''; $('f-last').value = user.last_name || ''; $('f-email').value = user.email;
        $('f-job').value = p.job_title || ''; fillDepartmentSelect($('f-dept'), p.department_id);
        $('f-phone').value = p.phone || ''; $('f-office').value = p.office_location || ''; $('f-photo').value = p.photo_url || ''; $('f-bio').value = p.bio || '';
        $('f-admin').checked = !!user.is_admin; $('f-disabled').checked = !!user.disabled;
        preview();
      }

      const preview = () => renderAvatar($('avatar-preview-box'), { photoUrl: $('f-photo').value.trim(), firstName: $('f-first').value.trim(), lastName: $('f-last').value.trim() });
      ['f-first', 'f-last', 'f-photo'].forEach(id => $(id).addEventListener('input', preview));
      $('f-browse').addEventListener('click', () => $('f-photo-file').click());
      $('f-remove').addEventListener('click', () => { $('f-photo').value = ''; preview(); });
      $('f-photo-file').addEventListener('change', async e => {
        const file = e.target.files[0]; if (!file) return;
        try { $('f-photo').value = await readImageFile(file); preview(); } catch (err) { showFlash(err.message, 'error'); }
        e.target.value = '';
      });

      guardedSubmit($('profile-form'), e => {
        e.preventDefault();
        const email = $('f-email').value.trim().toLowerCase(), err = $('profile-error');
        if (dbData.usersDirectory.some(u => u.id !== user.id && u.email.toLowerCase() === email)) {
          err.textContent = t('That email is already used by another account.'); err.hidden = false; $('f-email').focus(); return false;
        }
        err.hidden = true;
        Object.assign(user, { email, first_name: $('f-first').value.trim(), last_name: $('f-last').value.trim() });
        Object.assign(user.profile, { job_title: $('f-job').value.trim(), department_id: Number($('f-dept').value) || null, phone: $('f-phone').value.trim(),
          office_location: $('f-office').value.trim(), photo_url: $('f-photo').value.trim() || null, bio: $('f-bio').value.trim() });
        saveUsers(); header(); showFlash(`Saved changes for ${fullName(user)}.`, 'success');
        const lost = reconcileManagerRoles(user.id);     // moved out of a department they managed?
        if (lost.length) showFlash(`${fullName(user)} no longer manages: ${lost.join(', ')}.`, 'info');
      });

      // Access: mirrors app.py (disabling revokes active devices and flags them auto_revoked; re-enabling restores only those)
      guardedSubmit($('access-form'), e => {
        e.preventDefault();
        const nowDisabled = $('f-disabled').checked;
        user.is_admin = $('f-admin').checked;
        (user.devices || []).forEach(d => {
          if (nowDisabled && !user.disabled && !d.is_revoked) { d.is_revoked = true; d.revoked_at = new Date().toISOString(); d.auto_revoked = true; }
          else if (!nowDisabled && user.disabled && d.is_revoked && d.auto_revoked) { d.is_revoked = false; d.revoked_at = null; d.auto_revoked = false; }
        });
        user.disabled = nowDisabled;
        saveUsers(); header(); renderDevices(); showFlash(`Saved changes for ${fullName(user)}.`, 'success');
      });

      function renderDevices() {
        const rows = user.devices || [];
        $('dev-tbody').innerHTML = rows.length ? rows.map(d => `<tr>
          <td data-no-i18n>${esc(d.device_name)}</td><td class="mono">${esc(d.wg_address)}</td><td>${fmtDate(d.created_at)}</td>
          <td><span class="status ${d.is_revoked ? 'status--off' : 'status--active'}"><span class="pulse"></span>${d.is_revoked ? 'Disconnected' : 'Active'}</span></td>
          <td><div class="btn-row">
            ${!d.is_revoked ? `<button type="button" class="btn btn-red btn-sm" data-act="revoke" data-id="${d.id}"><i data-lucide="power"></i> Disconnect</button>`
              : !d.auto_revoked ? `<button type="button" class="btn btn-outline btn-sm" data-act="reconnect" data-id="${d.id}"><i data-lucide="refresh-ccw"></i> Reconnect</button>` : ''}
            <button type="button" class="btn btn-red btn-sm" data-act="delete" data-id="${d.id}"><i data-lucide="trash-2"></i> Delete</button></div></td></tr>`).join('')
          : '<tr><td colspan="5"><div class="empty-state"><i data-lucide="inbox"></i><span>No devices.</span></div></td></tr>';
        refreshIcons();
      }
      $('dev-tbody').addEventListener('click', async e => {
        const b = e.target.closest('button[data-act]'); if (!b) return;
        const d = user.devices.find(x => x.id === Number(b.dataset.id));
        if (b.dataset.act === 'delete') {
          if (!await confirmDialog({ title: 'Delete device?', message: `Permanently delete ${d.device_name}? This removes the VPN peer entirely and cannot be undone.`, confirmText: 'Delete', danger: true })) return;
          user.devices = user.devices.filter(x => x !== d);
        } else if (b.dataset.act === 'revoke') {
          if (!await confirmDialog({ title: 'Disconnect device?', message: `Disconnect ${d.device_name}? This device will lose VPN access immediately.`, confirmText: 'Disconnect', danger: true })) return;
          d.is_revoked = true; d.revoked_at = new Date().toISOString();
        } else { d.is_revoked = false; d.revoked_at = null; }
        saveUsers(); renderDevices();
      });
      guardedSubmit($('dev-form'), e => {
        e.preventDefault();
        const name = $('dev-name').value.trim(); if (!name) return false;
        const id = Date.now();
        (user.devices = user.devices || []).push({ id, user_id: user.id, device_name: name, created_at: new Date().toISOString(),
          wg_uuid: `wg-peer-${id}`, wg_api_name: name.toLowerCase().replace(/\W+/g, '_'), wg_address: `10.10.10.${Math.floor(Math.random() * 200 + 20)}/32`,
          revoked_at: null, auto_revoked: false, is_revoked: false, launcher_available: false });
        $('dev-form').reset(); saveUsers(); renderDevices();
      });

      $('delete-btn').addEventListener('click', async () => {
        if (!await confirmDialog({ title: 'Delete employee?', message: `Permanently delete ${user.email} and all of their devices? This cannot be undone.`, confirmText: 'Delete', danger: true })) return;
        dbData.usersDirectory = dbData.usersDirectory.filter(u => u.id !== user.id);
        reconcileManagerRoles(user.id);                  // deleted users stop managing
        saveUsers(); location.href = 'admin.html';
      });

      if (self) { $('access-card').hidden = true; $('danger-card').hidden = true; $('self-note').hidden = false; }
      if (user.dsm_username) { $('nas-card').hidden = false; $('nas-user').textContent = user.dsm_username; $('nas-reset').addEventListener('click', () => resetNasPasswordFlow(user)); }

      header(); fill(); renderDevices(); refreshIcons();
    });
  
