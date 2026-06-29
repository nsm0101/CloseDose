/* Lightweight Lucide-style icons used in the kit */
function Icon({ name, size = 22, stroke = 1.75, color = 'currentColor' }) {
  const paths = {
    baby: <><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M5 12a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6Z"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    pill: <><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></>,
    droplet: <path d="M12 22a7 7 0 0 0 7-7c0-2-1-4-3-6l-4-5-4 5c-2 2-3 4-3 6a7 7 0 0 0 7 7Z"/>,
    clock: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2 M12 20v2 M5 5l1.5 1.5 M17.5 17.5 19 19 M2 12h2 M20 12h2 M5 19l1.5-1.5 M17.5 6.5 19 5"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/></>,
    user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    chevronRight: <path d="m9 6 6 6-6 6"/>,
    chevronLeft: <path d="m15 6-6 6 6 6"/>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
    shield: <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/>,
    weight: <><path d="M6.5 6.5h11l1.5 13.5h-14L6.5 6.5Z"/><path d="M9 6.5a3 3 0 0 1 6 0"/></>,
    thermo: <><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></>,
    check: <path d="m5 12 5 5L20 7"/>,
    x: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    arrowRight: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      {paths[name]}
    </svg>
  );
}

window.Icon = Icon;
