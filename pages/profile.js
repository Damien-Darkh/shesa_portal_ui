// Page script for profile.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import '../layout.js';
    import { showFlash, getLang, setLang } from '../layout.js';

    document.addEventListener('DOMContentLoaded', () => {
      const user = dbData.currentUser;

      // Saved per user. Flask: PATCH /account/language -> User.language ('it' default).
      const langSel = document.getElementById('lang-select');
      langSel.value = getLang();
      langSel.addEventListener('change', () => { setLang(langSel.value); location.reload(); });

      document.getElementById('p-email').value = user.email;
      document.getElementById('p-firstname').value = user.first_name || '';
      document.getElementById('p-lastname').value = user.last_name || '';

      const p = user.profile || {};
      document.getElementById('p-job').value = p.job_title || '';
      document.getElementById('p-phone').value = p.phone || '';
      document.getElementById('p-office').value = p.office_location || '';
      document.querySelectorAll('#profile-form input').forEach(i => { i.disabled = true; i.classList.add('readonly'); });

      if (user.dsm_username) {
        document.getElementById('nas-section').hidden = false;
        document.getElementById('nas-username').textContent = user.dsm_username;
      } else {
        document.getElementById('no-nas-section').hidden = false;
      }

      document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        user.first_name = document.getElementById('p-firstname').value.trim();
        user.last_name = document.getElementById('p-lastname').value.trim();
        showFlash('Profile updated.', 'success');
      });

      if (window.lucide) window.lucide.createIcons();
    });
  
