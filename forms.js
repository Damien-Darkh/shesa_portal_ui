// forms.js - form behaviour shared by every page. No side effects on import, so standalone pages can use it too.
//   guardedSubmit()      - double-submit protection + a busy state on the submit button
//   localizeValidation() - validation bubbles in the app language (Italian by default) instead of the browser's
// Flask: keep both. With real POST forms the busy state simply lasts until the browser navigates.

import { t, fmtDate } from './i18n.js';

/**
 * Runs a submit handler one at a time. While it runs the submit button is disabled, shows a spinner and
 * "Saving…", and extra submits are ignored. The handler returns `false` when validation failed (the button is
 * re-enabled at once); anything else counts as success and the busy state is kept for `minBusyMs` (the page
 * normally navigates away or closes the form by then).
 */
export function guardedSubmit(form, handler, { minBusyMs = 600 } = {}) {
  let busy = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    busy = true;
    const btn = form.querySelector('button[type="submit"]');
    const original = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Saving…'; }
    let ok = false;
    try { ok = (await handler(e)) !== false; }
    finally {
      const done = () => {
        busy = false;
        if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.innerHTML = original; globalThis.lucide?.createIcons?.(); }
      };
      if (ok) setTimeout(done, minBusyMs); else done();
    }
  });
}

/** The text of the first constraint a field fails, in the app language. */
export function validationText(el) {
  const v = el.validity, type = (el.type || '').toLowerCase();
  if (v.valueMissing) return t(el.tagName === 'SELECT' ? 'Select an option.' : type === 'checkbox' ? 'Tick this box to continue.' : 'Fill in this field.');
  if (v.typeMismatch) return t(type === 'email' ? 'Enter a valid email address.' : type === 'url' ? 'Enter a valid web address.' : 'Enter a valid value.');
  if (v.tooShort) return t(`Use at least ${el.minLength} characters.`);
  if (v.tooLong) return t(`Use at most ${el.maxLength} characters.`);
  if (v.patternMismatch) return el.title ? t(el.title) : t('The value doesn\'t match the required format.');
  if (v.rangeUnderflow) return t(`Choose a date on or after ${type === 'date' ? fmtDate(el.min) : el.min}.`);
  if (v.rangeOverflow) return t(`Choose a date on or before ${type === 'date' ? fmtDate(el.max) : el.max}.`);
  if (v.badInput) return t(type === 'date' ? 'Choose a valid date.' : 'Enter a valid value.');
  return el.validationMessage;
}

/** Replaces the browser's native validation text on every field (call again after adding fields dynamically). */
export function localizeValidation(root = document) {
  root.querySelectorAll('input, select, textarea').forEach(el => {
    if (el.__localized) return;
    el.__localized = true;
    el.addEventListener('invalid', () => el.setCustomValidity(validationText(el)));
    const clear = () => el.setCustomValidity('');
    el.addEventListener('input', clear);
    el.addEventListener('change', clear);
  });
}
