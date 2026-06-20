/* @ds-bundle: {"format":3,"namespace":"ChroniclesDesignSystem_cefe3d","components":[{"name":"ACCENTS","sourcePath":"components/core/AccentPicker.jsx"},{"name":"AccentPicker","sourcePath":"components/core/AccentPicker.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"Dropdown","sourcePath":"components/core/Dropdown.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"SegmentedControl","sourcePath":"components/core/SegmentedControl.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Textarea","sourcePath":"components/core/Textarea.jsx"},{"name":"Widget","sourcePath":"components/dashboard/Widget.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"ENTRY_ICONS","sourcePath":"components/journal/BulletEntry.jsx"},{"name":"BulletEntry","sourcePath":"components/journal/BulletEntry.jsx"},{"name":"Collection","sourcePath":"components/journal/Collection.jsx"},{"name":"QuickAdd","sourcePath":"components/journal/QuickAdd.jsx"},{"name":"TOPICS","sourcePath":"components/journal/QuickCapture.jsx"},{"name":"QuickCapture","sourcePath":"components/journal/QuickCapture.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/AccentPicker.jsx":"a8ab91cd3f31","components/core/Avatar.jsx":"279adc5ef39d","components/core/Badge.jsx":"f95e66602ecd","components/core/Button.jsx":"f1c738d0293e","components/core/Card.jsx":"05e5b7500c6b","components/core/Checkbox.jsx":"740af5b30518","components/core/Dropdown.jsx":"6a3ac061a3c2","components/core/Icon.jsx":"892c95ba3f03","components/core/IconButton.jsx":"cdd587d67749","components/core/Input.jsx":"4bf7fdef2331","components/core/SegmentedControl.jsx":"11bff7cab9e9","components/core/Select.jsx":"64b48800bfc8","components/core/Switch.jsx":"fdec0c8cd077","components/core/Tag.jsx":"434fcf58b6dd","components/core/Textarea.jsx":"4b126400cd7f","components/dashboard/Widget.jsx":"597824dc3ca0","components/feedback/Banner.jsx":"4c70009e4f60","components/feedback/Dialog.jsx":"cc43afa6d3f2","components/feedback/Toast.jsx":"19b544d9743b","components/feedback/Tooltip.jsx":"8d84ec747d73","components/journal/BulletEntry.jsx":"be23fd1b9a17","components/journal/Collection.jsx":"854362b059fa","components/journal/QuickAdd.jsx":"42f57cc518ec","components/journal/QuickCapture.jsx":"2fb9afe1e8c3","components/navigation/Tabs.jsx":"7b6f91ec1f3b","ui_kits/desktop/app.jsx":"0c7dbf170fc3","ui_kits/mobile/app.jsx":"57393434b799"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ChroniclesDesignSystem_cefe3d = window.ChroniclesDesignSystem_cefe3d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Avatar — image or initials. */
function Avatar({
  src,
  name = "",
  size = "md",
  className = "",
  ...rest
}) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `ch-avatar ch-avatar--${size} ${className}`
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : /*#__PURE__*/React.createElement("span", null, initials || "·"));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Small status/label pill. */
function Badge({
  tone = "neutral",
  dot = false,
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `ch-badge ch-badge--${tone} ${className}`
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "ch-badge__dot"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Surface container. */
function Card({
  pad = true,
  raised = false,
  interactive = false,
  as: Tag = "div",
  children,
  className = "",
  ...rest
}) {
  const cls = ["ch-card", pad ? "ch-card--pad" : "", raised ? "ch-card--raised" : "", interactive ? "ch-card--interactive" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Thick-stroke, rounded-cap icon set (4px weight, rounded linecap/join).
   Matches Chronicles' bold, elegant aesthetic. */
const PATHS = {
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  plus: "M5 12h14M12 5v14",
  minus: "M5 12h14",
  search: "M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z|M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z",
  calendar: "M8 2v4M16 2v4M3 10h18|M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z",
  "chevron-right": "M9 18l6-6-6-6",
  "chevron-left": "M15 18l-6-6 6-6",
  "chevron-down": "M6 9l6 6 6-6",
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  "arrow-left": "M19 12H5M11 18l-6-6 6-6",
  star: "M11.5 2.6a.6.6 0 0 1 1 0l2.5 5.1 5.6.8a.6.6 0 0 1 .3 1l-4 4 1 5.6a.6.6 0 0 1-.9.6L12 17.1l-5 2.6a.6.6 0 0 1-.9-.6l1-5.6-4-4a.6.6 0 0 1 .3-1l5.6-.8 2.5-5.1Z",
  circle: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  "more-horizontal": "M12 12h.01M19 12h.01M5 12h.01",
  trash: "M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
  pencil: "M12 20h9|M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z|M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20|M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z",
  bookmark: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z",
  share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z|M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z|M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z|M8.6 13.5l6.8 4|M15.4 6.5l-6.8 4",
  tag: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z|M7 7h.01",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9|M13.7 21a2 2 0 0 1-3.4 0",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2|M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  menu: "M3 12h18M3 6h18M3 18h18",
  sparkles: "M12 3l1.9 4.8L18 9.7l-4.1 1.9L12 16l-1.9-4.4L6 9.7l4.1-1.9L12 3Z|M5 19l.7 1.7L7 21l-1.3.6L5 23l-.7-1.4L3 21l1.3-.3L5 19Z|M19 14l.5 1.3.9.4-.9.4-.5 1.3-.5-1.3-.9-.4.9-.4.5-1.3Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M12 7v5l3 2",
  filter: "M22 3H2l8 9.5V19l4 2v-8.5L22 3Z",
  archive: "M21 8v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8|M2 4h20v4H2zM10 12h4",
  hash: "M4 9h16M4 15h16M10 3 8 21M16 3l-2 18",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z|M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  palette: "M12 21a9 9 0 0 1 0-18c4.97 0 9 3.58 9 8 0 2.5-2 3.5-3.5 3.5H15a2 2 0 0 0-1.5 3.3 1.5 1.5 0 0 1-1.1 2.2|M7.5 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM12 7.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM16.5 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  "layout-grid": "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  command: "M18 3a3 3 0 0 0-3 3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 0 0 0-6Z",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2|M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1Z",
  "arrow-up-right": "M7 17 17 7M7 7h10v10",
  "chevron-up": "M18 15l-6-6-6 6",
  "panel-left": "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 3v18",
  "more-vertical": "M12 12h.01M12 5h.01M12 19h.01",
  repeat: "M17 2l4 4-4 4|M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4|M21 13v1a4 4 0 0 1-4 4H3",
  grip: "M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01",
  quote: "M3 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2v3z|M14 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z",
  feather: "M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z|M16 8 2 22|M17.5 15H9",
  trophy: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6|M18 9h1.5a2.5 2.5 0 0 0 0-5H18|M4 22h16|M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22|M14 14.66V17c0 .55.47.98.97 1.21 1.18.54 2.03 2.03 2.03 3.79|M18 2H6v7a6 6 0 0 0 12 0V2Z",
  utensils: "M3 2v7c0 1.1.9 2 2 2a2 2 0 0 0 2-2V2|M7 2v20|M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7",
  coffee: "M10 2v2M14 2v2M6 2v2|M16 8a4 4 0 0 1 0 8h-1|M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z",
  heart: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  pill: "M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z|M8.5 8.5l7 7",
  droplet: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z",
  cloud: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",
  "cloud-sun": "M12 2v2|M5.22 5.22l1.42 1.42|M2 12h2|M17.36 6.64l1.42-1.42|M22 12a4 4 0 0 0-4-4h-.5a6 6 0 0 0-11.4 1.5|M5 18a4 4 0 1 0 0 0h12a3 3 0 0 0 0-6",
  mic: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z|M19 10v2a7 7 0 0 1-14 0v-2|M12 19v3",
  type: "M4 7V4h16v3|M9 20h6|M12 4v16",
  bold: "M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z",
  italic: "M19 4h-9M14 20H5M15 4 9 20",
  leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z|M2 21c0-3 1.85-5.36 5.08-6",
  smile: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M8 14s1.5 2 4 2 4-2 4-2|M9 9h.01M15 9h.01",
  "mood-1": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M8 16s1.4-2.5 4-2.5 4 2.5 4 2.5|M9 9.5h.01M15 9.5h.01",
  "mood-2": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M8.5 15.5s1.2-1 3.5-1 3.5 1 3.5 1|M9 9.5h.01M15 9.5h.01",
  "mood-3": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M8.5 15h7|M9 9.5h.01M15 9.5h.01",
  "mood-4": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M8.5 14.5s1.2 1 3.5 1 3.5-1 3.5-1|M9 9.5h.01M15 9.5h.01",
  "mood-5": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M8 14s1.4 2.5 4 2.5 4-2.5 4-2.5|M9 9.5h.01M15 9.5h.01",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  "map-pin": "M20 10c0 4.4-8 12-8 12s-8-7.6-8-12a8 8 0 0 1 16 0Z|M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  "check-circle": "M22 11.08V12a10 10 0 1 1-5.93-9.14|M22 4 12 14.01l-3-3",
  "plus-circle": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z|M12 8v8M8 12h8",
  moon2: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
};
function Icon({
  name,
  size = 20,
  strokeWidth = 4,
  style,
  className,
  ...rest
}) {
  const d = PATHS[name];
  const segs = d ? d.split("|") : [];
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    style: style,
    "aria-hidden": "true"
  }, rest), segs.map((p, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: p
  })));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/AccentPicker.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The six Chronicles accent themes. value matches the data-accent attribute. */
const ACCENTS = [{
  value: "ink",
  label: "Ink",
  color: "#5b53d6"
}, {
  value: "sage",
  label: "Sage",
  color: "#4c8a5f"
}, {
  value: "clay",
  label: "Clay",
  color: "#bf6038"
}, {
  value: "amber",
  label: "Amber",
  color: "#c2871a"
}, {
  value: "teal",
  label: "Teal",
  color: "#1e8a87"
}, {
  value: "rose",
  label: "Rose",
  color: "#c34a77"
}, {
  value: "slate",
  label: "Slate",
  color: "#5b636e"
}];

/* Row of accent swatches for theme customization. */
function AccentPicker({
  value = "ink",
  onChange,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `ch-accentpicker ${className}`,
    role: "radiogroup",
    "aria-label": "Accent color",
    style: {
      display: "flex",
      gap: "var(--space-3)",
      alignItems: "center"
    }
  }, rest), ACCENTS.map(a => /*#__PURE__*/React.createElement("button", {
    key: a.value,
    type: "button",
    role: "radio",
    "aria-checked": value === a.value,
    "aria-pressed": value === a.value,
    "aria-label": a.label,
    title: a.label,
    className: "ch-swatch",
    style: {
      background: a.color
    },
    onClick: () => onChange && onChange(a.value)
  }, value === a.value && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13,
    strokeWidth: 3
  })))));
}
Object.assign(__ds_scope, { ACCENTS, AccentPicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/AccentPicker.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Chronicles primary action element. */
function Button({
  variant = "primary",
  size = "md",
  block = false,
  icon,
  iconRight,
  children,
  className = "",
  ...rest
}) {
  const cls = ["ch-btn", `ch-btn--${variant}`, `ch-btn--${size}`, block ? "ch-btn--block" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    className: "ch-btn__icon"
  }, typeof icon === "string" ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon
  }) : icon), children && /*#__PURE__*/React.createElement("span", null, children), iconRight && /*#__PURE__*/React.createElement("span", {
    className: "ch-btn__icon"
  }, typeof iconRight === "string" ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight
  }) : iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Checkbox with label. Controlled or uncontrolled. */
function Checkbox({
  label,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `ch-check ${className}`
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "ch-check__box"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 13,
    strokeWidth: 3
  })), label && /*#__PURE__*/React.createElement("span", {
    className: "ch-check__label"
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/Dropdown.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/*
 * Single-select dropdown menu. The trigger shows the current option;
 * the menu lists options with optional icons and a check on the active one.
 */
function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select",
  up = false,
  triggerLabel,
  className = "",
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const norm = options.map(o => typeof o === "string" ? {
    value: o,
    label: o
  } : o);
  const current = norm.find(o => o.value === value);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `ch-dropdown ${className}`,
    "data-open": open
  }, rest), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ch-dropdown__trigger",
    "aria-haspopup": "listbox",
    "aria-expanded": open,
    onClick: () => setOpen(o => !o)
  }, current && current.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: current.icon,
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, triggerLabel || (current ? current.label : placeholder)), /*#__PURE__*/React.createElement("span", {
    className: "ch-dropdown__chev"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 15
  }))), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "ch-menu__overlay",
    onClick: () => setOpen(false)
  }), /*#__PURE__*/React.createElement("div", {
    className: `ch-menu ${up ? "ch-menu--up" : ""}`,
    role: "listbox"
  }, norm.map(o => o.separator ? /*#__PURE__*/React.createElement("div", {
    key: o.value || Math.random(),
    className: "ch-menu__sep"
  }) : /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "option",
    "aria-selected": o.value === value,
    className: "ch-menu__item",
    onClick: () => {
      onChange && onChange(o.value);
      setOpen(false);
    }
  }, o.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: o.icon,
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, o.label), /*#__PURE__*/React.createElement("span", {
    className: "ch-menu__check"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 15,
    strokeWidth: 2.4
  })))))));
}
Object.assign(__ds_scope, { Dropdown });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Dropdown.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Square icon-only button. Always pass aria-label. */
function IconButton({
  variant = "ghost",
  size = "md",
  icon,
  className = "",
  ...rest
}) {
  const cls = ["ch-iconbtn", `ch-iconbtn--${size}`, variant === "solid" ? "ch-iconbtn--solid" : variant === "outline" ? "ch-iconbtn--outline" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls
  }, rest), typeof icon === "string" ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon
  }) : icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Text input with optional label, hint/error, and leading icon. */
function Input({
  label,
  hint,
  error,
  icon,
  id,
  className = "",
  ...rest
}) {
  const fieldId = id || rest.name || undefined;
  const input = /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    className: `ch-input ${className}`,
    "aria-invalid": error ? "true" : undefined
  }, rest));
  return /*#__PURE__*/React.createElement("div", {
    className: "ch-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "ch-field__label",
    htmlFor: fieldId
  }, label), icon ? /*#__PURE__*/React.createElement("div", {
    className: "ch-input-group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ch-input-group__icon"
  }, typeof icon === "string" ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon
  }) : icon), input) : input, (error || hint) && /*#__PURE__*/React.createElement("span", {
    className: `ch-field__hint ${error ? "ch-field__hint--error" : ""}`
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Segmented control — single-select among a few options. */
function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `ch-segmented ${className}`,
    role: "tablist"
  }, rest), options.map(opt => {
    const o = typeof opt === "string" ? {
      value: opt,
      label: opt
    } : opt;
    const selected = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      role: "tab",
      "aria-selected": selected,
      className: "ch-segmented__item",
      onClick: () => onChange && onChange(o.value)
    }, o.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: o.icon
    }), o.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Native select with Chronicles styling and custom chevron. */
function Select({
  label,
  hint,
  id,
  className = "",
  children,
  ...rest
}) {
  const fieldId = id || rest.name || undefined;
  return /*#__PURE__*/React.createElement("div", {
    className: "ch-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "ch-field__label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    className: `ch-select ${className}`
  }, rest), children), hint && /*#__PURE__*/React.createElement("span", {
    className: "ch-field__hint"
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Toggle switch for binary settings. */
function Switch({
  label,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: `ch-switch ${className}`
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch"
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "ch-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ch-switch__thumb"
  })), label && /*#__PURE__*/React.createElement("span", {
    className: "ch-check__label"
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Removable chip, e.g. a tag on an entry. */
function Tag({
  children,
  onRemove,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `ch-tag ${className}`
  }, rest), children, onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "ch-tag__close",
    "aria-label": "Remove",
    onClick: onRemove
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 13,
    strokeWidth: 2.4
  })));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/core/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Multi-line text field. */
function Textarea({
  label,
  hint,
  error,
  id,
  className = "",
  ...rest
}) {
  const fieldId = id || rest.name || undefined;
  return /*#__PURE__*/React.createElement("div", {
    className: "ch-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "ch-field__label",
    htmlFor: fieldId
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    className: `ch-textarea ${className}`,
    "aria-invalid": error ? "true" : undefined
  }, rest)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    className: `ch-field__hint ${error ? "ch-field__hint--error" : ""}`
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/dashboard/Widget.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Dashboard widget shell: titled card with an icon and optional action. */
function Widget({
  title,
  icon,
  action,
  variant,
  flush = false,
  children,
  className = "",
  ...rest
}) {
  const cls = ["ch-widget", variant === "raised" ? "ch-widget--raised" : "", variant === "accent" ? "ch-widget--accent" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("section", _extends({
    className: cls
  }, rest), (title || icon || action) && /*#__PURE__*/React.createElement("header", {
    className: "ch-widget__head"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "ch-widget__icon"
  }, typeof icon === "string" ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 17
  }) : icon), title && /*#__PURE__*/React.createElement("h3", {
    className: "ch-widget__title"
  }, title), action && /*#__PURE__*/React.createElement("span", {
    className: "ch-widget__action"
  }, action)), /*#__PURE__*/React.createElement("div", {
    className: `ch-widget__body ${flush ? "ch-widget__body--flush" : ""}`
  }, children));
}
Object.assign(__ds_scope, { Widget });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/dashboard/Widget.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ICONS = {
  info: "bell",
  success: "check",
  warning: "flag"
};

/* Inline contextual banner. */
function Banner({
  tone = "info",
  title,
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `ch-banner ch-banner--${tone} ${className}`,
    role: "note"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "ch-banner__icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ICONS[tone],
    size: 17
  })), /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("span", {
    className: "ch-banner__title"
  }, title, " "), children));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
/* Modal dialog. Controlled via `open`. */
function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className = ""
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "ch-dialog-overlay",
    onClick: onClose,
    role: "presentation"
  }, /*#__PURE__*/React.createElement("div", {
    className: `ch-dialog ${className}`,
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "ch-dialog__body"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("h2", {
    className: "ch-dialog__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "ch-dialog__desc"
  }, description)), onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    "aria-label": "Close",
    size: "sm",
    onClick: onClose
  })), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-4)"
    }
  }, children)), footer && /*#__PURE__*/React.createElement("div", {
    className: "ch-dialog__footer"
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const ICONS = {
  success: "check",
  danger: "x",
  accent: "sparkles",
  neutral: "bell"
};

/* Transient notification. */
function Toast({
  tone = "neutral",
  title,
  description,
  onClose,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `ch-toast ch-toast--${tone} ${className}`,
    role: "status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ch-toast__icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ICONS[tone],
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    className: "ch-toast__content"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "ch-toast__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "ch-toast__desc"
  }, description)), onClose && /*#__PURE__*/React.createElement("button", {
    className: "ch-toast__close",
    "aria-label": "Dismiss",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 15
  })));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/* Hover/focus tooltip wrapper. */
function Tooltip({
  label,
  children,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `ch-tooltip-wrap ${className}`,
    tabIndex: 0
  }, children, /*#__PURE__*/React.createElement("span", {
    className: "ch-tooltip",
    role: "tooltip"
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/journal/BulletEntry.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Topic types and their leading icon (for non-task entries). */
const ENTRY_ICONS = {
  quote: "quote",
  journal: "feather",
  goal: "trophy",
  meal: "utensils",
  recipe: "coffee",
  wellness: "heart",
  medication: "pill",
  water: "droplet",
  workout: "activity",
  idea: "sparkles"
};

/* Render the leading signifier for an entry. */
function Signifier({
  type,
  done,
  accent,
  icon
}) {
  if (type === "task") {
    if (done) return /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 15,
      strokeWidth: 2.4
    });
    return /*#__PURE__*/React.createElement("span", {
      className: `ch-sig-task ${accent ? "ch-sig-task--accent" : ""}`
    });
  }
  if (type === "event") return /*#__PURE__*/React.createElement("span", {
    className: "ch-sig-event"
  });
  if (type === "note") return /*#__PURE__*/React.createElement("span", {
    className: "ch-sig-note"
  });
  const name = icon || ENTRY_ICONS[type] || "circle";
  return /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: name,
    size: 16,
    strokeWidth: 1.9
  });
}

/*
 * The signature Chronicles row — a captured entry of any topic.
 * Tasks have a tappable dot/check; other topics (quote, journal, goal,
 * meal, recipe, …) show an elegant icon marker. Supports priority, time,
 * and tags. Compose many inside a Collection.
 */
function BulletEntry({
  type = "task",
  done = false,
  priority = false,
  accent = false,
  icon,
  text,
  sub,
  time,
  tags,
  onToggle,
  trailing,
  className = "",
  ...rest
}) {
  const isTask = type === "task";
  const sigClass = `ch-entry__sig ${isTask ? "" : "ch-entry__sig--topic"}`;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `ch-entry ch-entry--${type} ${done ? "ch-entry--done" : ""} ${priority ? "ch-entry--priority" : ""} ${className}`
  }, rest), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: sigClass,
    "aria-pressed": isTask ? done : undefined,
    "aria-label": isTask ? done ? "Mark incomplete" : "Complete" : type,
    onClick: isTask ? onToggle : undefined,
    tabIndex: isTask ? 0 : -1
  }, /*#__PURE__*/React.createElement(Signifier, {
    type: type,
    done: done,
    accent: accent,
    icon: icon
  })), /*#__PURE__*/React.createElement("div", {
    className: "ch-entry__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ch-entry__text"
  }, priority && !done && /*#__PURE__*/React.createElement("span", {
    className: "ch-entry__star"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "star",
    size: 14
  })), text), sub && /*#__PURE__*/React.createElement("div", {
    className: "ch-entry__sub"
  }, sub), (time || tags) && /*#__PURE__*/React.createElement("div", {
    className: "ch-entry__meta"
  }, time && /*#__PURE__*/React.createElement("span", {
    className: "ch-entry__time"
  }, time), tags && tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    className: "ch-entry__tag"
  }, "#", t)))), trailing && /*#__PURE__*/React.createElement("div", {
    className: "ch-entry__trail"
  }, trailing));
}
Object.assign(__ds_scope, { ENTRY_ICONS, BulletEntry });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/journal/BulletEntry.jsx", error: String((e && e.message) || e) }); }

// components/journal/Collection.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* A titled group of entries — a daily log or named collection. */
function Collection({
  title,
  date,
  action,
  children,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    className: `ch-collection ${className}`
  }, rest), /*#__PURE__*/React.createElement("header", {
    className: "ch-collection__head"
  }, title && /*#__PURE__*/React.createElement("h2", {
    className: "ch-collection__title"
  }, title), date && /*#__PURE__*/React.createElement("span", {
    className: "ch-collection__date"
  }, date), /*#__PURE__*/React.createElement("span", {
    className: "ch-collection__rule"
  }), action), /*#__PURE__*/React.createElement("div", null, children));
}
Object.assign(__ds_scope, { Collection });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/journal/Collection.jsx", error: String((e && e.message) || e) }); }

// components/journal/QuickAdd.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Inline rapid-add row that matches the entry rhythm. */
function QuickAdd({
  placeholder = "Add an entry…",
  onAdd,
  type = "task",
  className = "",
  ...rest
}) {
  const [value, setValue] = React.useState("");
  const submit = e => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onAdd && onAdd(v);
    setValue("");
  };
  return /*#__PURE__*/React.createElement("form", _extends({
    className: `ch-quickadd ${className}`,
    onSubmit: submit
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "ch-quickadd__sig"
  }, type === "event" ? /*#__PURE__*/React.createElement("span", {
    className: "ch-sig-event"
  }) : type === "note" ? /*#__PURE__*/React.createElement("span", {
    className: "ch-sig-note"
  }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "plus",
    size: 15
  })), /*#__PURE__*/React.createElement("input", {
    className: "ch-quickadd__input",
    placeholder: placeholder,
    value: value,
    onChange: e => setValue(e.target.value),
    "aria-label": "Add entry"
  }));
}
Object.assign(__ds_scope, { QuickAdd });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/journal/QuickAdd.jsx", error: String((e && e.message) || e) }); }

// components/journal/QuickCapture.jsx
try { (() => {
/* The full topic palette Chronicles sorts captures into. */
const TOPICS = [{
  value: "task",
  label: "Task",
  icon: "check-circle"
}, {
  value: "event",
  label: "Event",
  icon: "calendar"
}, {
  value: "journal",
  label: "Journal",
  icon: "feather"
}, {
  value: "note",
  label: "Note",
  icon: "list"
}, {
  value: "quote",
  label: "Quote",
  icon: "quote"
}, {
  value: "goal",
  label: "Goal",
  icon: "trophy"
}, {
  value: "meal",
  label: "Meal",
  icon: "utensils"
}, {
  value: "recipe",
  label: "Recipe",
  icon: "coffee"
}, {
  value: "idea",
  label: "Idea",
  icon: "sparkles"
}];
const PLACEHOLDERS = {
  task: "What needs doing?",
  event: "What's happening, and when?",
  journal: "Write what's on your mind…",
  note: "Jot something down…",
  quote: "Capture a line worth keeping…",
  goal: "Name a goal to track…",
  meal: "What did you eat?",
  recipe: "Save a recipe…",
  idea: "Capture the idea…"
};

/*
 * Quick capture — the heart of the Chronicles dashboard. Pick a topic from the
 * dropdown, type (or dictate) anything, and it's sorted into the right view.
 * Includes a formatting toggle and a microphone for voice capture.
 */
function QuickCapture({
  topics = TOPICS,
  defaultTopic = "task",
  onCapture,
  autoFocus = false,
  className = ""
}) {
  const [topic, setTopic] = React.useState(defaultTopic);
  const [text, setText] = React.useState("");
  const [listening, setListening] = React.useState(false);
  const submit = () => {
    const v = text.trim();
    if (!v) return;
    onCapture && onCapture({
      type: topic,
      text: v
    });
    setText("");
  };
  const onKey = e => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: `ch-capture ${className}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "ch-capture__head"
  }, /*#__PURE__*/React.createElement(__ds_scope.Dropdown, {
    value: topic,
    onChange: setTopic,
    options: topics
  }), /*#__PURE__*/React.createElement("div", {
    className: "ch-capture__tools"
  }, /*#__PURE__*/React.createElement(__ds_scope.Tooltip, {
    label: "Formatting"
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "type",
    "aria-label": "Formatting",
    size: "sm"
  })), /*#__PURE__*/React.createElement(__ds_scope.Tooltip, {
    label: listening ? "Stop" : "Dictate"
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "mic",
    "aria-label": "Dictate",
    size: "sm",
    className: listening ? "ch-capture__mic--live" : "",
    onClick: () => setListening(l => !l)
  })))), /*#__PURE__*/React.createElement("textarea", {
    className: "ch-capture__input",
    rows: 2,
    autoFocus: autoFocus,
    placeholder: PLACEHOLDERS[topic] || "Capture anything…",
    value: text,
    onChange: e => setText(e.target.value),
    onKeyDown: onKey
  }), /*#__PURE__*/React.createElement("div", {
    className: "ch-capture__foot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ch-capture__hint"
  }, listening ? "Listening…" : "⌘ + Enter to save"), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    icon: "plus",
    onClick: submit
  }, "Capture")));
}
Object.assign(__ds_scope, { TOPICS, QuickCapture });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/journal/QuickCapture.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Underline tab bar. */
function Tabs({
  tabs,
  value,
  onChange,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `ch-tabs ${className}`,
    role: "tablist"
  }, rest), tabs.map(tab => {
    const t = typeof tab === "string" ? {
      value: tab,
      label: tab
    } : tab;
    const selected = t.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      type: "button",
      role: "tab",
      "aria-selected": selected,
      className: "ch-tab",
      onClick: () => onChange && onChange(t.value)
    }, t.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: t.icon
    }), t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
      className: "ch-tab__count"
    }, t.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/desktop/app.jsx
try { (() => {
// Forward each DS component to the live namespace at render time, so the
// standalone bundle's script-ordering/transform timing can never leave them
// undefined (reads window.ChroniclesDesignSystem_cefe3d on every render).
const _ns = () => window.ChroniclesDesignSystem_cefe3d || {};
const Icon = p => React.createElement(_ns().Icon, p);
const IconButton = p => React.createElement(_ns().IconButton, p);
const BulletEntry = p => React.createElement(_ns().BulletEntry, p);
const QuickCapture = p => React.createElement(_ns().QuickCapture, p);
const Avatar = p => React.createElement(_ns().Avatar, p);
const Button = p => React.createElement(_ns().Button, p);
const Tooltip = p => React.createElement(_ns().Tooltip, p);
const Switch = p => React.createElement(_ns().Switch, p);
const {
  useState,
  useEffect
} = React;

/* ── Seed ───────────────────────────────────────────────── */
const seed = {
  tasks: [{
    id: 1,
    text: "Send weekly review to team",
    done: true,
    time: "08:40"
  }, {
    id: 2,
    text: "Book dentist appointment",
    done: false,
    priority: true
  }, {
    id: 3,
    text: "Draft Q3 goals",
    done: false
  }, {
    id: 4,
    text: "30 min walk",
    done: false,
    time: "18:00"
  }],
  events: [{
    id: 10,
    text: "Lunch with Sam",
    time: "12:30"
  }, {
    id: 11,
    text: "1:1 with Priya",
    time: "15:00"
  }, {
    id: 12,
    text: "Design crit",
    time: "THU 10:00"
  }],
  journal: [{
    id: 20,
    text: "Woke up clearheaded — the early walk helps more than I admit.",
    time: "JUN 17"
  }, {
    id: 21,
    text: "Felt genuinely proud finishing the proposal.",
    time: "JUN 16"
  }],
  goals: [{
    id: 30,
    text: "Read 24 books this year",
    sub: "14 of 24 — on track",
    priority: true
  }, {
    id: 31,
    text: "Run a half marathon",
    sub: "Week 6 of 12"
  }],
  shopping: [{
    id: 40,
    text: "Olive oil",
    done: false
  }, {
    id: 41,
    text: "Lemons",
    done: true
  }, {
    id: 42,
    text: "Greek yogurt",
    done: false
  }]
};

/* ── Flat section — hairline + label + content, NO border box ── */
function Sec({
  icon,
  label,
  action,
  children,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: accent ? "2px solid var(--color-accent)" : "1px solid var(--border-subtle)",
      background: accent ? "var(--color-accent-subtle)" : "transparent",
      paddingBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 0 6px"
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 12,
    style: {
      color: accent ? "var(--color-accent)" : "var(--text-tertiary)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: accent ? "var(--color-accent)" : "var(--text-tertiary)",
      flex: 1
    }
  }, label), action && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, action)), children);
}

/* ── Stat row (for medication/meal/weather data) ────────── */
function StatRow({
  icon,
  label,
  value,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 13.5,
      color: "var(--text-secondary)"
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 13,
    style: {
      color: accent ? "var(--color-accent)" : "var(--text-tertiary)"
    }
  }), label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: accent ? "var(--color-accent)" : "var(--text-primary)"
    }
  }, value));
}

/* ── Sidebar nav ────────────────────────────────────────── */
function NavRow({
  icon,
  label,
  count,
  active,
  onClick,
  dark
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      width: "100%",
      padding: "8px 14px",
      border: "none",
      cursor: "pointer",
      textAlign: "left",
      background: active ? "var(--color-accent)" : "transparent",
      color: active ? "#fff" : dark ? "#a0a0a8" : "var(--text-secondary)",
      fontFamily: "var(--font-sans)",
      fontSize: 13.5,
      fontWeight: active ? 600 : 400
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15,
    strokeWidth: active ? 2.2 : 1.8
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, label), count > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      opacity: 0.65
    }
  }, count));
}
function NavSection({
  label,
  children,
  defaultOpen = false,
  dark
}) {
  const [open, setOpen] = useState(defaultOpen);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      width: "100%",
      padding: "7px 14px 5px",
      border: "none",
      background: "transparent",
      borderTop: "1px solid var(--border-subtle)",
      marginTop: 2,
      cursor: "pointer",
      fontFamily: "var(--font-label)",
      fontSize: 9.5,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: dark ? "#666" : "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: open ? "chevron-down" : "chevron-right",
    size: 9
  }), label), open && /*#__PURE__*/React.createElement("div", null, children));
}
function Sidebar({
  view,
  setView,
  dark
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 228,
      flex: "none",
      background: dark ? "#13151e" : "#ffffff",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 16px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--color-accent)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 32 32",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M16 6L26 16L16 26L6 16Z",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "16",
    r: "3.6",
    fill: "currentColor"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 14,
      fontWeight: 300,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: dark ? "#e5e5e5" : "var(--text-primary)"
    }
  }, "Chronicles"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 12px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      border: "1px solid var(--border-subtle)",
      padding: "5px 10px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 13,
    style: {
      color: "var(--text-tertiary)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--text-tertiary)",
      fontFamily: "var(--font-sans)"
    }
  }, "Search \u2318K"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      paddingTop: 4,
      color: dark ? "#ccc" : "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement(NavRow, {
    icon: "layout-grid",
    label: "Dashboard",
    active: view === "dashboard",
    onClick: () => setView("dashboard"),
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "book",
    label: "Journal",
    active: view === "journal",
    onClick: () => setView("journal"),
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "calendar",
    label: "Calendar",
    active: view === "calendar",
    onClick: () => setView("calendar"),
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "tag",
    label: "Topics",
    active: view === "topics",
    onClick: () => setView("topics"),
    dark: dark
  }), /*#__PURE__*/React.createElement(NavSection, {
    label: "Planning",
    dark: dark
  }, /*#__PURE__*/React.createElement(NavRow, {
    icon: "trophy",
    label: "Goals",
    active: view === "goals",
    onClick: () => setView("goals"),
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "check-circle",
    label: "Tasks",
    active: view === "tasks",
    onClick: () => setView("tasks"),
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "list",
    label: "Milestones",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "list",
    label: "Todos",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "calendar",
    label: "Menu Planner",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "list",
    label: "Shopping Lists",
    active: view === "shopping",
    onClick: () => setView("shopping"),
    dark: dark
  })), /*#__PURE__*/React.createElement(NavSection, {
    label: "Health",
    dark: dark
  }, /*#__PURE__*/React.createElement(NavRow, {
    icon: "calendar",
    label: "Schedule",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "pill",
    label: "Medications",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "utensils",
    label: "Meals",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "activity",
    label: "Symptoms",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "activity",
    label: "Exercise",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "activity",
    label: "Allergies",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "activity",
    label: "Reports",
    active: false,
    onClick: () => {},
    dark: dark
  })), /*#__PURE__*/React.createElement(NavSection, {
    label: "Inspiration",
    dark: dark
  }, /*#__PURE__*/React.createElement(NavRow, {
    icon: "quote",
    label: "Quotes",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "sparkles",
    label: "Ideas",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "activity",
    label: "Music",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "book",
    label: "Books",
    active: false,
    onClick: () => {},
    dark: dark
  }), /*#__PURE__*/React.createElement(NavRow, {
    icon: "activity",
    label: "TV/Movies",
    active: false,
    onClick: () => {},
    dark: dark
  })), /*#__PURE__*/React.createElement(NavSection, {
    label: "Settings",
    dark: dark
  }, /*#__PURE__*/React.createElement(NavRow, {
    icon: "settings",
    label: "Preferences",
    active: view === "settings",
    onClick: () => setView("settings"),
    dark: dark
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 14px",
      borderTop: "1px solid var(--border-subtle)",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Maya Okonkwo",
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 500,
      color: "var(--text-primary)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, "Maya Okonkwo"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 9.5,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, "284-day streak"))));
}

/* ── Week strip ─────────────────────────────────────────── */
function WeekStrip() {
  const days = ["M", "T", "W", "T", "F", "S", "S"],
    nums = [15, 16, 17, 18, 19, 20, 21],
    today = 2;
  const [sel, setSel] = useState(today);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 2
    }
  }, days.map((d, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setSel(i),
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      padding: "7px 0",
      border: "none",
      cursor: "pointer",
      background: sel === i ? "var(--color-accent)" : "transparent",
      color: sel === i ? "#fff" : "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 9,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontWeight: 700
    }
  }, d), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 16,
      fontWeight: 300
    }
  }, nums[i]))));
}

/* ── Dashboard ───────────────────────────────────────────── */
function Dashboard({
  data,
  setData,
  capture,
  dark
}) {
  const [mood, setMood] = useState(2);
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [cycle, setCycle] = useState(0);
  const moods = ["😞", "😐", "🙂", "😊"];
  const toggle = id => setData(d => ({
    ...d,
    tasks: d.tasks.map(t => t.id === id ? {
      ...t,
      done: !t.done
    } : t)
  }));
  const doneCount = data.tasks.filter(t => t.done).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 32px 60px",
      maxWidth: 1320,
      color: dark ? "#e5e5e5" : "var(--text-primary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 28,
      marginBottom: 28,
      borderBottom: "2px solid var(--color-accent)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 88,
      fontWeight: 200,
      color: dark ? "#e5e5e5" : "var(--text-primary)",
      margin: 0,
      lineHeight: 1,
      letterSpacing: "-0.02em"
    }
  }, "18"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginBottom: 6,
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: dark ? "#888" : "var(--text-tertiary)"
    }
  }, "Wednesday \xB7 June"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 14,
      fontStyle: "italic",
      color: dark ? "#999" : "var(--text-secondary)",
      margin: 0,
      lineHeight: 1.4
    }
  }, "The only way out is through"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sun",
    size: 30,
    strokeWidth: 2.4,
    style: {
      color: "var(--color-accent)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 30,
      fontWeight: 200,
      lineHeight: 1,
      color: dark ? "#e5e5e5" : "var(--text-primary)"
    }
  }, "72\xB0"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: dark ? "#888" : "var(--text-tertiary)",
      marginTop: 4
    }
  }, "Sunny \xB7 Austin"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: 24,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 12,
      background: dark ? "#1b1d26" : "#ffffff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 0 10px"
    }
  }, /*#__PURE__*/React.createElement("select", {
    style: {
      padding: "7px 28px 7px 12px",
      border: "1px solid var(--border-subtle)",
      background: dark ? "#252834" : "#fafafa",
      color: dark ? "#e5e5e5" : "var(--text-primary)",
      fontFamily: "var(--font-sans)",
      fontSize: 13.5,
      borderRadius: 0,
      cursor: "pointer",
      appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 9px center"
    }
  }, /*#__PURE__*/React.createElement("option", null, "No Topic"), /*#__PURE__*/React.createElement("option", null, "Journal"), /*#__PURE__*/React.createElement("option", null, "Task"), /*#__PURE__*/React.createElement("option", null, "Event"), /*#__PURE__*/React.createElement("option", null, "Quote"), /*#__PURE__*/React.createElement("option", null, "Meal"), /*#__PURE__*/React.createElement("option", null, "Goal"))), /*#__PURE__*/React.createElement("textarea", {
    placeholder: "What's one thing you could let go of today?",
    style: {
      width: "100%",
      minHeight: 130,
      resize: "none",
      boxSizing: "border-box",
      padding: "16px 2px",
      border: "none",
      borderBottom: "1px solid var(--border-subtle)",
      borderRadius: 0,
      background: "transparent",
      color: dark ? "#e5e5e5" : "var(--text-primary)",
      fontFamily: "var(--font-display)",
      fontSize: 17,
      fontStyle: "italic",
      lineHeight: 1.5,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: -8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      marginLeft: -6
    }
  }, /*#__PURE__*/React.createElement("button", {
    "aria-label": "Voice",
    style: {
      width: 30,
      height: 30,
      border: "none",
      borderRadius: 0,
      background: "transparent",
      color: dark ? "#e5e5e5" : "var(--text-secondary)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mic",
    size: 17,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Format",
    style: {
      width: 30,
      height: 30,
      border: "none",
      borderRadius: 0,
      background: "transparent",
      color: dark ? "#e5e5e5" : "var(--text-secondary)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil",
    size: 17,
    strokeWidth: 2
  }))), /*#__PURE__*/React.createElement("button", {
    style: {
      padding: "5px 20px",
      border: "1px solid var(--color-accent)",
      borderRadius: 999,
      background: "transparent",
      color: "var(--color-accent)",
      fontFamily: "var(--font-label)",
      fontSize: 11,
      fontWeight: 600,
      cursor: "pointer",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      marginTop: 12,
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13,
    strokeWidth: 2.5
  }), " Capture"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      paddingBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "10px 0 8px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle",
    size: 12,
    style: {
      color: "var(--text-tertiary)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      flex: 1
    }
  }, "Tasks"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, doneCount, " of ", data.tasks.length)), /*#__PURE__*/React.createElement("div", null, data.tasks.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 0",
      borderBottom: "1px solid " + (dark ? "#333" : "var(--border-subtle)")
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => toggle(t.id),
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none",
      padding: 0,
      color: "var(--color-accent)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.done ? "check-circle" : "circle",
    size: 18,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: dark ? "#e5e5e5" : "var(--text-primary)",
      flex: 1,
      textDecoration: t.done ? "line-through" : "none",
      opacity: t.done ? 0.6 : 1
    }
  }, t.text))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      paddingBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "10px 0 8px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 12,
    style: {
      color: "var(--text-tertiary)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      flex: 1
    }
  }, "Upcoming")), /*#__PURE__*/React.createElement("div", null, [{
    day: "20",
    mon: "JUN",
    text: "Meet Sam for Lunch",
    when: "Sat · 7:00 PM"
  }, {
    day: "26",
    mon: "JUN",
    text: "Bookclub",
    when: "Fri · 7:10 PM"
  }, {
    day: "12",
    mon: "JUL",
    text: "Brunch with d",
    when: "Sun · 10:34 PM"
  }, {
    day: "24",
    mon: "JUL",
    text: "Heroines club rose in chains",
    when: "Fri · 10:39 PM"
  }, {
    day: "31",
    mon: "JUL",
    text: "LSDREAM and Lightcode",
    when: "Fri · 10:00 PM"
  }].map((e, i, arr) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: "48px 1fr",
      alignItems: "start",
      gap: 16,
      padding: "14px 0",
      borderBottom: i < arr.length - 1 ? "1px dashed " + (dark ? "#333" : "var(--border-subtle)") : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 300,
      fontSize: 26,
      lineHeight: 1,
      color: dark ? "#e5e5e5" : "var(--text-primary)",
      letterSpacing: "-0.01em"
    }
  }, e.day), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      marginTop: 4
    }
  }, e.mon)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: dark ? "#e5e5e5" : "var(--text-primary)",
      lineHeight: 1.3,
      marginBottom: 5
    }
  }, e.text), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, e.when))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      paddingBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "10px 0 8px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "heart",
    size: 12,
    style: {
      color: "var(--text-tertiary)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      flex: 1
    }
  }, "Wellness Checks")), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 8,
      paddingBottom: 8,
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      display: "block",
      marginBottom: 6
    }
  }, "Water"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      alignItems: "center"
    }
  }, [...Array(8)].map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setWater(water === i + 1 ? i : i + 1),
    style: {
      width: 16,
      height: 16,
      padding: 0,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: i < water ? "var(--color-accent)" : "var(--text-tertiary)",
      transition: "color 0.1s"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "droplet",
    size: 14,
    strokeWidth: 2.4
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-secondary)",
      marginLeft: 8
    }
  }, water, "/8"))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 8,
      paddingBottom: 8,
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      display: "block",
      marginBottom: 6
    }
  }, "Mood"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, ["mood-1", "mood-2", "mood-3", "mood-4", "mood-5"].map((icon, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setMood(mood === i ? -1 : i),
    style: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      padding: 0,
      color: mood === i ? "var(--color-accent)" : "var(--text-tertiary)",
      transition: "color 0.1s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 22,
    strokeWidth: 2.2
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 8,
      paddingBottom: 8,
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      display: "block",
      marginBottom: 6
    }
  }, "Sleep"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      alignItems: "center"
    }
  }, [...Array(10)].map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setSleep(sleep === i + 1 ? i : i + 1),
    style: {
      width: 16,
      height: 16,
      padding: 0,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: i < sleep ? "var(--color-accent)" : "var(--text-tertiary)",
      transition: "color 0.1s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "moon",
    size: 14,
    strokeWidth: 2.4
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-secondary)",
      marginLeft: 8
    }
  }, sleep ? sleep + "h" : "—"))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      display: "block",
      marginBottom: 6
    }
  }, "Cycle"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      alignItems: "center",
      marginBottom: 6
    }
  }, [...Array(4)].map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setCycle(cycle === i + 1 ? i : i + 1),
    style: {
      width: 16,
      height: 16,
      padding: 0,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: i < cycle ? "var(--color-accent)" : "var(--text-tertiary)",
      transition: "color 0.1s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "droplet",
    size: 14,
    strokeWidth: 2.4
  })))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-secondary)",
      fontStyle: "italic"
    }
  }, "Predicted Period - June 26th"))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      paddingBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "10px 0 8px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pill",
    size: 12,
    style: {
      color: "var(--text-tertiary)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      flex: 1
    }
  }, "Medications")), /*#__PURE__*/React.createElement("div", null, [{
    name: "Vitamin D",
    time: "8:00 AM",
    taken: true
  }, {
    name: "Omega-3",
    time: "12:00 PM",
    taken: true
  }, {
    name: "Magnesium",
    time: "9:00 PM",
    taken: false
  }].map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: "1px solid " + (dark ? "#333" : "var(--border-subtle)")
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: dark ? "#e5e5e5" : "var(--text-primary)"
    }
  }, m.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-tertiary)"
    }
  }, m.time)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--color-accent)",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: m.taken ? "check-circle" : "circle",
    size: 18,
    strokeWidth: 2
  })))))))));
}

/* ── Journal view ────────────────────────────────────────── */
/* Month grid for the journal rail */
function MonthCal({
  selected = 17,
  dotted = []
}) {
  // June 2026 — the 1st is a Monday, 30 days.
  const days = Array.from({
    length: 30
  }, (_, i) => i + 1);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--text-secondary)"
    }
  }, "June 2026"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-left",
    size: 14,
    style: {
      color: "var(--text-tertiary)"
    }
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 14,
    style: {
      color: "var(--text-tertiary)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 2,
      marginBottom: 4
    }
  }, ["M", "T", "W", "T", "F", "S", "S"].map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: "center",
      fontFamily: "var(--font-label)",
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.06em",
      color: "var(--text-tertiary)",
      padding: "2px 0"
    }
  }, d))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 2
    }
  }, days.map(d => {
    const on = d === selected;
    return /*#__PURE__*/React.createElement("div", {
      key: d,
      style: {
        position: "relative",
        aspectRatio: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11.5,
        cursor: "pointer",
        background: on ? "var(--color-accent)" : "transparent",
        color: on ? "#fff" : "var(--text-secondary)",
        fontWeight: on ? 600 : 400
      }
    }, d, dotted.includes(d) && !on && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        bottom: 3,
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: "var(--color-accent)"
      }
    }));
  })));
}
function JournalView({
  data,
  setData,
  dark
}) {
  const TOPIC = {
    journal: "var(--color-accent)",
    task: "#d97706",
    event: "#2563eb",
    goal: "#65a30d",
    quote: "#9333ea",
    meal: "#e11d48"
  };
  const entries = [{
    id: 1,
    day: "17",
    weekday: "Wednesday",
    date: "Wednesday, June 17, 2026",
    time: "9:10 AM",
    type: "journal",
    tag: "Journal",
    list: "The early walk",
    listSub: "Trying to make it the default, not the exception",
    title: "The early walk",
    lead: "Woke up clearheaded — the early walk helps more than I admit.",
    body: ["There's a version of the day that starts with movement and light, and a version that starts with a screen. They are not the same day, and I keep proving it to myself and forgetting by the next morning.", "Writing it down so tomorrow-me has fewer excuses. The hard part was never the walking — it was the ten minutes before, deciding."],
    bullets: ["Out the door before 7:00", "Phone stays on the counter", "Coffee after, not before"]
  }, {
    id: 2,
    day: "17",
    weekday: "Wednesday",
    date: "Wednesday, June 17, 2026",
    time: "12:30 PM",
    type: "event",
    tag: "Event",
    list: "Lunch with Sam",
    listSub: "Riverside Café · 12:30 PM",
    title: "Lunch with Sam",
    lead: "Caught up over the grain bowls. Good to hear the new role is settling.",
    body: ["Sam mentioned the reading group restarts in July — said I'd come. Note to self: actually finish the book this time."],
    bullets: ["Bring the annotated copy", "Ask about the Lisbon trip"]
  }, {
    id: 3,
    day: "17",
    weekday: "Wednesday",
    date: "Wednesday, June 17, 2026",
    time: "9:00 PM",
    type: "goal",
    tag: "Goal",
    list: "Read 24 books this year",
    listSub: "14 of 24 — on track",
    title: "Read 24 books this year",
    lead: "Fourteen down. Comfortably on pace if I keep the nightly half-hour.",
    body: ["The streak matters more than the page count. Even five pages keeps the habit warm."],
    bullets: ["Half hour before bed", "No new book until the current one is finished"]
  }, {
    id: 4,
    day: "16",
    weekday: "Tuesday",
    date: "Tuesday, June 16, 2026",
    time: "9:18 PM",
    type: "journal",
    tag: "Journal",
    list: "Finished the proposal",
    listSub: "Momentum matters more than mood",
    title: "Finished the proposal",
    lead: "Felt genuinely proud finishing the proposal tonight.",
    body: ["Momentum matters more than mood. I didn't feel like starting and did it anyway, and somewhere around the second section the resistance just dissolved."],
    bullets: ["Send for review Thursday", "Block Friday morning for edits"]
  }, {
    id: 5,
    day: "16",
    weekday: "Tuesday",
    date: "Tuesday, June 16, 2026",
    time: "7:30 PM",
    type: "meal",
    tag: "Meal",
    list: "Roast chicken",
    listSub: "Lemon potatoes, greens",
    title: "Roast chicken, lemon potatoes",
    lead: "Simple and good. The lemon under the skin made the difference.",
    body: ["Enough left for tomorrow's lunch. Keeping this one in rotation."],
    bullets: ["More garlic next time", "Rest it longer before carving"]
  }];
  const [sel, setSel] = useState(1);
  const active = entries.find(e => e.id === sel) || entries[0];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100%",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 312,
      flex: "none",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 999,
      background: "var(--bg-sunken)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 14,
    style: {
      color: "var(--text-tertiary)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search or filter",
    style: {
      flex: 1,
      border: "none",
      background: "transparent",
      outline: "none",
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      color: "var(--text-primary)"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      minHeight: 0
    }
  }, entries.map(e => {
    const on = e.id === sel;
    return /*#__PURE__*/React.createElement("button", {
      key: e.id,
      onClick: () => setSel(e.id),
      style: {
        display: "grid",
        gridTemplateColumns: "3px 1fr auto",
        gap: 12,
        alignItems: "start",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        border: "none",
        padding: "13px 18px 13px 0",
        background: on ? "var(--bg-active)" : "transparent",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 3,
        alignSelf: "stretch",
        background: on ? TOPIC[e.type] : "transparent"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 13.5,
        fontWeight: 500,
        color: "var(--text-primary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, e.list), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 11.5,
        color: "var(--text-tertiary)",
        marginTop: 3,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, e.listSub)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-label)",
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: on ? TOPIC[e.type] : "var(--text-tertiary)",
        whiteSpace: "nowrap",
        paddingTop: 1
      }
    }, e.time));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("article", {
    style: {
      maxWidth: 680,
      padding: "34px 40px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 16,
      marginBottom: 22,
      paddingTop: 26,
      borderTop: "2px solid var(--color-accent)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 72,
      fontWeight: 200,
      lineHeight: 0.82,
      letterSpacing: "-0.02em",
      color: "var(--text-primary)"
    }
  }, active.day), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      paddingBottom: 8
    }
  }, active.weekday)), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 38,
      fontWeight: 200,
      letterSpacing: "-0.01em",
      lineHeight: 1.1,
      color: "var(--text-primary)",
      margin: "0 0 12px"
    }
  }, active.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 28,
      paddingTop: 16,
      paddingBottom: 20,
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("select", {
    defaultValue: active.tag,
    key: active.id,
    className: "ch-topic-picker",
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--text-primary)",
      border: "1px solid transparent",
      borderRadius: 999,
      padding: "5px 22px 5px 13px",
      background: "transparent",
      cursor: "pointer",
      appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 4px center"
    }
  }, /*#__PURE__*/React.createElement("option", null, "Journal"), /*#__PURE__*/React.createElement("option", null, "Task"), /*#__PURE__*/React.createElement("option", null, "Event"), /*#__PURE__*/React.createElement("option", null, "Goal"), /*#__PURE__*/React.createElement("option", null, "Quote"), /*#__PURE__*/React.createElement("option", null, "Meal")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 6
    }
  }, [{
    icon: "bookmark",
    label: "Bookmark"
  }, {
    icon: "share",
    label: "Share"
  }, {
    icon: "mic",
    label: "Voice note"
  }, {
    icon: "pencil",
    label: "Format"
  }, {
    icon: "trash",
    label: "Delete",
    muted: true
  }].map(b => /*#__PURE__*/React.createElement("button", {
    key: b.icon,
    "aria-label": b.label,
    title: b.label,
    className: "ch-entry-action",
    style: {
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid transparent",
      borderRadius: 4,
      background: "transparent",
      cursor: "pointer",
      color: b.muted ? "var(--text-tertiary)" : "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: b.icon,
    size: 16,
    strokeWidth: 2
  }))))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 21,
      fontWeight: 300,
      fontStyle: "italic",
      lineHeight: 1.5,
      color: "var(--text-primary)",
      margin: "0 0 22px"
    }
  }, active.lead), active.body.map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i,
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 15,
      lineHeight: 1.75,
      color: "var(--text-secondary)",
      margin: "0 0 18px"
    }
  }, p)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 26
    }
  }, active.bullets.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 14,
      padding: "9px 0",
      borderBottom: i < active.bullets.length - 1 ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: "var(--color-accent)",
      flex: "none",
      transform: "translateY(-2px)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: "var(--text-primary)",
      lineHeight: 1.5
    }
  }, b)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 22,
      padding: "13px 40px",
      borderTop: "1px solid var(--border-subtle)",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontFamily: "var(--font-label)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, "Discard changes"), /*#__PURE__*/React.createElement("button", {
    style: {
      border: "1px solid var(--color-accent)",
      background: "transparent",
      borderRadius: 999,
      cursor: "pointer",
      padding: "7px 22px",
      fontFamily: "var(--font-label)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--color-accent)"
    }
  }, "Save entry"))));
}

/* ── Calendar view ───────────────────────────────────────── */
function CalendarView() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 32px 60px",
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginBottom: 6,
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, "June 2026"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 42,
      fontWeight: 200,
      letterSpacing: "-0.01em",
      color: "var(--text-primary)",
      margin: "0 0 18px"
    }
  }, "Wednesday, 17"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(WeekStrip, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(BulletEntry, {
    type: "event",
    text: "Standup",
    time: "09:00"
  }), /*#__PURE__*/React.createElement(BulletEntry, {
    type: "event",
    text: "Lunch with Sam",
    time: "12:30"
  }), /*#__PURE__*/React.createElement(BulletEntry, {
    type: "event",
    text: "1:1 with Priya",
    time: "15:00"
  }), /*#__PURE__*/React.createElement(BulletEntry, {
    type: "task",
    text: "Submit timesheet",
    time: "EOD",
    priority: true
  })));
}

/* ── Topics view ─────────────────────────────────────────── */
function TopicsView() {
  const topics = [{
    id: 1,
    icon: "feather",
    name: "Journal",
    count: 84
  }, {
    id: 2,
    icon: "check-circle",
    name: "Task",
    count: 212
  }, {
    id: 3,
    icon: "calendar",
    name: "Event",
    count: 47
  }, {
    id: 4,
    icon: "trophy",
    name: "Goal",
    count: 14
  }, {
    id: 5,
    icon: "utensils",
    name: "Meal",
    count: 91
  }, {
    id: 6,
    icon: "quote",
    name: "Quote",
    count: 31
  }, {
    id: 7,
    icon: "pill",
    name: "Medication",
    count: 28
  }, {
    id: 8,
    icon: "heart",
    name: "Wellness",
    count: 55
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 32px 60px",
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginBottom: 6,
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, topics.length, " topics"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 42,
      fontWeight: 200,
      letterSpacing: "-0.01em",
      color: "var(--text-primary)",
      margin: "0 0 22px"
    }
  }, "Topics"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)"
    }
  }, topics.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon,
    size: 17,
    style: {
      color: "var(--color-accent)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: "var(--text-primary)",
      flex: 1,
      fontWeight: 500
    }
  }, t.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 9.5,
      fontWeight: 700,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, t.count, " entries"), /*#__PURE__*/React.createElement(IconButton, {
    icon: "chevron-right",
    size: "sm",
    "aria-label": "Open"
  })))));
}

/* ── Goals view ──────────────────────────────────────────── */
function GoalsView({
  data
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 32px 60px",
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginBottom: 6,
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, data.goals.length, " goals"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 42,
      fontWeight: 200,
      letterSpacing: "-0.01em",
      color: "var(--text-primary)",
      margin: "0 0 22px"
    }
  }, "Goals"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)"
    }
  }, data.goals.map(e => /*#__PURE__*/React.createElement(BulletEntry, {
    key: e.id,
    type: "goal",
    text: e.text,
    sub: e.sub,
    priority: e.priority
  }))));
}

/* ── Shopping view ───────────────────────────────────────── */
function ShoppingView({
  data,
  setData
}) {
  const toggle = id => setData(d => ({
    ...d,
    shopping: d.shopping.map(s => s.id === id ? {
      ...s,
      done: !s.done
    } : s)
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 32px 60px",
      maxWidth: 720
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginBottom: 6,
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, data.shopping.length, " items"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 42,
      fontWeight: 200,
      letterSpacing: "-0.01em",
      color: "var(--text-primary)",
      margin: "0 0 22px"
    }
  }, "Shopping"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)"
    }
  }, data.shopping.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 0",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => toggle(s.id),
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none",
      padding: 0,
      color: "var(--color-accent)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.done ? "check-circle" : "circle",
    size: 18,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: "var(--text-primary)",
      flex: 1,
      textDecoration: s.done ? "line-through" : "none",
      opacity: s.done ? 0.6 : 1
    }
  }, s.text)))));
}
function SettingsView({
  dark,
  setDark
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 32px 60px",
      maxWidth: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginBottom: 6,
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, "Preferences"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 42,
      fontWeight: 200,
      letterSpacing: "-0.01em",
      color: "var(--text-primary)",
      margin: "0 0 24px"
    }
  }, "Settings"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)"
    }
  }, [{
    label: "Dark mode",
    hint: "Switch between light and dark theme",
    control: /*#__PURE__*/React.createElement(Switch, {
      label: "",
      checked: dark,
      onChange: e => setDark(e.target.checked)
    })
  }, {
    label: "Accent color",
    hint: "Personalize your theme color",
    control: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, ["teal", "ink", "rose", "amber", "sage", "denim"].map(a => /*#__PURE__*/React.createElement("button", {
      key: a,
      onClick: () => {
        document.documentElement.dataset.accent = a;
      },
      style: {
        width: 22,
        height: 22,
        border: "none",
        cursor: "pointer",
        borderRadius: "50%",
        background: {
          teal: "#0d9488",
          ink: "#4f46e5",
          rose: "#e11d48",
          amber: "#d97706",
          sage: "#65a30d",
          denim: "#2563eb"
        }[a]
      }
    })))
  }, {
    label: "Daily reminder",
    hint: "Remind me to journal at 8:00 AM",
    control: /*#__PURE__*/React.createElement(Switch, {
      label: "",
      defaultChecked: true
    })
  }, {
    label: "Background image",
    hint: "Choose a background for the journal canvas",
    control: /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--text-tertiary)"
      }
    }, "None")
  }].map((row, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: "16px 0",
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text-primary)"
    }
  }, row.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-tertiary)",
      marginTop: 2
    }
  }, row.hint)), row.control))));
}

/* ── App ─────────────────────────────────────────────────── */
function App() {
  const [view, setView] = useState(window.CHRONICLES_VIEW || "dashboard");
  const [data, setData] = useState(seed);
  const [dark, setDark] = useState(window.CHRONICLES_THEME !== "light");
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "";
    if (!document.documentElement.dataset.accent) document.documentElement.dataset.accent = "teal";
  }, [dark]);
  const capture = ({
    type,
    text
  }) => setData(d => ({
    ...d,
    journal: [{
      id: Date.now(),
      text,
      time: "Now"
    }, ...d.journal]
  }));
  const LABELS = {
    dashboard: "Dashboard",
    journal: "Journal",
    calendar: "Calendar",
    topics: "Topics",
    goals: "Goals",
    settings: "Settings",
    shopping: "Shopping Lists",
    tasks: "Tasks"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: dark ? "#1b1d26" : "#ffffff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: "var(--color-accent)",
      zIndex: 200
    }
  }), /*#__PURE__*/React.createElement(Sidebar, {
    view: view,
    setView: setView,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      paddingTop: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      height: 44,
      borderBottom: "1px solid var(--border-subtle)",
      flex: "none",
      background: dark ? "#1b1d26" : "#ffffff"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, LABELS[view] || view)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      background: dark ? "#1b1d26" : "#ffffff"
    }
  }, view === "dashboard" && /*#__PURE__*/React.createElement(Dashboard, {
    data: data,
    setData: setData,
    capture: capture,
    dark: dark
  }), view === "shopping" && /*#__PURE__*/React.createElement(ShoppingView, {
    data: data,
    setData: setData
  }), view === "journal" && /*#__PURE__*/React.createElement(JournalView, {
    data: data,
    setData: setData,
    dark: dark
  }), view === "calendar" && /*#__PURE__*/React.createElement(CalendarView, null), view === "topics" && /*#__PURE__*/React.createElement(TopicsView, null), view === "goals" && /*#__PURE__*/React.createElement(GoalsView, {
    data: data
  }), view === "settings" && /*#__PURE__*/React.createElement(SettingsView, {
    dark: dark,
    setDark: setDark
  }))));
}
const chStyle = document.createElement("style");
chStyle.textContent = ".ch-topic-picker:hover, .ch-entry-action:hover { border-color: var(--border-strong) !important; } .ch-entry-action:hover { background: var(--bg-active) !important; }";
document.head.appendChild(chStyle);
function chMount() {
  const ns = window.ChroniclesDesignSystem_cefe3d;
  if (!ns || !ns.Icon) {
    return setTimeout(chMount, 20);
  }
  if (window.__chDesktopMounted) {
    return;
  }
  window.__chDesktopMounted = true;
  ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
}
chMount();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/desktop/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile/app.jsx
try { (() => {
const {
  Icon,
  IconButton,
  BulletEntry,
  Avatar
} = window.ChroniclesDesignSystem_cefe3d;
const {
  useState,
  useEffect
} = React;

/* ── Seed ───────────────────────────────────────────────── */
const seedData = {
  tasks: [{
    id: 1,
    text: "Send weekly review",
    done: true
  }, {
    id: 2,
    text: "Book dentist",
    done: false
  }, {
    id: 3,
    text: "30 min walk",
    done: false
  }],
  events: [{
    day: "20",
    mon: "JUN",
    text: "Meet Sam for Lunch",
    when: "Sat · 7:00 PM"
  }, {
    day: "26",
    mon: "JUN",
    text: "Bookclub",
    when: "Fri · 7:10 PM"
  }, {
    day: "12",
    mon: "JUL",
    text: "Brunch with d",
    when: "Sun · 10:34 AM"
  }],
  journal: [{
    id: 20,
    text: "Woke up clearheaded — the early walk helps more than I admit."
  }, {
    id: 21,
    text: "Felt genuinely proud finishing the proposal."
  }],
  goals: [{
    id: 30,
    text: "Read 24 books this year",
    sub: "14 of 24 — on track",
    priority: true
  }],
  shopping: [{
    id: 40,
    text: "Olive oil",
    done: false
  }, {
    id: 41,
    text: "Lemons",
    done: true
  }]
};

/* ── Eyebrow ────────────────────────────────────────────── */
function Eyebrow({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      ...style
    }
  }, children);
}

/* ── Section — borderless, hairline top rule, eyebrow head ─ */
function Section({
  title,
  icon,
  action,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      padding: "0 20px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      padding: "12px 0 8px"
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 12,
    style: {
      color: "var(--text-tertiary)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      fontSize: 10,
      letterSpacing: "0.18em",
      flex: 1
    }
  }, title), action), children);
}

/* ── Status bar ─────────────────────────────────────────── */
function StatusBar({
  onMenu
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 20px 4px",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-primary)",
      fontFamily: "var(--font-sans)",
      background: "var(--bg-app)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "wifi",
    size: 14
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "battery-full",
    size: 14
  })));
}

/* ── App bar with hamburger ── */
function AppBar({
  onMenu
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "6px 16px 10px",
      background: "var(--bg-app)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onMenu,
    "aria-label": "Menu",
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: 6,
      marginLeft: -6,
      display: "flex",
      color: "var(--text-primary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "menu",
    size: 20,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 18,
      fontWeight: 300,
      letterSpacing: "0.04em",
      color: "var(--text-primary)"
    }
  }, "Chronicles"));
}

/* ── Slide-out nav drawer ── */
function NavDrawer({
  open,
  onClose,
  tab,
  setTab
}) {
  const [sections, setSections] = useState({
    Planning: false,
    Health: false,
    Inspiration: false,
    "Your Topics": false,
    Settings: false
  });
  const toggle = k => setSections(s => ({
    ...s,
    [k]: !s[k]
  }));
  const core = [{
    id: "home",
    icon: "layout-grid",
    label: "Dashboard"
  }, {
    id: "journal",
    icon: "book",
    label: "Journal"
  }, {
    id: "calendar",
    icon: "calendar",
    label: "Calendar"
  }, {
    id: "topics",
    icon: "tag",
    label: "Topics"
  }];
  const groups = {
    Planning: ["Goals", "Milestones", "Tasks", "Todos", "Filters", "Menu Planner", "Shopping Lists"],
    Health: ["Schedule", "Medications", "Meals", "Symptoms", "Exercise", "Allergies", "Reports"],
    Inspiration: ["Quotes", "Ideas", "Music", "Books", "TV / Movies"],
    "Your Topics": ["Morning Pages", "Gratitude", "Travel", "Recipes"],
    Settings: ["Preferences"]
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 60,
      background: "rgba(0,0,0,0.4)",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 268,
      maxWidth: "82%",
      height: "100%",
      background: "var(--bg-sunken)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      animation: "drawerIn 200ms ease-out"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 18px 14px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 20,
      fontWeight: 300,
      letterSpacing: "0.04em",
      color: "var(--text-primary)"
    }
  }, "Chronicles"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: 4,
      display: "flex",
      color: "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 18,
    strokeWidth: 2
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "8px 0 24px"
    }
  }, core.map(it => {
    const on = tab === it.id;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => {
        setTab(it.id);
        onClose();
      },
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        border: "none",
        padding: "11px 18px",
        borderLeft: "3px solid " + (on ? "var(--color-accent)" : "transparent"),
        background: on ? "var(--color-accent)" : "transparent",
        color: on ? "#fff" : "var(--text-secondary)",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 500
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: it.icon,
      size: 17,
      strokeWidth: on ? 2.2 : 1.8,
      style: {
        flex: "none"
      }
    }), it.label);
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: "var(--border-subtle)",
      margin: "8px 18px"
    }
  }), Object.keys(groups).map(g => /*#__PURE__*/React.createElement("div", {
    key: g
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => toggle(g),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      width: "100%",
      textAlign: "left",
      cursor: "pointer",
      border: "none",
      background: "transparent",
      padding: "10px 18px",
      fontFamily: "var(--font-label)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: sections[g] ? "chevron-down" : "chevron-right",
    size: 13,
    style: {
      flex: "none"
    }
  }), g), sections[g] && groups[g].map(item => /*#__PURE__*/React.createElement("button", {
    key: item,
    onClick: onClose,
    style: {
      display: "block",
      width: "100%",
      textAlign: "left",
      cursor: "pointer",
      border: "none",
      background: "transparent",
      padding: "8px 18px 8px 40px",
      fontFamily: "var(--font-sans)",
      fontSize: 13.5,
      color: "var(--text-secondary)"
    }
  }, item)))))));
}

/* ── Week strip ─────────────────────────────────────────── */
function WeekStrip() {
  const days = ["M", "T", "W", "T", "F", "S", "S"],
    nums = [15, 16, 17, 18, 19, 20, 21],
    today = 2;
  const [sel, setSel] = useState(today);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gap: 2
    }
  }, days.map((d, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setSel(i),
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      padding: "7px 0",
      border: "none",
      cursor: "pointer",
      background: sel === i ? "var(--color-accent)" : "transparent",
      color: sel === i ? "#fff" : "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 9,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontWeight: 700
    }
  }, d), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 16,
      fontWeight: 300
    }
  }, nums[i]), i === today && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 3,
      borderRadius: "50%",
      background: sel === i ? "rgba(255,255,255,.7)" : "var(--color-accent)"
    }
  }))));
}

/* ── Quick Entry ────────────────────────────────────────── */
function QuickEntry() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 18px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("select", {
    style: {
      padding: "7px 28px 7px 12px",
      border: "1px solid var(--border-subtle)",
      background: "var(--bg-surface)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-sans)",
      fontSize: 13.5,
      borderRadius: 0,
      cursor: "pointer",
      appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 9px center"
    }
  }, /*#__PURE__*/React.createElement("option", null, "No Topic"), /*#__PURE__*/React.createElement("option", null, "Journal"), /*#__PURE__*/React.createElement("option", null, "Task"), /*#__PURE__*/React.createElement("option", null, "Event"), /*#__PURE__*/React.createElement("option", null, "Quote"), /*#__PURE__*/React.createElement("option", null, "Meal"), /*#__PURE__*/React.createElement("option", null, "Goal"))), /*#__PURE__*/React.createElement("textarea", {
    placeholder: "What's one thing you could let go of today?",
    rows: 2,
    style: {
      width: "100%",
      resize: "none",
      boxSizing: "border-box",
      padding: "8px 2px",
      border: "none",
      borderBottom: "1px solid var(--border-subtle)",
      borderRadius: 0,
      background: "transparent",
      color: "var(--text-primary)",
      fontFamily: "var(--font-display)",
      fontSize: 16,
      fontStyle: "italic",
      lineHeight: 1.5,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: -2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      marginLeft: -6
    }
  }, /*#__PURE__*/React.createElement("button", {
    "aria-label": "Voice",
    style: {
      width: 30,
      height: 30,
      border: "none",
      background: "transparent",
      color: "var(--text-secondary)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mic",
    size: 17,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Format",
    style: {
      width: 30,
      height: 30,
      border: "none",
      background: "transparent",
      color: "var(--text-secondary)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil",
    size: 17,
    strokeWidth: 2
  }))), /*#__PURE__*/React.createElement("button", {
    style: {
      padding: "5px 20px",
      border: "1px solid var(--color-accent)",
      borderRadius: 999,
      background: "transparent",
      color: "var(--color-accent)",
      fontFamily: "var(--font-label)",
      fontSize: 11,
      fontWeight: 600,
      cursor: "pointer",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 13,
    strokeWidth: 2.5
  }), " Capture")));
}

/* ── Wellness checks ────────────────────────────────────── */
function Wellness() {
  const [mood, setMood] = useState(2);
  const [water, setWater] = useState(4);
  const [tog, setTog] = useState({
    sleep: true,
    period: false
  });
  return /*#__PURE__*/React.createElement(Section, {
    title: "Wellness Checks",
    icon: "heart"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 10,
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      fontSize: 9,
      display: "block",
      marginBottom: 7
    }
  }, "Mood"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14
    }
  }, ["mood-1", "mood-2", "mood-3", "mood-4", "mood-5"].map((ic, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setMood(mood === i ? -1 : i),
    style: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      padding: 0,
      display: "flex",
      color: mood === i ? "var(--color-accent)" : "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 22,
    strokeWidth: 2.2
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 0 8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)",
      width: 52
    }
  }, "Water"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5
    }
  }, [...Array(8)].map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setWater(water === i + 1 ? i : i + 1),
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: 0,
      display: "flex",
      color: i < water ? "var(--color-accent)" : "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "droplet",
    size: 15,
    strokeWidth: 2.4
  }))))), [{
    k: "sleep",
    ic: "moon",
    label: "Sleep"
  }, {
    k: "period",
    ic: "droplet",
    label: "Period"
  }].map(r => /*#__PURE__*/React.createElement("button", {
    key: r.k,
    onClick: () => setTog(t => ({
      ...t,
      [r.k]: !t[r.k]
    })),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 0",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      width: "100%",
      color: tog[r.k] ? "var(--color-accent)" : "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.ic,
    size: 15,
    strokeWidth: 2.4
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "inherit"
    }
  }, r.label))));
}

/* ── Dashboard ───────────────────────────────────────────── */
function Home({
  data,
  setData
}) {
  const toggle = id => setData(d => ({
    ...d,
    tasks: d.tasks.map(t => t.id === id ? {
      ...t,
      done: !t.done
    } : t)
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      background: "var(--bg-app)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px 18px",
      borderTop: "2px solid var(--color-accent)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 62,
      fontWeight: 200,
      color: "var(--text-primary)",
      lineHeight: 1,
      letterSpacing: "-0.02em"
    }
  }, "17"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      display: "block",
      marginBottom: 5
    }
  }, "Wednesday \xB7 June"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 13,
      fontStyle: "italic",
      color: "var(--text-secondary)",
      margin: 0,
      lineHeight: 1.4
    }
  }, "The only way out is through"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "sun",
    size: 24,
    strokeWidth: 2.4,
    style: {
      color: "var(--color-accent)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 24,
      fontWeight: 200,
      lineHeight: 1,
      color: "var(--text-primary)"
    }
  }, "72\xB0"), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      fontSize: 8,
      letterSpacing: "0.12em",
      display: "block",
      marginTop: 3
    }
  }, "Sunny"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement(Section, {
    title: "Upcoming",
    icon: "calendar"
  }, data.events.map((e, i, arr) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: "44px 1fr",
      alignItems: "start",
      gap: 14,
      padding: "12px 0",
      borderBottom: i < arr.length - 1 ? "1px dashed var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 300,
      fontSize: 24,
      lineHeight: 1,
      color: "var(--text-primary)"
    }
  }, e.day), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      fontSize: 9,
      letterSpacing: "0.14em",
      display: "block",
      marginTop: 4
    }
  }, e.mon)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      color: "var(--text-primary)",
      lineHeight: 1.3,
      marginBottom: 4
    }
  }, e.text), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      fontSize: 9.5,
      letterSpacing: "0.1em"
    }
  }, e.when))))), /*#__PURE__*/React.createElement(Section, {
    title: "Tasks",
    icon: "check-circle",
    action: /*#__PURE__*/React.createElement(Eyebrow, null, data.tasks.filter(t => t.done).length, "/", data.tasks.length)
  }, data.tasks.map((t, i, arr) => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 0",
      borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => toggle(t.id),
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      padding: 0,
      flex: "none",
      color: "var(--color-accent)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.done ? "check-circle" : "circle",
    size: 18,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--text-primary)",
      flex: 1,
      textDecoration: t.done ? "line-through" : "none",
      opacity: t.done ? 0.6 : 1
    }
  }, t.text)))), /*#__PURE__*/React.createElement(Wellness, null), /*#__PURE__*/React.createElement(Section, {
    title: "Medications",
    icon: "pill",
    action: /*#__PURE__*/React.createElement(Eyebrow, null, "2 left")
  }, [{
    label: "Vitamin D",
    val: "Taken",
    on: true
  }, {
    label: "Magnesium",
    val: "21:00"
  }, {
    label: "Omega-3",
    val: "21:00"
  }].map((r, i, arr) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "7px 0",
      borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: 9,
      fontSize: 13.5,
      color: "var(--text-secondary)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.on ? "check-circle" : "circle",
    size: 16,
    strokeWidth: 2,
    style: {
      color: r.on ? "var(--color-accent)" : "var(--text-tertiary)"
    }
  }), r.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: r.on ? "var(--color-accent)" : "var(--text-primary)"
    }
  }, r.val)))), /*#__PURE__*/React.createElement(Section, {
    title: "Menu Plan",
    icon: "utensils"
  }, [{
    ic: "coffee",
    label: "Breakfast",
    val: "Yogurt & berries"
  }, {
    ic: "utensils",
    label: "Lunch",
    val: "Salmon bowl"
  }, {
    ic: "moon2",
    label: "Dinner",
    val: "Not planned"
  }].map((r, i, arr) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "7px 0",
      borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: 9,
      fontSize: 13.5,
      color: "var(--text-secondary)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.ic,
    size: 14,
    style: {
      color: "var(--text-tertiary)"
    }
  }), r.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-primary)",
      fontWeight: 500
    }
  }, r.val)))), /*#__PURE__*/React.createElement(Section, {
    title: "Affirmation",
    icon: "sparkles"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 16,
      fontStyle: "italic",
      fontWeight: 300,
      color: "var(--text-primary)",
      lineHeight: 1.55,
      margin: "2px 0 0"
    }
  }, "\"Start where you are. Use what you have. Do what you can.\""), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      display: "block",
      marginTop: 8
    }
  }, "Arthur Ashe")), /*#__PURE__*/React.createElement(Section, {
    title: "Mini Calendar",
    icon: "calendar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement(WeekStrip, null)))));
}

/* ── Journal ─────────────────────────────────────────────── */
const TOPIC_COLOR = {
  journal: "var(--color-accent)",
  task: "#c2762e",
  event: "#7a5cc0",
  goal: "#2f8f6b",
  quote: "#b0518f",
  meal: "#3b80c4"
};
const journalEntries = [{
  id: 1,
  day: "17",
  weekday: "WEDNESDAY",
  date: "Wednesday, June 17, 2026",
  time: "9:10 AM",
  type: "journal",
  tag: "Journal",
  title: "The early walk",
  lead: "Woke up clearheaded — the early walk helps more than I admit.",
  body: ["Out the door before the street was awake. The air still cool, that blue half-light. By the time I looped the park the noise in my head had settled into something I could actually work with.", "Kept thinking about the proposal. The shape of it is finally clear."],
  bullets: ["Block 90 min for the rewrite", "Text Dana about Friday", "Refill prescription"]
}, {
  id: 2,
  day: "16",
  weekday: "TUESDAY",
  date: "Tuesday, June 16, 2026",
  time: "8:02 PM",
  type: "goal",
  tag: "Goal",
  title: "24 books this year",
  lead: "14 of 24 — on track, somehow.",
  body: ["Finished the Le Guin tonight. Slower than I wanted but worth every page."],
  bullets: ["Start the next on the list", "Return library holds"]
}, {
  id: 3,
  day: "15",
  weekday: "MONDAY",
  date: "Monday, June 15, 2026",
  time: "7:45 AM",
  type: "quote",
  tag: "Quote",
  title: "On beginnings",
  lead: "\u201CStart where you are. Use what you have. Do what you can.\u201D",
  body: ["Arthur Ashe. Pinned this above the desk."],
  bullets: []
}];
function JournalEditor({
  entry,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 50,
      background: "var(--bg-app)",
      display: "flex",
      flexDirection: "column",
      animation: "sheetUp 220ms ease-out"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "16px 16px 12px",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Back",
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: 6,
      marginLeft: -6,
      display: "flex",
      color: "var(--text-primary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 20,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 4
    }
  }, [{
    icon: "bookmark"
  }, {
    icon: "share"
  }, {
    icon: "trash",
    muted: true
  }].map(b => /*#__PURE__*/React.createElement("button", {
    key: b.icon,
    style: {
      width: 34,
      height: 34,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: b.muted ? "var(--text-tertiary)" : "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: b.icon,
    size: 17,
    strokeWidth: 2
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "0 20px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 14,
      paddingTop: 18,
      marginBottom: 18,
      borderTop: "2px solid var(--color-accent)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 64,
      fontWeight: 200,
      lineHeight: 0.82,
      letterSpacing: "-0.02em",
      color: "var(--text-primary)"
    }
  }, entry.day), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)",
      paddingBottom: 6
    }
  }, entry.weekday)), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 30,
      fontWeight: 200,
      letterSpacing: "-0.01em",
      lineHeight: 1.12,
      color: "var(--text-primary)",
      margin: "0 0 12px"
    }
  }, entry.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "0 0 22px",
      paddingTop: 14,
      paddingBottom: 16,
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("select", {
    defaultValue: entry.tag,
    style: {
      fontFamily: "var(--font-label)",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--text-primary)",
      border: "none",
      borderRadius: 0,
      padding: "3px 22px 3px 0",
      background: "transparent",
      cursor: "pointer",
      appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 4px center"
    }
  }, /*#__PURE__*/React.createElement("option", null, "Journal"), /*#__PURE__*/React.createElement("option", null, "Task"), /*#__PURE__*/React.createElement("option", null, "Event"), /*#__PURE__*/React.createElement("option", null, "Goal"), /*#__PURE__*/React.createElement("option", null, "Quote"), /*#__PURE__*/React.createElement("option", null, "Meal")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("button", {
    "aria-label": "Voice",
    style: {
      width: 32,
      height: 32,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "mic",
    size: 17,
    strokeWidth: 2
  })), /*#__PURE__*/React.createElement("button", {
    "aria-label": "Format",
    style: {
      width: 32,
      height: 32,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pencil",
    size: 17,
    strokeWidth: 2
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 19,
      fontWeight: 300,
      fontStyle: "italic",
      lineHeight: 1.5,
      color: "var(--text-primary)",
      margin: "0 0 20px"
    }
  }, entry.lead), entry.body.map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i,
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 15,
      lineHeight: 1.72,
      color: "var(--text-secondary)",
      margin: "0 0 16px"
    }
  }, p)), entry.bullets.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22
    }
  }, entry.bullets.map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 13,
      padding: "9px 0",
      borderBottom: i < entry.bullets.length - 1 ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: "var(--color-accent)",
      flex: "none",
      transform: "translateY(-2px)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: "var(--text-primary)",
      lineHeight: 1.5
    }
  }, b))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 20,
      padding: "12px 20px 24px",
      borderTop: "1px solid var(--border-subtle)",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontFamily: "var(--font-label)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, "Discard"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      border: "1px solid var(--color-accent)",
      background: "transparent",
      borderRadius: 999,
      cursor: "pointer",
      padding: "7px 22px",
      fontFamily: "var(--font-label)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--color-accent)"
    }
  }, "Save entry")));
}
function JournalTab({
  onOpen
}) {
  const setOpen = onOpen;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      background: "var(--bg-app)",
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 20px 16px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 28,
      fontWeight: 200,
      color: "var(--text-primary)",
      margin: 0
    }
  }, "Journal")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 20px 0"
    }
  }, journalEntries.map((e, i) => /*#__PURE__*/React.createElement("button", {
    key: e.id,
    onClick: () => setOpen(e),
    style: {
      display: "grid",
      gridTemplateColumns: "46px 1fr auto",
      alignItems: "start",
      gap: 14,
      width: "100%",
      textAlign: "left",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: "16px 0",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 300,
      fontSize: 26,
      lineHeight: 1,
      color: "var(--text-primary)"
    }
  }, e.day), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      fontSize: 9,
      letterSpacing: "0.12em",
      display: "block",
      marginTop: 4
    }
  }, e.weekday.slice(0, 3))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: TOPIC_COLOR[e.type],
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      fontSize: 9,
      letterSpacing: "0.14em"
    }
  }, e.tag)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 17,
      fontWeight: 300,
      color: "var(--text-primary)",
      lineHeight: 1.25,
      marginBottom: 3
    }
  }, e.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-tertiary)",
      lineHeight: 1.4,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, e.lead)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 16,
    style: {
      color: "var(--text-tertiary)",
      marginTop: 4
    }
  })))));
}

/* ── Calendar ────────────────────────────────────────────── */
function CalendarTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      background: "var(--bg-app)",
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 20px 16px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      display: "block",
      marginBottom: 4
    }
  }, "June 2026"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 28,
      fontWeight: 200,
      color: "var(--text-primary)",
      margin: 0
    }
  }, "Wednesday, 17")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 20px 0"
    }
  }, /*#__PURE__*/React.createElement(WeekStrip, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 20px"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      display: "block",
      padding: "16px 0 10px"
    }
  }, "Today"), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(BulletEntry, {
    type: "event",
    text: "Standup",
    time: "09:00"
  }), /*#__PURE__*/React.createElement(BulletEntry, {
    type: "event",
    text: "Lunch with Sam",
    time: "12:30"
  }), /*#__PURE__*/React.createElement(BulletEntry, {
    type: "event",
    text: "1:1 with Priya",
    time: "15:00"
  }), /*#__PURE__*/React.createElement(BulletEntry, {
    type: "task",
    text: "Submit timesheet",
    time: "EOD",
    priority: true
  }))));
}

/* ── Topics ──────────────────────────────────────────────── */
function TopicsTab() {
  const topics = [{
    id: 1,
    icon: "feather",
    name: "Journal",
    count: 84
  }, {
    id: 2,
    icon: "check-circle",
    name: "Task",
    count: 212
  }, {
    id: 3,
    icon: "calendar",
    name: "Event",
    count: 47
  }, {
    id: 4,
    icon: "trophy",
    name: "Goal",
    count: 14
  }, {
    id: 5,
    icon: "utensils",
    name: "Meal",
    count: 91
  }, {
    id: 6,
    icon: "quote",
    name: "Quote",
    count: 31
  }, {
    id: 7,
    icon: "pill",
    name: "Medication",
    count: 28
  }, {
    id: 8,
    icon: "heart",
    name: "Wellness",
    count: 55
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      background: "var(--bg-app)",
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 20px 16px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 28,
      fontWeight: 200,
      color: "var(--text-primary)",
      margin: 0
    }
  }, "Topics")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)"
    }
  }, topics.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.icon,
    size: 18,
    style: {
      color: "var(--color-accent)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: "var(--text-primary)",
      flex: 1,
      fontWeight: 500
    }
  }, t.name), /*#__PURE__*/React.createElement(Eyebrow, null, t.count), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 15,
    style: {
      color: "var(--text-tertiary)"
    }
  }))))));
}

/* ── Capture sheet ───────────────────────────────────────── */
function CaptureSheet({
  open,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 40,
      background: "rgba(0,0,0,0.35)",
      backdropFilter: "blur(2px)",
      display: "flex",
      alignItems: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "100%",
      background: "var(--bg-app)",
      borderTop: "2px solid var(--color-accent)",
      padding: "12px 0 24px",
      animation: "sheetUp 200ms ease-out"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 2,
      background: "var(--border-strong)",
      margin: "0 auto 10px"
    }
  }), /*#__PURE__*/React.createElement(QuickEntry, null)));
}

/* ── Bottom nav ──────────────────────────────────────────── */
function BottomNav({
  tab,
  setTab,
  onCompose
}) {
  const items = [{
    id: "home",
    icon: "layout-grid",
    label: "Home"
  }, {
    id: "journal",
    icon: "book",
    label: "Journal"
  }, {
    id: "compose",
    icon: "plus",
    label: ""
  }, {
    id: "calendar",
    icon: "calendar",
    label: "Calendar"
  }, {
    id: "topics",
    icon: "tag",
    label: "Topics"
  }];
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      padding: "10px 10px 30px",
      background: "var(--bg-app)",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, items.map(it => it.id === "compose" ? /*#__PURE__*/React.createElement("button", {
    key: it.id,
    onClick: onCompose,
    "aria-label": "New entry",
    style: {
      width: 46,
      height: 46,
      border: "none",
      cursor: "pointer",
      background: "var(--color-accent)",
      color: "#fff",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 22
  })) : /*#__PURE__*/React.createElement("button", {
    key: it.id,
    onClick: () => setTab(it.id),
    "aria-label": it.label,
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: "4px 10px",
      color: tab === it.id ? "var(--color-accent)" : "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    size: 20,
    strokeWidth: tab === it.id ? 2.4 : 1.8
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      fontFamily: "var(--font-label)",
      letterSpacing: "0.06em"
    }
  }, it.label))));
}

/* ── App ─────────────────────────────────────────────────── */
function App() {
  const [tab, setTab] = useState("home");
  const [data, setData] = useState(seedData);
  const [sheet, setSheet] = useState(false);
  const [menu, setMenu] = useState(false);
  const [entry, setEntry] = useState(null);
  useEffect(() => {
    document.documentElement.dataset.theme = window.CHRONICLES_THEME === "light" ? "" : "dark";
    document.documentElement.dataset.accent = "teal";
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      background: "var(--bg-app)"
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement(AppBar, {
    onMenu: () => setMenu(true)
  }), tab === "home" && /*#__PURE__*/React.createElement(Home, {
    data: data,
    setData: setData
  }), tab === "journal" && /*#__PURE__*/React.createElement(JournalTab, {
    onOpen: setEntry
  }), tab === "calendar" && /*#__PURE__*/React.createElement(CalendarTab, null), tab === "topics" && /*#__PURE__*/React.createElement(TopicsTab, null), entry && /*#__PURE__*/React.createElement(JournalEditor, {
    entry: entry,
    onClose: () => setEntry(null)
  }), /*#__PURE__*/React.createElement(CaptureSheet, {
    open: sheet,
    onClose: () => setSheet(false)
  }), /*#__PURE__*/React.createElement(NavDrawer, {
    open: menu,
    onClose: () => setMenu(false),
    tab: tab,
    setTab: setTab
  }), /*#__PURE__*/React.createElement(BottomNav, {
    tab: tab,
    setTab: setTab,
    onCompose: () => setSheet(true)
  }));
}
const s = document.createElement("style");
s.textContent = "@keyframes sheetUp { from { transform:translateY(100%); opacity:0; } to { transform:none; opacity:1; } } @keyframes drawerIn { from { transform:translateX(-100%); } to { transform:none; } }";
document.head.appendChild(s);
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile/app.jsx", error: String((e && e.message) || e) }); }

__ds_ns.ACCENTS = __ds_scope.ACCENTS;

__ds_ns.AccentPicker = __ds_scope.AccentPicker;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Dropdown = __ds_scope.Dropdown;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Widget = __ds_scope.Widget;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.ENTRY_ICONS = __ds_scope.ENTRY_ICONS;

__ds_ns.BulletEntry = __ds_scope.BulletEntry;

__ds_ns.Collection = __ds_scope.Collection;

__ds_ns.QuickAdd = __ds_scope.QuickAdd;

__ds_ns.TOPICS = __ds_scope.TOPICS;

__ds_ns.QuickCapture = __ds_scope.QuickCapture;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
