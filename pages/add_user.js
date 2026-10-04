// Page script for add_user.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { requireAdmin, renderAvatar, fillDepartmentSelect, saveUsers, refreshIcons, t, readImageFile, showFlash , guardedSubmit } from '../layout.js';

    document.addEventListener('DOMContentLoaded', () => {
      if (!requireAdmin()) return;
      const $ = id => document.getElementById(id);
      fillDepartmentSelect($('u-dept'));

      const preview = () => renderAvatar($('avatar-preview-box'), { photoUrl: $('u-photo').value.trim(), firstName: $('u-firstname').value.trim(), lastName: $('u-lastname').value.trim() });
      ['u-firstname', 'u-lastname', 'u-photo'].forEach(id => $(id).addEventListener('input', preview));
      $('u-browse-btn').addEventListener('click', () => $('u-photo-file').click());
      $('u-photo-file').addEventListener('change', async e => {
        const f = e.target.files[0]; if (!f) return;
        try { $('u-photo').value = await readImageFile(f); preview(); } catch (err) { showFlash(err.message, 'error'); }
        e.target.value = '';
      });

      guardedSubmit($('add-user-form'), e => {
        e.preventDefault();
        const users = dbData.usersDirectory, err = $('form-error');
        const fail = (msg, field) => { err.textContent = t(msg); err.hidden = false; $(field).focus(); return false; };
        const email = $('u-email').value.trim().toLowerCase();
        if (users.some(u => u.email.toLowerCase() === email)) return fail(`${email} already has an account.`, 'u-email');
        // same rule as app.py: NAS username = sanitised local part of the email, max 32 chars
        const dsm = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 32);
        if (users.some(u => u.dsm_username === dsm)) return fail(`The NAS username "${dsm}" is already taken.`, 'u-email');
        err.hidden = true;

        const id = Math.max(0, ...users.map(u => u.id)) + 1;
        users.push({
          id, email, first_name: $('u-firstname').value.trim(), last_name: $('u-lastname').value.trim(),
          is_admin: $('e-isadmin').checked, disabled: false,
          dsm_username: dsm, dsm_must_change_password: true,          // always forced at first sign-in
          devices: [],
          profile: { job_title: $('u-jobtitle').value.trim(), department_id: Number($('u-dept').value), phone: $('u-phone').value.trim(),
                     office_location: $('u-office').value.trim(), photo_url: $('u-photo').value.trim() || null, bio: $('u-bio').value.trim(),
                     start_date: new Date().toISOString().slice(0, 10) },
        });
        saveUsers();
        location.href = `admin_user_created.html?id=${id}`;
      });
      refreshIcons();
    });
  
