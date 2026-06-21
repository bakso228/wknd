// Loyalocal line-icon set — rounded 2px stroke, round caps, 24px grid,
// drawn in currentColor. Pass `name`, optional `size` (px) and `sw` (stroke).
const PATHS = {
  // navigation
  house:    <><path d="M3 11.4 12 4l9 7.4M5 9.8V20h14V9.8" /><path d="M9.5 20v-5.5h5V20" /></>,
  search:   <><circle cx="11" cy="11" r="7.3" /><path d="m20 20-3.4-3.4" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
  checkCircle: <><circle cx="12" cy="12" r="8.3" /><path d="m8.3 12 2.6 2.6 4.8-5.2" /></>,
  // glyphs
  users:    <><circle cx="9" cy="9" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 6.5a3 3 0 0 1 0 5.5M17 14c2.5.4 4 2.3 4 5" /></>,
  plus:     <path d="M12 5v14M5 12h14" />,
  close:    <path d="M6 6l12 12M18 6 6 18" />,
  pin:      <><path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" /><circle cx="12" cy="11" r="2.2" /></>,
  clock:    <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2.5" /></>,
  spark:    <path d="M12 3l2.2 6.3L20 12l-5.8 2.7L12 21l-2.2-6.3L4 12l5.8-2.7Z" />,
  check:    <path d="M4 12.5 10 18 20 6" />,
  chevronLeft:  <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  edit:     <><path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2 4 20Z" /><path d="M14 7l3 3" /></>,
};

export default function Icon({ name, size = 20, sw = 2, className = '', style, ...rest }) {
  const fillCheck = name === 'check';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={fillCheck ? 3 : sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name] || null}
    </svg>
  );
}
