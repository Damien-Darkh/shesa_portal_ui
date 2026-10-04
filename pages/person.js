// Page script for person.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { getIdParam, getUserById, fullName, renderAvatar, esc, fmtDate, getLang, refreshIcons, resetNasPasswordFlow, setupBackLink, t } from '../layout.js';

    document.addEventListener('DOMContentLoaded', () => {
      const $ = id => document.getElementById(id), me = dbData.currentUser;
      setupBackLink($('p-back'), { fallbackHref: 'directory.html', fallbackLabel: 'Back to directory', adminHash: '#employees', adminLabel: 'Back to employees' });
      const base = getUserById(getIdParam());
      if (!base || (base.disabled && !me.is_admin)) { $('p-missing').hidden = false; return; }   // disabled users are only visible to admins
      // the logged-in user has extra account fields (WorkOS id, created_at, ...) that directory entries don't carry
      const u = base.id === me.id ? { ...base, ...me, profile: { ...base.profile, ...me.profile }, devices: base.devices || me.devices } : base;
      const p = u.profile || {}, dept = dbData.departments.find(d => d.id === p.department_id);
      const byId = x => dbData.departments.find(d => d.id === x);
      $('p-content').hidden = false;

      /* ---- everyone sees this part ---- */
      renderAvatar($('p-avatar'), { photoUrl: p.photo_url, firstName: u.first_name, lastName: u.last_name });
      $('p-name').textContent = fullName(u); $('p-job').textContent = p.job_title || '';
      $('p-email').textContent = u.email; $('p-email').href = `mailto:${u.email}`;
      $('p-phone').textContent = p.phone || '—'; if (p.phone) $('p-phone').href = `tel:${p.phone.replace(/[^\d+]/g, '')}`;
      $('p-dept').textContent = dept ? dept.name : '—'; $('p-office').textContent = p.office_location || '—';
      if (p.start_date) { $('p-start').textContent = fmtDate(p.start_date); $('p-start-wrap').hidden = false; }
      if (p.bio) { $('p-bio').textContent = p.bio; $('p-bio-wrap').hidden = false; }
      document.title = `${fullName(u)} - Employee Portal`;

      /* ---- administrators get the full record ---- */
      if (me.is_admin) {
        const kv = (label, value) => `<div class="detail-item"><div><p class="label">${label}</p><p class="value">${value}</p></div></div>`;
        const mono = v => v ? `<span class="mono">${esc(v)}</span>` : '—';
        const dt = iso => iso ? new Date(iso).toLocaleString(getLang() === 'it' ? 'it-IT' : 'en-GB') : '—';
        const pill = (cls, text) => `<span class="status ${cls}">${text}</span>`;
        const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;
        const kind = s => ({ PENDING: 'pending', DENIED: 'denied', CANCELLED: 'cancelled' }[s] || 'approved');
        const label = { pending: 'Pending', denied: 'Denied', approved: 'Approved', cancelled: 'Cancelled' };
        const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
        const users = dbData.usersDirectory || [];
        const devices = u.devices || [];

        $('adm').hidden = false; $('adm-actions').hidden = false;
        $('a-edit').href = `edit_user.html?id=${u.id}`;
        const nas = $('a-nas'); nas.hidden = false;           // always offered to admins; disabled only if there is truly no NAS account
        if (!u.dsm_username) { nas.disabled = true; nas.title = t('This employee has no NAS account'); }
        nas.addEventListener('click', () => resetNasPasswordFlow(base));
        $('p-pills').hidden = false;
        $('p-pills').innerHTML = pill(u.is_admin ? 'status--admin' : 'status--staff', u.is_admin ? 'Admin' : 'Staff')
          + pill(u.disabled ? 'status--off' : 'status--active', `<span class="pulse"></span>${u.disabled ? 'Disabled' : 'Active'}`);

        $('adm-account').innerHTML =
          kv('User ID', mono(String(u.id))) + kv('WorkOS user ID', mono(u.workos_user_id)) +
          kv('Role', u.is_admin ? 'Admin' : 'Staff') + kv('Status', u.disabled ? 'Disabled' : 'Active') +
          kv('Created', dt(u.created_at)) + kv('Last profile update', dt(p.updated_at)) +
          kv('NAS username', u.dsm_username ? mono(u.dsm_username) : 'Not provisioned') +
          kv('Password change', u.dsm_username ? (u.dsm_must_change_password ? 'Required at next sign-in' : 'Not required') : '—') +
          kv('Devices', `${devices.filter(d => !d.is_revoked).length} / ${devices.length}`);

        const chain = []; for (let q = dept, n = 0; q && n < 20; q = byId(q.parent_id), n++) chain.unshift(q.name);
        const mgr = users.find(x => dept && x.id === dept.manager_id);
        const manages = dbData.departments.filter(d => d.manager_id === u.id);
        const mates = dept ? users.filter(x => !x.disabled && x.id !== u.id && x.profile?.department_id === dept.id).length : 0;
        $('adm-org').innerHTML =
          kv('Department', dept ? link(`admin_department.html?id=${dept.id}`, dept.name) : '—') +
          kv('Department path', chain.length ? esc(chain.join(' › ')) : '—') +
          kv('Manager', mgr && mgr.id !== u.id ? link(`person.html?id=${mgr.id}`, fullName(mgr)) : '—') +
          kv('Manages', manages.length ? manages.map(d => link(`admin_department.html?id=${d.id}`, d.name)).join(', ') : '—') +
          kv('Colleagues in department', mates);

        $('adm-devices').innerHTML = devices.length ? devices.map(d => `<tr><td>${esc(d.device_name)}</td><td class="mono">${esc(d.wg_address || '')}</td><td>${fmtDate(d.created_at)}</td>
          <td>${d.is_revoked ? pill('status--off', d.auto_revoked ? 'Disconnected (account disabled)' : 'Disconnected') : pill('status--active', '<span class="pulse"></span>Active')}</td></tr>`).join('')
          : '<tr><td colspan="4"><div class="empty-state"><i data-lucide="inbox"></i><span>No devices.</span></div></td></tr>';

        const bal = (dbData.leaveBalances || []).filter(b => b.user_id === u.id);
        $('adm-balances').hidden = !bal.length;
        $('adm-bal-body').innerHTML = bal.map(b => `<tr><td>${esc(cap(b.leave_type))}</td><td>${b.accrued_days}</td><td>${b.carryover_days}</td><td>${b.used_days}</td><td>${b.pending_days}</td>
          <td><strong>${b.accrued_days + b.carryover_days - b.used_days - b.pending_days}</strong></td></tr>`).join('');
        const reqs = (dbData.leaveRequests || []).filter(r => r.user_id === u.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
        $('adm-leave').innerHTML = reqs.length ? reqs.map(r => { const k = kind(r.status); return `<tr><td>${esc(cap(r.leave_type))}</td><td>${fmtDate(r.start_date)} &rarr; ${fmtDate(r.end_date)}</td><td>${r.days_requested}</td>
          <td style="white-space:normal;min-width:10rem;">${esc(r.reason || '')}${k === 'denied' && r.approver_comment ? `<div class="form-hint">${esc(r.approver_comment)}</div>` : ''}</td>
          <td>${pill('status--' + k, label[k])}</td></tr>`; }).join('')
          : '<tr><td colspan="5"><div class="empty-state"><i data-lucide="inbox"></i><span>No leave requests.</span></div></td></tr>';
      }
      refreshIcons();
    });
  
