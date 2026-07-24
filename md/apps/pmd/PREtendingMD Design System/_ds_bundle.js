/* @ds-bundle: {"format":3,"namespace":"CloseDoseDesignSystem_019dff","components":[],"sourceHashes":{"preview/tweaks-panel.jsx":"a1107c630a56","ui_kits/app/icon-helper.jsx":"7b3b523edbaa","ui_kits/app/ios-frame.jsx":"d67eb3ffe562","ui_kits/app/screens-helper.jsx":"51bc60b9efdd","ui_kits/web/sections-helper.jsx":"72e0f812d8f0"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CloseDoseDesignSystem_019dff = window.CloseDoseDesignSystem_019dff || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// preview/tweaks-panel.jsx
try { (() => {
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  noDeckControls = false,
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  // Auto-inject a rail toggle when a <deck-stage> is on the page. The
  // toggle drives the deck's per-viewer _railVisible via window message;
  // state is mirrored from the same localStorage key the deck reads so
  // the control reflects reality across reloads. The mechanism is the
  // message — authors who want custom placement can post it directly
  // and pass noDeckControls to suppress this one.
  const hasDeckStage = React.useMemo(() => typeof document !== 'undefined' && !!document.querySelector('deck-stage'), []);
  // Hide the toggle until the host has actually enabled the rail (the
  // __omelette_rail_enabled window message, posted only when the
  // omelette_deck_rail_enabled flag is on for this user). The initial read
  // covers TweaksPanel mounting after the message already arrived; the
  // listener covers the common case of mounting first.
  const [railEnabled, setRailEnabled] = React.useState(() => hasDeckStage && !!document.querySelector('deck-stage')?._railEnabled);
  React.useEffect(() => {
    if (!hasDeckStage || railEnabled) return undefined;
    const onMsg = e => {
      if (e.data && e.data.type === '__omelette_rail_enabled') setRailEnabled(true);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [hasDeckStage, railEnabled]);
  const [railVisible, setRailVisible] = React.useState(() => {
    try {
      return localStorage.getItem('deck-stage.railVisible') !== '0';
    } catch (e) {
      return true;
    }
  });
  const toggleRail = on => {
    setRailVisible(on);
    window.postMessage({
      type: '__deck_rail_visible',
      on
    }, '*');
  };
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-noncommentable": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children, hasDeckStage && railEnabled && !noDeckControls && /*#__PURE__*/React.createElement(TweakSection, {
    label: "Deck"
  }, /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Thumbnail rail",
    value: railVisible,
    onChange: toggleRail
  })))));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "preview/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/icon-helper.jsx
try { (() => {
/* Lightweight Lucide-style icons used in the kit */
function Icon({
  name,
  size = 22,
  stroke = 1.75,
  color = 'currentColor'
}) {
  const paths = {
    baby: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M9 12h.01"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M15 12h.01"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 12a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M8 10V7a4 4 0 0 1 8 0v3"
    })),
    pill: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m8.5 8.5 7 7"
    })),
    droplet: /*#__PURE__*/React.createElement("path", {
      d: "M12 22a7 7 0 0 0 7-7c0-2-1-4-3-6l-4-5-4 5c-2 2-3 4-3 6a7 7 0 0 0 7 7Z"
    }),
    clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 6v6l4 2"
    })),
    moon: /*#__PURE__*/React.createElement("path", {
      d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
    }),
    sun: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 2v2 M12 20v2 M5 5l1.5 1.5 M17.5 17.5 19 19 M2 12h2 M20 12h2 M5 19l1.5-1.5 M17.5 6.5 19 5"
    })),
    bell: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10.3 21a1.94 1.94 0 0 0 3.4 0"
    })),
    home: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "m3 11 9-8 9 8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"
    })),
    user: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "7",
      r: "4"
    })),
    history: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 12a9 9 0 1 0 3-6.7L3 8"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M3 3v5h5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 7v5l3 2"
    })),
    plus: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 5v14"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5 12h14"
    })),
    chevronRight: /*#__PURE__*/React.createElement("path", {
      d: "m9 6 6 6-6 6"
    }),
    chevronLeft: /*#__PURE__*/React.createElement("path", {
      d: "m15 6-6 6 6 6"
    }),
    search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "7"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m20 20-3.5-3.5"
    })),
    info: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "10"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 16v-4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 8h.01"
    })),
    shield: /*#__PURE__*/React.createElement("path", {
      d: "M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"
    }),
    weight: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M6.5 6.5h11l1.5 13.5h-14L6.5 6.5Z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 6.5a3 3 0 0 1 6 0"
    })),
    thermo: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"
    })),
    check: /*#__PURE__*/React.createElement("path", {
      d: "m5 12 5 5L20 7"
    }),
    x: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M18 6 6 18"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m6 6 12 12"
    })),
    arrowRight: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M5 12h14"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m13 6 6 6-6 6"
    })),
    settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
    }))
  };
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0
    }
  }, paths[name]);
}
window.Icon = Icon;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/icon-helper.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ios-frame.jsx
try { (() => {
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports: IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ios-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/screens-helper.jsx
try { (() => {
/* CloseDose app screens — built as small components */

const {
  useState
} = React;

/* ---------- Reusable bits ---------- */

function TopBar({
  title,
  onBack,
  right,
  theme,
  toggleTheme
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px 8px',
      gap: 8,
      position: 'sticky',
      top: 0,
      zIndex: 5,
      background: theme === 'dark' ? 'rgba(11,23,23,0.85)' : 'rgba(251,248,242,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minWidth: 36
    }
  }, onBack ? /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'transparent',
      border: 'none',
      padding: 6,
      cursor: 'pointer',
      color: 'var(--fg)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronLeft",
    size: 22
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "title",
    style: {
      fontSize: 17,
      fontFamily: 'var(--font-sans)',
      fontWeight: 600
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      minWidth: 36,
      justifyContent: 'flex-end'
    }
  }, toggleTheme && /*#__PURE__*/React.createElement("button", {
    onClick: toggleTheme,
    "aria-label": "toggle theme",
    style: {
      background: 'transparent',
      border: 'none',
      padding: 6,
      cursor: 'pointer',
      color: 'var(--fg-2)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === 'dark' ? 'sun' : 'moon',
    size: 20
  })), right));
}
function TabBar({
  tab,
  setTab,
  theme
}) {
  const tabs = [{
    id: 'home',
    label: 'Home',
    icon: 'home'
  }, {
    id: 'history',
    label: 'History',
    icon: 'history'
  }, {
    id: 'kids',
    label: 'Kids',
    icon: 'baby'
  }, {
    id: 'profile',
    label: 'You',
    icon: 'user'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      bottom: 0,
      zIndex: 5,
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      padding: '8px 12px 22px',
      gap: 4,
      background: theme === 'dark' ? 'rgba(11,23,23,0.92)' : 'rgba(251,248,242,0.92)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--hairline)'
    }
  }, tabs.map(t => {
    const active = tab === t.id;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => setTab(t.id),
      style: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        padding: '8px 4px',
        color: active ? 'var(--brand)' : 'var(--fg-3)',
        fontSize: 11,
        fontWeight: 600
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.icon,
      size: 22,
      stroke: active ? 2 : 1.75
    }), /*#__PURE__*/React.createElement("span", null, t.label));
  }));
}
function KidPill({
  kid,
  active,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: active ? 'var(--bg-tint)' : 'var(--bg-card)',
      border: `1px solid ${active ? 'rgba(14,140,140,0.3)' : 'var(--border)'}`,
      borderRadius: 999,
      padding: '6px 10px 6px 6px',
      cursor: 'pointer',
      flexShrink: 0,
      transition: 'all 200ms cubic-bezier(0.2,0,0,1)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: kid.color,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontSize: 13,
      fontWeight: 600
    }
  }, kid.name[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg)',
      lineHeight: 1.1
    }
  }, kid.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--fg-3)',
      lineHeight: 1.1
    }
  }, kid.age, "y \xB7 ", kid.weight, " lb")));
}
function MedCard({
  med,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      background: 'var(--bg-card)',
      border: '1px solid var(--hairline)',
      borderRadius: 16,
      padding: '18px',
      boxShadow: 'var(--shadow-1)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'all 200ms cubic-bezier(0.2,0,0,1)'
    },
    onMouseEnter: e => e.currentTarget.style.transform = 'translateY(-2px)',
    onMouseLeave: e => e.currentTarget.style.transform = 'translateY(0)'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 12,
      background: med.tint,
      color: med.iconColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: med.icon,
    size: 24,
    stroke: 2
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 18,
      fontWeight: 600,
      color: 'var(--fg)',
      letterSpacing: '-0.01em',
      lineHeight: 1.2
    }
  }, med.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--fg-2)',
      marginTop: 2
    }
  }, med.generic, " \xB7 ", med.purpose)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 20,
    color: "var(--fg-3)"
  }));
}

/* ---------- HOME ---------- */
function HomeScreen({
  onPickMed,
  kids,
  activeKid,
  setActiveKid,
  theme,
  toggleTheme
}) {
  const meds = [{
    id: 'tylenol',
    name: "Children's Tylenol",
    generic: 'Acetaminophen',
    purpose: 'fever, pain',
    icon: 'thermo',
    tint: 'var(--mint-100)',
    iconColor: 'var(--teal-700)'
  }, {
    id: 'motrin',
    name: "Children's Motrin",
    generic: 'Ibuprofen',
    purpose: 'fever, pain',
    icon: 'pill',
    tint: 'var(--amber-100)',
    iconColor: 'var(--amber-700)'
  }, {
    id: 'benadryl',
    name: "Children's Benadryl",
    generic: 'Diphenhydramine',
    purpose: 'allergies',
    icon: 'droplet',
    tint: 'rgba(159,217,205,0.4)',
    iconColor: 'var(--teal-700)'
  }, {
    id: 'zyrtec',
    name: "Children's Zyrtec",
    generic: 'Cetirizine',
    purpose: 'allergies',
    icon: 'droplet',
    tint: 'rgba(221,241,230,0.7)',
    iconColor: 'var(--sage-700)'
  }];
  const kid = kids.find(k => k.id === activeKid);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "closedose",
    theme: theme,
    toggleTheme: toggleTheme,
    right: /*#__PURE__*/React.createElement("button", {
      style: {
        background: 'transparent',
        border: 'none',
        padding: 6,
        cursor: 'pointer',
        color: 'var(--fg-2)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bell",
      size: 20
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 16px 100px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 6
    }
  }, "Hi there"), /*#__PURE__*/React.createElement("div", {
    className: "title-display",
    style: {
      fontSize: 32
    }
  }, "Let's find", /*#__PURE__*/React.createElement("br", null), "the right dose.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg-2)'
    }
  }, "Dosing for"), /*#__PURE__*/React.createElement("button", {
    className: "btn-ghost",
    style: {
      fontSize: 13,
      padding: 0,
      background: 'none',
      border: 'none',
      color: 'var(--brand)',
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "+ Add child")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      margin: '0 -16px',
      padding: '0 16px 4px'
    }
  }, kids.map(k => /*#__PURE__*/React.createElement(KidPill, {
    key: k.id,
    kid: k,
    active: k.id === activeKid,
    onClick: () => setActiveKid(k.id)
  })))), kid && /*#__PURE__*/React.createElement("div", {
    className: "card card-tint",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: 'rgba(255,255,255,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 22,
    color: "var(--teal-700)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--teal-800)',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, "Last dose \xB7 ", kid.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--fg)',
      marginTop: 2
    }
  }, "Tylenol 5 mL \xB7 2 hr 14 min ago")), /*#__PURE__*/React.createElement("span", {
    className: "badge badge-warn"
  }, "Wait 1h 46m")), /*#__PURE__*/React.createElement("div", {
    className: "input-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 18,
    color: "var(--fg-3)"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search medications\u2026"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg-2)'
    }
  }, "Common medications"), /*#__PURE__*/React.createElement("button", {
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--brand)',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }
  }, "See all")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, meds.map(m => /*#__PURE__*/React.createElement(MedCard, {
    key: m.id,
    med: m,
    onClick: () => onPickMed(m)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      padding: '14px 16px',
      background: 'var(--bg-inset)',
      borderRadius: 14,
      border: '1px solid var(--hairline)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 20,
    color: "var(--fg-2)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--fg-2)',
      lineHeight: 1.5
    }
  }, "Always confirm dosing with your pediatrician before giving medication."))));
}

/* ---------- DOSE RESULT ---------- */
function DoseScreen({
  med,
  kid,
  onBack,
  theme,
  toggleTheme
}) {
  // Simple weight-based calc (acetaminophen ~10–15 mg/kg)
  const weightKg = kid.weight / 2.205;
  const mg = Math.round(weightKg * 12.5 / 10) * 10;
  const ml = Math.round(mg / 160 * 5 * 2) / 2; // 160mg/5mL suspension

  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: med.name,
    onBack: onBack,
    theme: theme,
    toggleTheme: toggleTheme
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 140px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      background: 'linear-gradient(180deg, var(--bg-tint) 0%, var(--bg-tint-2) 100%)',
      border: '1px solid rgba(14,140,140,0.18)',
      padding: '28px 24px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Recommended dose"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginTop: 14,
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "dose-numeral",
    style: {
      fontSize: 96,
      color: 'var(--fg)'
    }
  }, ml), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 24,
      color: 'var(--fg-2)',
      fontWeight: 500
    }
  }, "mL")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--fg-2)',
      marginTop: 6
    }
  }, "\u2248 ", mg, " mg \xB7 for ", kid.name, ", ", kid.weight, " lb")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 8
    }
  }, "Every"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 24,
      fontWeight: 600,
      color: 'var(--fg)',
      letterSpacing: '-0.01em'
    }
  }, "4 hours"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--fg-3)',
      marginTop: 2
    }
  }, "Max 5 doses / 24h")), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 8
    }
  }, "Strength"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 24,
      fontWeight: 600,
      color: 'var(--fg)',
      letterSpacing: '-0.01em'
    }
  }, "160 mg / 5 mL"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--fg-3)',
      marginTop: 2
    }
  }, "Liquid suspension"))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 20,
    color: "var(--brand)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--fg-2)',
      lineHeight: 1.5
    }
  }, "Always confirm dosing with your pediatrician before giving medication.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--fg-2)',
      marginBottom: 10
    }
  }, "Recent doses for ", kid.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, [['Tylenol · 5 mL', '2:14 AM, today'], ['Tylenol · 5 mL', '10:08 PM, yesterday'], ['Motrin · 4 mL', '6:30 PM, yesterday']].map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 14px',
      background: 'var(--bg-card)',
      border: '1px solid var(--hairline)',
      borderRadius: 10,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg)',
      fontWeight: 500
    }
  }, r[0]), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--fg-3)'
    }
  }, r[1])))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      bottom: 0,
      padding: '12px 16px 28px',
      background: theme === 'dark' ? 'rgba(11,23,23,0.92)' : 'rgba(251,248,242,0.92)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--hairline)',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-lg",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 18
  }), " I gave this dose")));
}
window.HomeScreen = HomeScreen;
window.DoseScreen = DoseScreen;
window.TabBar = TabBar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/screens-helper.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web/sections-helper.jsx
try { (() => {
/* CloseDose marketing site components */

const {
  useState
} = React;
function Header() {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: 'rgba(251,248,242,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--hairline)',
      padding: '14px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.svg",
    alt: "",
    style: {
      height: 32
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--teal-900)',
      letterSpacing: '-0.02em'
    }
  }, "closedose")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 32,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--fg-2)',
      fontSize: 14,
      fontWeight: 500
    }
  }, "Medications"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--fg-2)',
      fontSize: 14,
      fontWeight: 500
    }
  }, "Safety"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--fg-2)',
      fontSize: 14,
      fontWeight: 500
    }
  }, "About"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    style: {
      width: 'auto',
      padding: '10px 18px',
      fontSize: 14
    }
  }, "Open app")));
}
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      padding: '80px 32px 96px',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: '1.05fr 0.95fr',
      gap: 48,
      alignItems: 'center',
      maxWidth: 1240,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: '-100px',
      top: '-50px',
      width: 600,
      height: 600,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(159,217,205,0.5) 0%, rgba(159,217,205,0) 60%)',
      zIndex: 0,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 18
    }
  }, "For tired parents"), /*#__PURE__*/React.createElement("h1", {
    className: "title-display",
    style: {
      fontSize: 80,
      fontWeight: 600,
      marginBottom: 24,
      color: 'var(--teal-950)',
      maxWidth: 560
    }
  }, "Find the right dose. Even at 3am."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 19,
      lineHeight: 1.55,
      color: 'var(--fg-2)',
      maxWidth: 480,
      marginBottom: 32
    }
  }, "CloseDose helps you confirm safe doses of common over-the-counter medications for kids \u2014 calmly, clearly, and without the math."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-lg",
    style: {
      width: 'auto'
    }
  }, "Open the app ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrowRight",
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    style: {
      width: 'auto',
      padding: '14px 18px'
    }
  }, "How it works")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28,
      display: 'flex',
      gap: 18,
      alignItems: 'center',
      color: 'var(--fg-3)',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield",
    size: 16
  }), " Pediatrician-reviewed"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "moon",
    size: 16
  }), " Dark-mode friendly"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 520,
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement(StackedCards, null)));
}
function StackedCards() {
  const cards = [{
    rotate: -8,
    x: -30,
    y: 40,
    kind: 'dose'
  }, {
    rotate: 0,
    x: 60,
    y: 0,
    kind: 'med'
  }, {
    rotate: 7,
    x: 130,
    y: 80,
    kind: 'history'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      height: '100%'
    }
  }, cards.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      left: `${c.x}px`,
      top: `${c.y}px`,
      width: 300,
      transform: `rotate(${c.rotate}deg)`,
      transition: 'transform 320ms cubic-bezier(0.2,0,0,1)',
      filter: 'drop-shadow(0 20px 40px rgba(11,30,29,0.18))'
    }
  }, c.kind === 'dose' && /*#__PURE__*/React.createElement(HeroDoseCard, null), c.kind === 'med' && /*#__PURE__*/React.createElement(HeroMedCard, null), c.kind === 'history' && /*#__PURE__*/React.createElement(HeroHistoryCard, null))));
}
function HeroDoseCard() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: 24,
      padding: 24,
      border: '1px solid rgba(11,30,29,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 8
    }
  }, "Children's Tylenol"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 14,
      color: 'var(--fg-3)',
      marginBottom: 18
    }
  }, "For Maya \xB7 48 lb"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '20px 0',
      background: 'var(--mint-100)',
      borderRadius: 16,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, "Your dose"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 4,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "dose-numeral",
    style: {
      fontSize: 64
    }
  }, "5"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 18,
      color: 'var(--fg-2)'
    }
  }, "mL")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--fg-2)',
      marginTop: 4
    }
  }, "\u2248 280 mg")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12,
      color: 'var(--fg-2)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Every 4 hours"), /*#__PURE__*/React.createElement("span", null, "Max 5 / 24h")));
}
function HeroMedCard() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: 24,
      padding: 20,
      border: '1px solid rgba(11,30,29,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, [['Children\'s Tylenol', 'Acetaminophen', '#E8F5F1', 'var(--teal-700)', 'thermo'], ['Children\'s Motrin', 'Ibuprofen', '#FCEBD2', 'var(--amber-700)', 'pill'], ['Children\'s Benadryl', 'Diphenhydramine', 'rgba(159,217,205,0.4)', 'var(--teal-700)', 'droplet']].map(([name, gen, tint, ic, icn], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 8px',
      borderRadius: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: tint,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icn,
    size: 18,
    color: ic
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 14,
      fontWeight: 600,
      lineHeight: 1.2
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--fg-3)'
    }
  }, gen)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 16,
    color: "var(--fg-3)"
  })))));
}
function HeroHistoryCard() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFFFFF',
      borderRadius: 24,
      padding: 20,
      border: '1px solid rgba(11,30,29,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 12
    }
  }, "Today"), [['Tylenol · 5 mL', '2:14 AM', 'var(--sage-600)'], ['Motrin · 4 mL', '10:08 PM', 'var(--amber-600)'], ['Tylenol · 5 mL', '6:30 PM', 'var(--sage-600)']].map(([t, when, c], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 0',
      borderTop: i ? '1px solid rgba(11,30,29,0.06)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: c
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      flex: 1
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--fg-3)',
      fontFamily: 'var(--font-mono)'
    }
  }, when))));
}
function FeatureGrid() {
  const features = [{
    icon: 'weight',
    title: 'Weight-based',
    body: 'Doses tailored to your child\'s actual weight, not a guess from age.'
  }, {
    icon: 'clock',
    title: 'Track every dose',
    body: 'See what you\'ve given and when. Never wonder if you can give the next one.'
  }, {
    icon: 'baby',
    title: 'Multiple kids',
    body: 'Switch between profiles in a tap. Each kid has their own dose history.'
  }, {
    icon: 'moon',
    title: 'Built for nighttime',
    body: 'Warm dark mode that won\'t scorch your eyes when the lights are off.'
  }, {
    icon: 'shield',
    title: 'Pediatrician-reviewed',
    body: 'All doses cross-reference current AAP guidelines.'
  }, {
    icon: 'bell',
    title: 'Gentle reminders',
    body: 'Optional nudges when the next dose is safe to give.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '96px 32px',
      maxWidth: 1240,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 680,
      marginBottom: 56
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 14
    }
  }, "Why CloseDose"), /*#__PURE__*/React.createElement("h2", {
    className: "title",
    style: {
      fontSize: 48,
      color: 'var(--teal-950)'
    }
  }, "The calmest two minutes of your night.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 20
    }
  }, features.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "card",
    style: {
      padding: '28px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: 'var(--bg-tint)',
      color: 'var(--brand)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: f.icon,
    size: 22,
    stroke: 2
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 22,
      fontWeight: 600,
      color: 'var(--fg)',
      letterSpacing: '-0.01em'
    }
  }, f.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      lineHeight: 1.55,
      color: 'var(--fg-2)'
    }
  }, f.body)))));
}
function CTA() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 32px 96px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1100,
      margin: '0 auto',
      background: 'linear-gradient(135deg, var(--teal-700) 0%, var(--teal-800) 100%)',
      borderRadius: 32,
      padding: '64px 56px',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 32,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--mint-200)',
      marginBottom: 14
    }
  }, "Free to use"), /*#__PURE__*/React.createElement("h2", {
    className: "title",
    style: {
      fontSize: 44,
      marginBottom: 16,
      color: '#fff'
    }
  }, "Open CloseDose. Then put your phone down."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      lineHeight: 1.55,
      color: 'rgba(255,255,255,0.85)'
    }
  }, "It takes about 30 seconds. We'll be here when you need us again.")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-lg",
    style: {
      background: '#FFFFFF',
      color: 'var(--teal-800)',
      width: 'auto',
      padding: '18px 28px',
      fontSize: 17
    }
  }, "Open the app ", /*#__PURE__*/React.createElement(Icon, {
    name: "arrowRight",
    size: 18
  }))));
}
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--hairline)',
      padding: '40px 32px 56px',
      maxWidth: 1240,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.svg",
    alt: "",
    style: {
      height: 24
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 16,
      fontWeight: 600,
      color: 'var(--teal-900)'
    }
  }, "closedose"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--fg-3)',
      marginLeft: 12
    }
  }, "\xA9 2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--fg-3)',
      maxWidth: 560,
      textAlign: 'right'
    }
  }, "Always confirm dosing before administering medication. CloseDose provides dosing information for common over-the-counter medications for generally healthy children. Not a substitute for medical advice."));
}
window.Header = Header;
window.Hero = Hero;
window.FeatureGrid = FeatureGrid;
window.CTA = CTA;
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web/sections-helper.jsx", error: String((e && e.message) || e) }); }

})();
