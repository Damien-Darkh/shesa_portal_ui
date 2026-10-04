// Page script for index.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { requireAdmin, renderAvatar, showFlash, getIdParam, refreshIcons, getUnreadCount, markNotificationsRead, confirmDialog, fmtDate, esc, myNotifications, fmtRelative, t } from '../layout.js';
    document.addEventListener('DOMContentLoaded', () => {

      // Permission & Header Control
      const user = dbData.currentUser;

      // Welcome Header
      document.getElementById('welcome-title').textContent = `Welcome back, ${user.first_name}`;

      // Render Profile Data
      document.getElementById('profile-fullname').textContent = `${user.first_name} ${user.last_name}`;
      document.getElementById('profile-job').textContent = user.profile.job_title;
      document.getElementById('profile-id').textContent = `User ID: ${user.id}`;
      document.getElementById('profile-role-badge').textContent = user.is_admin ? 'ADMIN' : 'STAFF';

      document.getElementById('p-email').textContent = user.email;
      document.getElementById('p-phone').textContent = user.profile.phone;
      document.getElementById('p-office').textContent = user.profile.office_location;
      document.getElementById('p-start').textContent = fmtDate(user.profile.start_date);
      document.getElementById('p-bio').textContent = user.profile.bio;

      // Avatar Logic
renderAvatar(document.querySelector('.avatar-box'), {
  photoUrl: user.profile.photo_url,
  firstName: user.first_name,
  lastName: user.last_name,
});

      // Attendance state
      const latestAttendance = dbData.timeAttendance[0];
      const isClockedIn = latestAttendance && !latestAttendance.clock_out;
      const clockBtnText = document.getElementById('clock-btn-text');
      const timeSub = document.getElementById('time-status-sub');

/*      if (isClockedIn) {
        clockBtnText.textContent = 'Clock Out';
        timeSub.textContent = `Clocked in since ${new Date(latestAttendance.clock_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      } else {
        clockBtnText.textContent = 'Clock In';
        timeSub.textContent = 'Currently clocked out.';
      }
*/
/*      document.getElementById('clock-toggle-btn').addEventListener('click', () => {
        if (isClockedIn) {
          latestAttendance.clock_out = new Date().toISOString();
          alert('Clocked out successfully!');
        } else {
          dbData.timeAttendance.unshift({
            id: Date.now(),
            user_id: user.id,
            clock_in: new Date().toISOString(),
            clock_out: null,
            duration_minutes: null,
            notes: 'Clocked in via Web UI'
          });
          alert('Clocked in successfully!');
        }
        location.reload();
      });
*/
      // Render Leave Balances
/*      const balancesGrid = document.getElementById('leave-balances-grid');
      balancesGrid.innerHTML = dbData.leaveBalances.map(b => {
        const remaining = b.accrued_days + b.carryover_days - b.used_days - b.pending_days;
        return `
          <div class="card">
            <p class="label">${b.leave_type.toUpperCase()} LEAVE</p>
            <h2 class="profile-name" style="margin-top:0.25rem;">${remaining} Days Left</h2>
            <p class="card-subtitle">accrued: ${b.accrued_days}d | Used: ${b.used_days}d | Pending: ${b.pending_days}d</p>
          </div>
        `;
      }).join('');
*/
      /* LEAVES + PENDING LEAVE — disabled. Remove this comment wrapper to enable.
      // Total Leave Card Calculation
      const TotalLeaveGrid = document.getElementById('total-leave-grid');
      let totalLeaveUsed = 0;
      dbData.leaveBalances.forEach(b => {
        totalLeaveUsed += b.used_days;
      });

      TotalLeaveGrid.innerHTML = `
        <p class="label">LEAVES</p>
        <h2 class="profile-name" style="margin-top:0.25rem;">
            ${totalLeaveUsed} Days Used
        </h2>
        <a href="calander.html" class="btn btn-outline">
            <i data-lucide="calendar-days"></i>
            Apply Leave
        </a>
      `;

      // Pending leave requests - only the current user's own requests
      const pendingList = document.getElementById('pending-leave-list');
      const userLeaves = dbData.leaveRequests.filter(r => r.user_id === user.id && r.status === 'PENDING');
      if (userLeaves.length === 0) {
        pendingList.innerHTML = `<p class="card-subtitle">No pending leave requests.</p>`;
      } else {
        pendingList.innerHTML = userLeaves.map(r => `
          <div class="detail-item" style="justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            <div>
              <p class="value">${r.leave_type.toUpperCase()} (${r.days_requested} days)</p>
              <p class="label">${r.start_date} to ${r.end_date}</p>
            </div>
            <span class="user-id-badge" style="margin-top:0;">${r.status}</span>
          </div>
        `).join('');
      }

      */
      // Notifications: the current user's, newest first. Items are marked read when the card has been on screen for 2s, or when opened.
      // Flask: POST /notifications/read from the same triggers.
      const notifList = document.getElementById('notifications-list');
      const countBadge = document.getElementById('unread-count');
      let showAll = false, seen = null;
      const localDates = text => text.replace(/\d{4}-\d{2}-\d{2}/g, fmtDate);
      function renderNotifications() {
        const all = myNotifications(), shown = showAll ? all : all.slice(0, 5);
        notifList.innerHTML = all.length ? shown.map(n => `
          <a class="notif-item" href="${esc(n.link || '#')}" data-nid="${n.id}">
            <p class="value">${esc(localDates(t(n.title)))}${n.is_read ? '' : ' <span class="badge badge-inline">New</span>'}</p>
            <p class="card-subtitle">${esc(localDates(t(n.message)))}</p>
            <p class="form-hint"><time datetime="${esc(n.sent_at)}">${esc(fmtRelative(n.sent_at))}</time></p>
          </a>`).join('') + (all.length > 5 ? `<button type="button" class="btn btn-outline btn-sm" id="notif-more">${showAll ? 'Show less' : `Show all (${all.length})`}</button>` : '')
          : '<p class="card-subtitle">No notifications.</p>';
        const unread = getUnreadCount();
        countBadge.textContent = unread; countBadge.hidden = !unread;
        watch(shown);
      }
      function watch(shown) {                                  // mark the visible ones read after 2s on screen
        if (seen) seen.disconnect();
        const ids = shown.filter(n => !n.is_read).map(n => n.id);
        if (!ids.length) return;
        let timer;
        seen = new IntersectionObserver(([entry]) => {
          clearTimeout(timer);
          if (entry.isIntersecting) timer = setTimeout(() => { markNotificationsRead(ids); renderNotifications(); }, 2000);
        }, { threshold: 0.6 });
        seen.observe(notifList.closest('.card'));
      }
      notifList.addEventListener('click', e => {
        if (e.target.closest('#notif-more')) { showAll = !showAll; renderNotifications(); return; }
        const item = e.target.closest('.notif-item');
        if (!item) return;
        markNotificationsRead([Number(item.dataset.nid)]);       // opening a notification counts as reading it
        if (item.getAttribute('href') === '#') { e.preventDefault(); renderNotifications(); }
      });
      renderNotifications();

      // Render Devices table
      function renderDevices() {
        const tbody = document.getElementById('devices-tbody');
        const devices = user.devices || [];

        if (!devices.length) {
          tbody.replaceChildren();
          const tr = document.createElement('tr');
          const td = document.createElement('td'); td.colSpan = 5;
          td.innerHTML = '<div class="empty-state"><i data-lucide="inbox"></i><span>No devices yet — add one above to get connected.</span></div>';
          tr.appendChild(td); tbody.appendChild(tr);
          refreshIcons();
          return;
        }

        tbody.replaceChildren();
        devices.forEach(d => {
          const tr = document.createElement('tr');

          const tdName = document.createElement('td'); tdName.textContent = d.device_name;
          const tdAddr = document.createElement('td'); tdAddr.className = 'mono'; tdAddr.textContent = d.wg_address;
          const tdDate = document.createElement('td'); tdDate.textContent = fmtDate(d.created_at);

          const tdStatus = document.createElement('td');
          const pill = document.createElement('span');
          pill.className = 'status ' + (d.is_revoked ? 'status--off' : 'status--active');
          pill.append(
            Object.assign(document.createElement('span'), { className: 'pulse' }),
            document.createTextNode(d.is_revoked ? 'Disconnected' : 'Active')
          );
          tdStatus.appendChild(pill);

          const tdActions = document.createElement('td');
          const actions = document.createElement('div'); actions.className = 'btn-row';

          if (!d.is_revoked) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-red btn-sm'; btn.type = 'button';
            btn.innerHTML = '<i data-lucide="power"></i> Disconnect';
            btn.addEventListener('click', async () => {
              if (!await confirmDialog({ title: 'Disconnect device?', message: `Disconnect ${d.device_name}? This device will lose VPN access immediately.`, confirmText: 'Disconnect', danger: true })) return;
              d.is_revoked = true; d.revoked_at = new Date().toISOString();
              renderDevices();
              showFlash(`'${d.device_name}' has been disconnected.`, 'success');
            });
            actions.appendChild(btn);
          } else if (!d.auto_revoked) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline btn-sm'; btn.type = 'button';
            btn.innerHTML = '<i data-lucide="refresh-ccw"></i> Reconnect';
            btn.addEventListener('click', () => {
              d.is_revoked = false; d.revoked_at = null;
              renderDevices();
              showFlash(`'${d.device_name}' has been reconnected.`, 'success');
            });
            actions.appendChild(btn);
          }

          if (d.launcher_available) {
            const a = document.createElement('a');
            a.href = `launcher.cmd?id=${d.id}`; // Flask: url_for('device_launcher_cmd', device_id=d.id)
            a.setAttribute('download', 'Connect Company Network.cmd');
            a.className = 'btn btn-outline btn-sm';
            a.innerHTML = '<i data-lucide="download"></i> Windows setup file';
            actions.appendChild(a);
          }

          tdActions.appendChild(actions);
          tr.append(tdName, tdAddr, tdDate, tdStatus, tdActions);
          tbody.appendChild(tr);
        });
        refreshIcons();
      }
      renderDevices();

      // Initialize all icons at the end
      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  
