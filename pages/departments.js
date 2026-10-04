// Page script for departments.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { getIdParam, esc, initials, refreshIcons } from '../layout.js';

    const id = getIdParam();
    const depts = dbData.departments;
    const list = id ? depts.filter(d => d.id === id) : depts;
    const members = d => dbData.usersDirectory.filter(u => !u.disabled && u.profile.department_id === d.id);

    if (id && list[0]) {
      document.getElementById('dept-title').textContent = list[0].name;
      document.getElementById('back').hidden = false;
    }

    document.getElementById('dept-grid').innerHTML = list.length ? list.map(d => `
      <section class="card space-y">
        <h3 class="card-title"><a href="departments.html?id=${d.id}">${esc(d.name)}</a></h3>
        <p class="card-subtitle">${esc(d.description)}</p>
        ${members(d).map(u => `
          <div class="detail-item">
            <div class="avatar-box avatar-sm">${esc(initials(u.first_name, u.last_name))}</div>
            <div><p class="value" style="margin-top:0;">${esc(u.first_name)} ${esc(u.last_name)}</p>
            <p class="label">${esc(u.profile.job_title)}</p></div>
          </div>`).join('') || '<p class="card-subtitle">No members yet.</p>'}
      </section>`).join('')
      : '<p class="card-subtitle">Department not found.</p>';

    refreshIcons();
  
