// Page script for directory.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { requireAdmin, renderAvatar, showFlash, getIdParam, esc, initials } from '../layout.js';

    document.addEventListener('DOMContentLoaded', () => {
      const searchInput = document.getElementById('search-input');
      const dirGrid = document.getElementById('directory-grid');
      const deptSel = document.getElementById('dept-filter');
      const taskList = document.getElementById('onboarding-list');

      function renderDirectory(query = '') {
        const filtered = dbData.usersDirectory.filter(u => !u.disabled && (!deptSel.value || String(u.profile.department_id) === deptSel.value) && (
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase()) ||
          u.profile.job_title.toLowerCase().includes(query.toLowerCase()))
        );

        document.getElementById('result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'}`;
        dirGrid.innerHTML = !filtered.length ? '<p class="card-subtitle" role="status">No results found.</p>' : filtered.map(u => `
          <a class="detail-item person-card" href="person.html?id=${Number(u.id)}" style="text-decoration:none;color:inherit;padding: 1rem; border: 1px solid var(--border-color); border-radius: 0.75rem;">
            <div class="avatar-box" style="width: 2.5rem; height: 2.5rem; font-size: 1rem;">
              ${esc(initials(u.first_name, u.last_name))}
            </div>
            <div>
              <p class="value">${esc(u.first_name)} ${esc(u.last_name)}</p>
              <p class="label">${esc(u.profile.job_title)}</p>
              <p class="form-hint">${esc(u.email)}</p>
            </div>
          </a>
        `).join('');
      }

      function renderOnboarding() {
        if (!taskList) return; // checklist is commented out in the HTML
        taskList.innerHTML = dbData.onboardingTasks.map(t => `
          <div class="detail-item" style="justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            <div>
              <p class="value">${esc(t.title)}</p>
              <p class="card-subtitle">${t.completed ? 'Completed' : 'Pending Sign-off'}</p>
            </div>
            <button class="btn ${t.completed ? 'btn-outline' : 'btn-primary'}" style="margin-top:0;" data-task="${t.id}">
              ${t.completed ? 'Signed Off' : 'Sign Off'}
            </button>
          </div>
        `).join('');
      }

      const toggleTask = (id) => {
        const task = dbData.onboardingTasks.find(t => t.id === id);
        if (task) {
          task.completed = !task.completed;
          renderOnboarding();
        }
      };

      dbData.departments.forEach(d => deptSel.add(new Option(d.name, d.id)));
      deptSel.addEventListener('change', () => renderDirectory(searchInput.value));
      if (taskList) taskList.addEventListener('click', e => { const b = e.target.closest('[data-task]'); if (b) toggleTask(Number(b.dataset.task)); });
      searchInput.addEventListener('input', (e) => renderDirectory(e.target.value));
      searchInput.value = new URLSearchParams(location.search).get('q') || ''; // from the hero search

      renderDirectory(searchInput.value);
      renderOnboarding();
      if (window.lucide) window.lucide.createIcons();
    });
  
