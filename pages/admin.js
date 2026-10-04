// Page script for admin.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
import { FEATURES } from '../config.js';
    import { requireAdmin, renderAvatar, esc, fullName, getUserById, decideLeave, showFlash, refreshIcons, trapFocus, addDepartment, fmtDate, getLang, promptDialog, departmentDialog, descendantIds , setInertExcept } from '../layout.js';

    document.addEventListener('DOMContentLoaded', () => {
      if (!requireAdmin()) return;
      const me = dbData.currentUser;
      const $ = id => document.getElementById(id);
      const users = dbData.usersDirectory || [];
      const kind = s => s === 'PENDING' ? 'pending' : s === 'DENIED' ? 'denied' : s === 'CANCELLED' ? 'cancelled' : 'approved';
      const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

      /* ---------------- Employees: search, filters, sort, pagination ---------------- */
      const empState = { q: '', role: '', status: '', sortKey: 'name', dir: 1, page: 1, size: 10 };
      const deptNameOf = u => (dbData.departments.find(d => d.id === u.profile?.department_id) || {}).name || '';
      const sortBy = {
        name: u => fullName(u).toLowerCase(), email: u => u.email.toLowerCase(), role: u => (u.is_admin ? 0 : 1),
        devices: u => (u.devices || []).filter(d => !d.is_revoked).length, status: u => (u.disabled ? 1 : 0),
      };
      function filteredEmployees() {
        const q = empState.q.trim().toLowerCase();
        return users
          .filter(u => (!q || [fullName(u), u.email, u.profile?.job_title, deptNameOf(u)].some(x => (x || '').toLowerCase().includes(q)))
            && (!empState.role || (empState.role === 'admin') === !!u.is_admin)
            && (!empState.status || (empState.status === 'disabled') === !!u.disabled))
          .sort((a, b) => {
            const x = sortBy[empState.sortKey](a), y = sortBy[empState.sortKey](b);
            return (typeof x === 'string' ? x.localeCompare(y, getLang()) : x - y) * empState.dir || fullName(a).localeCompare(fullName(b), getLang());
          });
      }
      function renderEmployees() {
        const all = filteredEmployees(), pages = Math.max(1, Math.ceil(all.length / empState.size));
        empState.page = Math.min(empState.page, pages);
        const start = (empState.page - 1) * empState.size, rows = all.slice(start, start + empState.size);
        const tbody = $('users-tbody'); tbody.replaceChildren();
        if (!rows.length) {
          tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i data-lucide="inbox"></i><span>${users.length ? 'No employees match your filters.' : 'No employees yet. Add one to get started.'}</span></div></td></tr>`;
        }
        rows.forEach(u => {
          const tr = document.createElement('tr');
          const tdName = document.createElement('td');
          const wrap = document.createElement('div'); wrap.className = 'name-cell';
          const avatar = document.createElement('div'); avatar.className = 'avatar-box avatar-sm';
          renderAvatar(avatar, { photoUrl: u.profile?.photo_url, firstName: u.first_name, lastName: u.last_name });
          const text = document.createElement('div');
          const name = document.createElement('div');
          const nameLink = document.createElement('a'); nameLink.href = `person.html?id=${u.id}`; nameLink.textContent = fullName(u) === u.email ? '—' : fullName(u);
          name.appendChild(nameLink);
          const job = document.createElement('div'); job.className = 'form-hint'; job.style.margin = '0'; job.textContent = u.profile?.job_title || '';
          text.append(name, job); wrap.append(avatar, text); tdName.appendChild(wrap);
          const tdEmail = document.createElement('td'); tdEmail.textContent = u.email;
          const tdRole = document.createElement('td');
          tdRole.innerHTML = `<span class="status ${u.is_admin ? 'status--admin' : 'status--staff'}">${u.is_admin ? 'Admin' : 'Staff'}</span>`;
          const tdDev = document.createElement('td');
          tdDev.textContent = `${(u.devices || []).filter(d => !d.is_revoked).length} active`;
          const tdStatus = document.createElement('td');
          tdStatus.innerHTML = `<span class="status ${u.disabled ? 'status--off' : 'status--active'}"><span class="pulse"></span>${u.disabled ? 'Disabled' : 'Active'}</span>`;
          tr.dataset.href = `person.html?id=${u.id}`; tr.style.cursor = 'pointer';     // whole row opens the employee page (Edit lives there)
          tr.append(tdName, tdEmail, tdRole, tdDev, tdStatus);
          tbody.appendChild(tr);
        });
        $('emp-count').textContent = all.length ? `Showing ${start + 1}–${start + rows.length} of ${all.length}` : '';
        $('emp-page').textContent = `Page ${empState.page} of ${pages}`;
        $('emp-prev').disabled = empState.page <= 1; $('emp-next').disabled = empState.page >= pages;
        document.querySelectorAll('#panel-employees th[aria-sort]').forEach(th => {
          const on = th.querySelector('.th-sort').dataset.sort === empState.sortKey;
          th.setAttribute('aria-sort', on ? (empState.dir > 0 ? 'ascending' : 'descending') : 'none');
        });
        refreshIcons();
      }
      const refilter = () => { empState.page = 1; renderEmployees(); };
      $('emp-search').addEventListener('input', e => { empState.q = e.target.value; refilter(); });
      $('emp-role').addEventListener('change', e => { empState.role = e.target.value; refilter(); });
      $('emp-status').addEventListener('change', e => { empState.status = e.target.value; refilter(); });
      $('emp-size').addEventListener('change', e => { empState.size = Number(e.target.value); refilter(); });
      document.querySelectorAll('.th-sort').forEach(b => b.addEventListener('click', () => {
        empState.dir = empState.sortKey === b.dataset.sort ? -empState.dir : 1; empState.sortKey = b.dataset.sort; refilter();
      }));
      $('emp-prev').addEventListener('click', () => { empState.page--; renderEmployees(); });
      $('emp-next').addEventListener('click', () => { empState.page++; renderEmployees(); });
      $('users-tbody').addEventListener('click', e => {
        const row = e.target.closest('tr[data-href]');
        if (row && !e.target.closest('a')) location.href = row.dataset.href;
      });

      /* ---------------- Leave approvals ---------------- */
      let filter = 'pending';
      const lf = { employee: '', from: '', to: '' };      // only ever set when FEATURES.leaveFilters is on
      const lfMatch = r => (!lf.employee || String(r.user_id) === lf.employee) && (!lf.from || r.end_date >= lf.from) && (!lf.to || r.start_date <= lf.to);
      const label = { pending: 'Pending', denied: 'Denied', approved: 'Approved', cancelled: 'Cancelled' };
      function renderLeave() {
        const rows = dbData.leaveRequests.filter(r => (filter === 'all' || r.status === 'PENDING') && lfMatch(r))
          .sort((a, b) => b.created_at.localeCompare(a.created_at));
        $('leave-tbody').innerHTML = rows.length ? rows.map(r => {
          const k = kind(r.status), own = r.user_id === me.id;
          const actions = k !== 'pending' ? '' : own ? '<span class="form-hint">Your own request</span>'
            : `<div class="btn-row">
                <button type="button" class="btn btn-sm btn-primary" style="margin-top:0;width:auto;" data-act="approve" data-id="${r.id}"><i data-lucide="check"></i> Approve</button>
                <button type="button" class="btn btn-sm btn-red" data-act="deny" data-id="${r.id}"><i data-lucide="x"></i> Deny</button></div>`;
          return `<tr><td>${esc(fullName(getUserById(r.user_id)))}</td><td>${esc(cap(r.leave_type))}</td>
            <td>${fmtDate(r.start_date)} &rarr; ${fmtDate(r.end_date)}</td><td>${r.days_requested}</td>
            <td style="white-space:normal;min-width:10rem;">${esc(r.reason || '')}${k === 'denied' && r.approver_comment ? `<div class="form-hint">Denied: ${esc(r.approver_comment)}</div>` : ''}</td>
            <td><span class="status status--${k}">${label[k]}</span></td><td>${actions}</td></tr>`;
        }).join('') : `<tr><td colspan="7"><div class="empty-state"><i data-lucide="inbox"></i><span>${filter === 'pending' ? 'No pending requests.' : 'No requests yet.'}</span></div></td></tr>`;
        refreshIcons();
      }
      $('leave-tbody').addEventListener('click', async e => {
        const btn = e.target.closest('button[data-act]'); if (!btn) return;
        const r = dbData.leaveRequests.find(x => x.id === Number(btn.dataset.id));
        const approve = btn.dataset.act === 'approve';
        const comment = approve ? '' : await promptDialog({ title: 'Deny this request?', message: 'You can add a reason for the employee.', label: 'Reason (optional)', confirmText: 'Deny', danger: true });
        if (comment === null) return;
        decideLeave(r.id, approve ? 'APPROVED' : 'DENIED', comment || null); // also refreshes header + tab badges
        showFlash(`${approve ? 'Approved' : 'Denied'} ${fullName(getUserById(r.user_id))}'s request.`, approve ? 'success' : 'info');
        renderLeave(); if (cal) cal.refetchEvents();
      });
      document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
        filter = b.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach(x => { x.classList.toggle('btn-primary', x === b); x.classList.toggle('btn-outline', x !== b); });
        renderLeave();
      }));

      if (FEATURES.leaveFilters) {                         // switch on in config.js: employee + date-range filters on the Leave tab
        $('leave-filters').hidden = false;
        users.forEach(u => $('lf-employee').add(new Option(fullName(u), u.id)));
        const apply = () => { lf.employee = $('lf-employee').value; lf.from = $('lf-from').value; lf.to = $('lf-to').value; renderLeave(); };
        ['lf-employee', 'lf-from', 'lf-to'].forEach(id => $(id).addEventListener('change', apply));
        $('lf-clear').addEventListener('click', () => { ['lf-employee', 'lf-from', 'lf-to'].forEach(id => { $(id).value = ''; }); apply(); });
      }

      /* ---------------- Leave calendar ---------------- */
      const palette = ['#0099e6', '#7c3aed', '#d97706', '#059669', '#dc2626', '#db2777', '#0f766e', '#4f46e5'];
      const colorOf = id => palette[(id - 1) % palette.length];
      const addDay = s => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); }; // FullCalendar end is exclusive
      users.forEach(u => $('cal-employee').add(new Option(fullName(u), u.id)));
      $('cal-legend').innerHTML = users.map(u => `<span class="legend-item"><i style="background:${colorOf(u.id)}"></i>${esc(fullName(u))}</span>`).join('')
        + '<span class="legend-item"><i style="background:#64748b"></i>Approved (solid)</span><span class="legend-item"><i class="dashed"></i>Pending (dashed)</span>';

      const events = () => dbData.leaveRequests
        .filter(r => !['denied', 'cancelled'].includes(kind(r.status)) && ($('cal-pending').checked || kind(r.status) === 'approved')
          && (!$('cal-employee').value || String(r.user_id) === $('cal-employee').value))
        .map(r => ({ id: r.id, title: `${fullName(getUserById(r.user_id))} · ${cap(r.leave_type)}`, start: r.start_date, end: addDay(r.end_date), allDay: true,
          backgroundColor: colorOf(r.user_id), borderColor: colorOf(r.user_id), classNames: kind(r.status) === 'pending' ? ['fc-pending'] : [], extendedProps: { r } }));

      const modal = $('leave-modal');
      let lastFocus = null;
      function openLeave(r) {
        const k = kind(r.status), u = getUserById(r.user_id);
        const row = (l, v) => `<div class="detail-item"><div><p class="label">${l}</p><p class="value">${v}</p></div></div>`;
        $('lm-title').textContent = fullName(u);
        $('lm-sub').textContent = `${cap(r.leave_type)} leave`;
        $('lm-status').innerHTML = `<span class="status status--${k}">${label[k]}</span>`;
        $('lm-body').innerHTML =
          row('Dates', `${fmtDate(r.start_date)} &rarr; ${fmtDate(r.end_date)}`) +
          row('Duration', `${r.days_requested} day${r.days_requested > 1 ? 's' : ''}`) +
          (r.reason ? row('Reason', esc(r.reason)) : '') +
          (k === 'denied' && r.approver_comment ? row('Decision note', esc(r.approver_comment)) : '');
        lastFocus = document.activeElement;
        modal.classList.remove('hidden'); setInertExcept(modal, true);
        document.body.style.overflow = 'hidden';
        $('lm-close').focus();
      }
      function closeLeave() {
        modal.classList.add('hidden'); setInertExcept(modal, false);
        document.body.style.overflow = '';
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }
      $('lm-close').addEventListener('click', closeLeave);
      modal.addEventListener('click', e => { if (e.target === modal) closeLeave(); });
      modal.addEventListener('keydown', e => trapFocus(modal, e));
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeLeave(); });

      let cal;
      function renderCalendar() {
        if (typeof FullCalendar === 'undefined') {
          $('calendar').innerHTML = '<div class="callout callout--warning" role="alert"><i data-lucide="triangle-alert"></i><div><strong>The calendar could not be loaded.</strong> Check your connection and <button type="button" class="btn btn-sm btn-outline" data-reload>try again</button></div></div>';
          return refreshIcons();
        }
        if (cal) return cal.updateSize();
        const today = new Date().toISOString().slice(0, 10);
        const next = dbData.leaveRequests.map(r => r.start_date).filter(d => d >= today).sort()[0];
        cal = new FullCalendar.Calendar($('calendar'), {
          locale: getLang(), firstDay: 1,
          initialView: window.innerWidth < 640 ? 'listMonth' : 'dayGridMonth',
          initialDate: next || today,
          headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,listMonth' },
          height: 'auto', dayMaxEvents: 3,
          events: (info, ok) => ok(events()),
          eventClick: ({ event }) => openLeave(event.extendedProps.r),
        });
        cal.render();
      }
      $('cal-employee').addEventListener('change', () => cal && cal.refetchEvents());
      $('cal-pending').addEventListener('change', () => cal && cal.refetchEvents());

      /* ---------------- Departments: rows open the department page (edit / delete live there); only "Add" is here ---------------- */
      const deptById = id => dbData.departments.find(d => d.id === id);
      function renderDepartments() {
        const active = id => users.filter(u => !u.disabled && u.profile?.department_id === id).length;
        $('dept-tbody').innerHTML = dbData.departments.map(d => {
          const m = getUserById(d.manager_id), direct = active(d.id), total = direct + [...descendantIds(d.id)].reduce((sum, c) => sum + active(c), 0);
          return `<tr data-href="admin_department.html?id=${d.id}" style="cursor:pointer;">
            <td><a href="admin_department.html?id=${d.id}">${esc(d.name)}</a></td><td style="white-space:normal;min-width:10rem;">${esc(d.description || '')}</td>
            <td>${d.parent_id && deptById(d.parent_id) ? esc(deptById(d.parent_id).name) : '—'}</td><td>${m ? esc(fullName(m)) : '—'}</td>
            <td>${total}${total !== direct ? ` <span class="form-hint" style="display:inline;margin:0;">(${direct} direct)</span>` : ''}</td></tr>`;
        }).join('');
      }
      $('d-add').addEventListener('click', async () => { if (await departmentDialog()) renderDepartments(); $('d-add').focus(); });
      $('dept-tbody').addEventListener('click', e => {
        const row = e.target.closest('tr[data-href]');
        if (row && !e.target.closest('a')) location.href = row.dataset.href;
      });

      /* ---------------- Tabs (#employees | #leave | #calendar) ---------------- */
      const names = ['employees', 'leave', 'calendar', 'departments'];
      const tabEls = () => [...document.querySelectorAll('.tab')];
      function show(name, focus = false) {
        if (!names.includes(name)) name = 'employees';
        names.forEach(n => { $('panel-' + n).hidden = n !== name; });
        tabEls().forEach(tb => { const on = tb.dataset.tab === name; tb.setAttribute('aria-selected', String(on)); tb.tabIndex = on ? 0 : -1; if (on && focus) tb.focus(); });
        if (name === 'calendar') renderCalendar();
        if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
      }
      tabEls().forEach(tb => tb.addEventListener('click', () => show(tb.dataset.tab)));
      $('admin-tabs').addEventListener('keydown', e => {           // roving tabindex + arrow keys
        const tabs = tabEls(), i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        const to = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault(); show(tabs[to].dataset.tab, true);
      });
      window.addEventListener('hashchange', () => show(location.hash.slice(1)));

      renderEmployees(); renderLeave(); renderDepartments();
      show(location.hash.slice(1));
      refreshIcons();
    });
  
