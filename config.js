// config.js - feature switches. Flip a value to activate a feature that is built but switched off.
// Flask: pass the same flags to the templates (e.g. {% if features.leave_filters %}) and to the page script.
export const FEATURES = {
  leaveFilters: false,   // Leave approvals tab: filter by employee and by date range. Switch on when the team grows.
};
