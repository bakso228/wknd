// ============================================================
// Loyalocal style helpers — category emoji-tile gradients and
// calendar dot colors. Returns CSS values (used in inline styles).
// ============================================================

// Category tile gradients (keep the friendly emoji on top).
export const CAT_GRAD = {
  outdoor:  'linear-gradient(135deg,#62B58F,#3F9270)',
  indoor:   'linear-gradient(135deg,#0091DC,#005F92)',
  theater:  'linear-gradient(135deg,#6E5AA6,#4E3F86)',
  food:     'linear-gradient(135deg,#8C6A4F,#5E4633)',
  seasonal: 'linear-gradient(135deg,#FF8A5F,#E8633F)',
  sticky:   'linear-gradient(135deg,#0091DC,#005F92)',
};

export const catGrad = cat => CAT_GRAD[cat] || CAT_GRAD.sticky;

// Calendar / upcoming dot colors by event type.
export const TYPE_DOT_COLOR = {
  plan:     '#0077B6',
  personal: '#0077B6',
  festival: '#FF6B5F',
  holiday:  '#3F9270',
  seasonal: '#62B58F',
  outdoors: '#62B58F',
  food:     '#E8A23F',
  culture:  '#6E5AA6',
  todo:     '#0077B6',
};

export const dotColor = type => TYPE_DOT_COLOR[type] || '#CBD9E3';
