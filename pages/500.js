// Page script for 500.html (moved out of the HTML so the site can run with a strict Content-Security-Policy).
    // Prototype only: fake reference. In Flask, generate it in the errorhandler and log it with the traceback.
    document.getElementById('ref-code').textContent = Date.now().toString(36).toUpperCase();
    document.addEventListener('DOMContentLoaded', () => { if (window.lucide) window.lucide.createIcons(); });
  
    import { applyTranslations } from '../i18n.js';
    applyTranslations();
  

document.getElementById('retry')?.addEventListener('click', () => location.reload());
