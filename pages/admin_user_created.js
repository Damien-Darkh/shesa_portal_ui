// Page script for admin_user_created.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { requireAdmin, renderAvatar, showFlash, getIdParam } from '../layout.js';

    document.addEventListener('DOMContentLoaded', () => {
      // Access Control: Redirect if not admin
      if (!dbData.currentUser || !dbData.currentUser.is_admin) {
        window.location.href = 'index.html';
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const userId = parseInt(urlParams.get('id')) || dbData.usersDirectory[dbData.usersDirectory.length - 1].id;
      const user = dbData.usersDirectory.find(u => u.id === userId);

      if (user) {
        document.getElementById('created-subtext').textContent = `Account created for ${user.email}.`;
        document.getElementById('dsm-user').textContent = user.dsm_username;
        document.getElementById('temp-pw').textContent = `TmpPass#${Math.floor(100000 + Math.random() * 900000)}`;
      }

      document.getElementById('copy-pw-btn').addEventListener('click', () => {
        const pw = document.getElementById('temp-pw').textContent;
        navigator.clipboard.writeText(pw);
        document.getElementById('copy-pw-text').textContent = 'Copied!';
        setTimeout(() => { document.getElementById('copy-pw-text').textContent = 'Copy Temporary Password'; }, 2000);
      });

      if (window.lucide) window.lucide.createIcons();
    });
  
