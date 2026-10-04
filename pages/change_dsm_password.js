// Page script for change_dsm_password.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { requireAdmin, renderAvatar, showFlash, getIdParam, alertDialog , guardedSubmit } from '../layout.js';

    document.addEventListener('DOMContentLoaded', () => {
      if (window.lucide) window.lucide.createIcons();

      guardedSubmit(document.getElementById('password-form'), async (e) => {
        e.preventDefault();
        const p1 = document.getElementById('new-pw').value;
        const p2 = document.getElementById('confirm-pw').value;

        if (p1 !== p2) {
          showFlash('Passwords do not match.', 'error');
          return false;
        }

        dbData.currentUser.dsm_must_change_password = false;
        await alertDialog({ title: 'Password updated', message: 'Your NAS password has been updated.' });
        window.location.href = 'index.html';
      });
    });
  
