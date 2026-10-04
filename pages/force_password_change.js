// Page script for force_password_change.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    import { dbData } from '../data.js';
    import { applyTranslations } from '../i18n.js';
    import { ensureCsrfFields } from '../csrf.js';
    import { guardedSubmit, localizeValidation } from '../forms.js';
    applyTranslations();
    ensureCsrfFields();
    localizeValidation();
    const u = dbData.currentUser;
    const $ = id => document.getElementById(id);
    const pw = $('new-pw'), cf = $('confirm-pw');
    const banned = [u.dsm_username, u.first_name, u.last_name].filter(x => x && x.length >= 3).map(x => x.toLowerCase());

    const rules = [
      ['At least 8 characters', v => v.length >= 8],
      ['Upper and lower case letters', v => /[a-z]/.test(v) && /[A-Z]/.test(v)],
      ['At least one number', v => /\d/.test(v)],
      ['Doesn\u2019t contain your name or username', v => v && !banned.some(b => v.toLowerCase().includes(b))],
      ['Both passwords match', v => v && v === cf.value],
    ];

    function check() {
      let all = true;
      $('reqs').replaceChildren(...rules.map(([label, fn]) => {
        const ok = !!fn(pw.value); all = all && ok;
        const li = document.createElement('li');
        li.className = ok ? 'ok' : '';
        li.innerHTML = `<i data-lucide="${ok ? 'circle-check' : 'circle'}"></i>`;
        li.append(label);
        return li;
      }));
      $('submit-btn').disabled = !all;
      window.lucide && window.lucide.createIcons();
    }
    pw.addEventListener('input', check);
    cf.addEventListener('input', check);

    document.querySelectorAll('.pw-toggle').forEach(btn => btn.addEventListener('click', () => {
      const input = $(btn.dataset.target), show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      btn.innerHTML = `<i data-lucide="${show ? 'eye-off' : 'eye'}"></i>`;
      window.lucide && window.lucide.createIcons();
    }));

    guardedSubmit($('pw-form'), e => {
      e.preventDefault();
      if ($('submit-btn').disabled) return false;
      u.dsm_must_change_password = false; // prototype only; Flask POSTs to change_dsm_password
      window.location.href = 'index.html';
    });

    document.addEventListener('DOMContentLoaded', check);
  
