const { Icon, IconButton, BulletEntry, Avatar } =
  window.ChroniclesDesignSystem_cefe3d;
const { useState, useEffect } = React;

/* ── Seed ───────────────────────────────────────────────── */
const seedData = {
  tasks:    [{ id: 1, text: "Send weekly review", done: true }, { id: 2, text: "Book dentist", done: false }, { id: 3, text: "30 min walk", done: false }],
  events:   [
    { day: "20", mon: "JUN", text: "Meet Sam for Lunch",     when: "Sat · 7:00 PM" },
    { day: "26", mon: "JUN", text: "Bookclub",               when: "Fri · 7:10 PM" },
    { day: "12", mon: "JUL", text: "Brunch with d",          when: "Sun · 10:34 AM" },
  ],
  journal:  [{ id: 20, text: "Woke up clearheaded — the early walk helps more than I admit." }, { id: 21, text: "Felt genuinely proud finishing the proposal." }],
  goals:    [{ id: 30, text: "Read 24 books this year", sub: "14 of 24 — on track", priority: true }],
  shopping: [{ id: 40, text: "Olive oil", done: false }, { id: 41, text: "Lemons", done: true }],
};

/* ── Eyebrow ────────────────────────────────────────────── */
function Eyebrow({ children, style }) {
  return (
    <span style={{ fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700,
      letterSpacing: "0.2em", textTransform: "uppercase",
      color: "var(--text-tertiary)", ...style }}>{children}</span>
  );
}

/* ── Section — borderless, hairline top rule, eyebrow head ─ */
function Section({ title, icon, action, children }) {
  return (
    <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "0 20px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 0 8px" }}>
        {icon && <Icon name={icon} size={12} style={{ color: "var(--text-tertiary)", flex: "none" }} />}
        <Eyebrow style={{ fontSize: 10, letterSpacing: "0.18em", flex: 1 }}>{title}</Eyebrow>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ── Status bar ─────────────────────────────────────────── */
function StatusBar({ onMenu }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 20px 4px", fontSize: 13, fontWeight: 600,
      color: "var(--text-primary)", fontFamily: "var(--font-sans)", background: "var(--bg-app)" }}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 6 }}>
        <Icon name="wifi" size={14} /><Icon name="battery-full" size={14} />
      </span>
    </div>
  );
}

/* ── App bar with hamburger ── */
function AppBar({ onMenu }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"6px 16px 10px", background:"var(--bg-app)" }}>
      <button onClick={onMenu} aria-label="Menu" style={{ border:"none", background:"transparent", cursor:"pointer", padding:6, marginLeft:-6, display:"flex", color:"var(--text-primary)" }}>
        <Icon name="menu" size={20} strokeWidth={2} />
      </button>
      <span style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:300, letterSpacing:"0.04em", color:"var(--text-primary)" }}>Chronicles</span>
    </div>
  );
}

/* ── Slide-out nav drawer ── */
function NavDrawer({ open, onClose, tab, setTab }) {
  const [sections, setSections] = useState({ Planning:false, Health:false, Inspiration:false, "Your Topics":false, Settings:false });
  const toggle = k => setSections(s => ({ ...s, [k]: !s[k] }));
  const core = [
    { id:"home",     icon:"layout-grid", label:"Dashboard" },
    { id:"journal",  icon:"book",        label:"Journal" },
    { id:"calendar", icon:"calendar",    label:"Calendar" },
    { id:"topics",   icon:"tag",         label:"Topics" },
  ];
  const groups = {
    Planning:   ["Goals","Milestones","Tasks","Todos","Filters","Menu Planner","Shopping Lists"],
    Health:     ["Schedule","Medications","Meals","Symptoms","Exercise","Allergies","Reports"],
    Inspiration:["Quotes","Ideas","Music","Books","TV / Movies"],
    "Your Topics":["Morning Pages","Gratitude","Travel","Recipes"],
    Settings:   ["Preferences"],
  };
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"absolute", inset:0, zIndex:60, background:"rgba(0,0,0,0.4)", display:"flex" }}>
      <aside onClick={e => e.stopPropagation()} style={{ width:268, maxWidth:"82%", height:"100%", background:"var(--bg-sunken)", borderRight:"1px solid var(--border-subtle)", display:"flex", flexDirection:"column", animation:"drawerIn 200ms ease-out" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 18px 14px", borderBottom:"1px solid var(--border-subtle)" }}>
          <span style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:300, letterSpacing:"0.04em", color:"var(--text-primary)" }}>Chronicles</span>
          <button onClick={onClose} aria-label="Close" style={{ border:"none", background:"transparent", cursor:"pointer", padding:4, display:"flex", color:"var(--text-tertiary)" }}>
            <Icon name="x" size={18} strokeWidth={2} />
          </button>
        </div>
        {/* Scroll nav */}
        <div style={{ flex:1, overflowY:"auto", padding:"8px 0 24px" }}>
          {core.map(it => {
            const on = tab === it.id;
            return (
              <button key={it.id} onClick={() => { setTab(it.id); onClose(); }} style={{
                display:"flex", alignItems:"center", gap:12, width:"100%", textAlign:"left", cursor:"pointer",
                border:"none", padding:"11px 18px", borderLeft:"3px solid " + (on ? "var(--color-accent)" : "transparent"),
                background: on ? "var(--color-accent)" : "transparent",
                color: on ? "#fff" : "var(--text-secondary)", fontFamily:"var(--font-sans)", fontSize:14, fontWeight:500 }}>
                <Icon name={it.icon} size={17} strokeWidth={on ? 2.2 : 1.8} style={{ flex:"none" }} />
                {it.label}
              </button>
            );
          })}
          <div style={{ height:1, background:"var(--border-subtle)", margin:"8px 18px" }} />
          {Object.keys(groups).map(g => (
            <div key={g}>
              <button onClick={() => toggle(g)} style={{
                display:"flex", alignItems:"center", gap:8, width:"100%", textAlign:"left", cursor:"pointer",
                border:"none", background:"transparent", padding:"10px 18px",
                fontFamily:"var(--font-label)", fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--text-tertiary)" }}>
                <Icon name={sections[g] ? "chevron-down" : "chevron-right"} size={13} style={{ flex:"none" }} />
                {g}
              </button>
              {sections[g] && groups[g].map(item => (
                <button key={item} onClick={onClose} style={{
                  display:"block", width:"100%", textAlign:"left", cursor:"pointer", border:"none", background:"transparent",
                  padding:"8px 18px 8px 40px", fontFamily:"var(--font-sans)", fontSize:13.5, color:"var(--text-secondary)" }}>{item}</button>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ── Week strip ─────────────────────────────────────────── */
function WeekStrip() {
  const days = ["M","T","W","T","F","S","S"], nums = [15,16,17,18,19,20,21], today = 2;
  const [sel, setSel] = useState(today);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
      {days.map((d,i) => (
        <button key={i} onClick={() => setSel(i)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          padding: "7px 0", border: "none", cursor: "pointer",
          background: sel===i ? "var(--color-accent)" : "transparent",
          color: sel===i ? "#fff" : "var(--text-secondary)" }}>
          <span style={{ fontFamily: "var(--font-label)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>{d}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 300 }}>{nums[i]}</span>
          {i===today && <span style={{ width: 3, height: 3, borderRadius: "50%", background: sel===i ? "rgba(255,255,255,.7)" : "var(--color-accent)" }} />}
        </button>
      ))}
    </div>
  );
}

/* ── Quick Entry ────────────────────────────────────────── */
function QuickEntry() {
  return (
    <div style={{ padding: "16px 20px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
      {/* Topic dropdown */}
      <div style={{ marginBottom: 10 }}>
        <select style={{
          padding: "7px 28px 7px 12px", border: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)", color: "var(--text-primary)",
          fontFamily: "var(--font-sans)", fontSize: 13.5, borderRadius: 0, cursor: "pointer",
          appearance: "none",
          backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
          backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
        }}>
          <option>No Topic</option>
          <option>Journal</option><option>Task</option><option>Event</option>
          <option>Quote</option><option>Meal</option><option>Goal</option>
        </select>
      </div>
      {/* Text input */}
      <textarea
        placeholder="What's one thing you could let go of today?"
        rows={2}
        style={{
          width: "100%", resize: "none", boxSizing: "border-box",
          padding: "8px 2px", border: "none", borderBottom: "1px solid var(--border-subtle)", borderRadius: 0,
          background: "transparent", color: "var(--text-primary)",
          fontFamily: "var(--font-display)", fontSize: 16, fontStyle: "italic", lineHeight: 1.5,
          outline: "none",
        }}
      />
      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: -2 }}>
        <div style={{ display: "flex", gap: 4, marginLeft: -6 }}>
          <button aria-label="Voice" style={{ width: 30, height: 30, border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <Icon name="mic" size={17} strokeWidth={2} />
          </button>
          <button aria-label="Format" style={{ width: 30, height: 30, border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <Icon name="pencil" size={17} strokeWidth={2} />
          </button>
        </div>
        <button style={{
          padding: "5px 20px", border: "1px solid var(--color-accent)", borderRadius: 999,
          background: "transparent", color: "var(--color-accent)",
          fontFamily: "var(--font-label)", fontSize: 11, fontWeight: 600, cursor: "pointer",
          letterSpacing: "0.14em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6,
        }}><Icon name="plus" size={13} strokeWidth={2.5} /> Capture</button>
      </div>
    </div>
  );
}

/* ── Wellness checks ────────────────────────────────────── */
function Wellness() {
  const [mood, setMood] = useState(2);
  const [water, setWater] = useState(4);
  const [tog, setTog] = useState({ sleep: true, period: false });
  return (
    <Section title="Wellness Checks" icon="heart">
      {/* Mood */}
      <div style={{ paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)" }}>
        <Eyebrow style={{ fontSize: 9, display: "block", marginBottom: 7 }}>Mood</Eyebrow>
        <div style={{ display: "flex", gap: 14 }}>
          {["mood-1","mood-2","mood-3","mood-4","mood-5"].map((ic,i) => (
            <button key={i} onClick={() => setMood(mood===i?-1:i)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex",
              color: mood===i ? "var(--color-accent)" : "var(--text-tertiary)" }}>
              <Icon name={ic} size={22} strokeWidth={2.2} />
            </button>
          ))}
        </div>
      </div>
      {/* Water */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0 8px" }}>
        <span style={{ fontSize: 13, color: "var(--text-secondary)", width: 52 }}>Water</span>
        <div style={{ display: "flex", gap: 5 }}>
          {[...Array(8)].map((_,i) => (
            <button key={i} onClick={() => setWater(water===i+1?i:i+1)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "flex",
              color: i<water ? "var(--color-accent)" : "var(--text-tertiary)" }}>
              <Icon name="droplet" size={15} strokeWidth={2.4} />
            </button>
          ))}
        </div>
      </div>
      {/* Sleep / Period toggles */}
      {[{k:"sleep",ic:"moon",label:"Sleep"},{k:"period",ic:"droplet",label:"Period"}].map(r => (
        <button key={r.k} onClick={() => setTog(t => ({ ...t, [r.k]: !t[r.k] }))}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", border: "none", background: "transparent", cursor: "pointer", width: "100%",
            color: tog[r.k] ? "var(--color-accent)" : "var(--text-tertiary)" }}>
          <Icon name={r.ic} size={15} strokeWidth={2.4} />
          <span style={{ fontSize: 13, color: "inherit" }}>{r.label}</span>
        </button>
      ))}
    </Section>
  );
}

/* ── Dashboard ───────────────────────────────────────────── */
function Home({ data, setData }) {
  const toggle = id => setData(d => ({ ...d, tasks: d.tasks.map(t => t.id===id ? {...t,done:!t.done} : t) }));
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-app)" }}>
      {/* Date header */}
      <div style={{ padding: "16px 20px 18px", borderTop: "2px solid var(--color-accent)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 62, fontWeight: 200, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.02em" }}>17</span>
            <div>
              <Eyebrow style={{ display: "block", marginBottom: 5 }}>Wednesday · June</Eyebrow>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 13, fontStyle: "italic", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>The only way out is through</p>
            </div>
          </div>
          {/* Weather glance */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="sun" size={24} strokeWidth={2.4} style={{ color: "var(--color-accent)", flex: "none" }} />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 200, lineHeight: 1, color: "var(--text-primary)" }}>72°</div>
              <Eyebrow style={{ fontSize: 8, letterSpacing: "0.12em", display: "block", marginTop: 3 }}>Sunny</Eyebrow>
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingBottom: 96 }}>
        {/* Upcoming */}
        <Section title="Upcoming" icon="calendar">
          {data.events.map((e,i,arr) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", alignItems: "start", gap: 14, padding: "12px 0",
              borderBottom: i < arr.length-1 ? "1px dashed var(--border-subtle)" : "none" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 24, lineHeight: 1, color: "var(--text-primary)" }}>{e.day}</div>
                <Eyebrow style={{ fontSize: 9, letterSpacing: "0.14em", display: "block", marginTop: 4 }}>{e.mon}</Eyebrow>
              </div>
              <div>
                <div style={{ fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 4 }}>{e.text}</div>
                <Eyebrow style={{ fontSize: 9.5, letterSpacing: "0.1em" }}>{e.when}</Eyebrow>
              </div>
            </div>
          ))}
        </Section>

        {/* Tasks */}
        <Section title="Tasks" icon="check-circle" action={<Eyebrow>{data.tasks.filter(t=>t.done).length}/{data.tasks.length}</Eyebrow>}>
          {data.tasks.map((t,i,arr) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0",
              borderBottom: i < arr.length-1 ? "1px solid var(--border-subtle)" : "none" }}>
              <button onClick={() => toggle(t.id)} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", padding: 0, flex: "none", color: "var(--color-accent)" }}>
                <Icon name={t.done ? "check-circle" : "circle"} size={18} strokeWidth={2} />
              </button>
              <span style={{ fontSize: 14, color: "var(--text-primary)", flex: 1, textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.6 : 1 }}>{t.text}</span>
            </div>
          ))}
        </Section>

        <Wellness />

        {/* Medications */}
        <Section title="Medications" icon="pill" action={<Eyebrow>2 left</Eyebrow>}>
          {[{label:"Vitamin D",val:"Taken",on:true},{label:"Magnesium",val:"21:00"},{label:"Omega-3",val:"21:00"}].map((r,i,arr) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0",
              borderBottom: i < arr.length-1 ? "1px solid var(--border-subtle)" : "none" }}>
              <span style={{ display: "flex", gap: 9, fontSize: 13.5, color: "var(--text-secondary)", alignItems: "center" }}>
                <Icon name={r.on ? "check-circle" : "circle"} size={16} strokeWidth={2} style={{ color: r.on ? "var(--color-accent)" : "var(--text-tertiary)" }} />{r.label}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: r.on ? "var(--color-accent)" : "var(--text-primary)" }}>{r.val}</span>
            </div>
          ))}
        </Section>

        {/* Menu Plan */}
        <Section title="Menu Plan" icon="utensils">
          {[{ic:"coffee",label:"Breakfast",val:"Yogurt & berries"},{ic:"utensils",label:"Lunch",val:"Salmon bowl"},{ic:"moon2",label:"Dinner",val:"Not planned"}].map((r,i,arr) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0",
              borderBottom: i < arr.length-1 ? "1px solid var(--border-subtle)" : "none" }}>
              <span style={{ display: "flex", gap: 9, fontSize: 13.5, color: "var(--text-secondary)", alignItems: "center" }}>
                <Icon name={r.ic} size={14} style={{ color: "var(--text-tertiary)" }} />{r.label}
              </span>
              <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{r.val}</span>
            </div>
          ))}
        </Section>

        {/* Affirmation */}
        <Section title="Affirmation" icon="sparkles">
          <p style={{ fontFamily: "var(--font-display)", fontSize: 16, fontStyle: "italic", fontWeight: 300, color: "var(--text-primary)", lineHeight: 1.55, margin: "2px 0 0" }}>
            "Start where you are. Use what you have. Do what you can."
          </p>
          <Eyebrow style={{ display: "block", marginTop: 8 }}>Arthur Ashe</Eyebrow>
        </Section>

        {/* Mini Calendar */}
        <Section title="Mini Calendar" icon="calendar">
          <div style={{ paddingTop: 2 }}><WeekStrip /></div>
        </Section>
      </div>
    </div>
  );
}

/* ── Journal ─────────────────────────────────────────────── */
const TOPIC_COLOR = {
  journal: "var(--color-accent)",
  task:    "#c2762e",
  event:   "#7a5cc0",
  goal:    "#2f8f6b",
  quote:   "#b0518f",
  meal:    "#3b80c4",
};

const journalEntries = [
  { id:1, day:"17", weekday:"WEDNESDAY", date:"Wednesday, June 17, 2026", time:"9:10 AM", type:"journal", tag:"Journal",
    title:"The early walk",
    lead:"Woke up clearheaded — the early walk helps more than I admit.",
    body:["Out the door before the street was awake. The air still cool, that blue half-light. By the time I looped the park the noise in my head had settled into something I could actually work with.",
          "Kept thinking about the proposal. The shape of it is finally clear."],
    bullets:["Block 90 min for the rewrite","Text Dana about Friday","Refill prescription"] },
  { id:2, day:"16", weekday:"TUESDAY", date:"Tuesday, June 16, 2026", time:"8:02 PM", type:"goal", tag:"Goal",
    title:"24 books this year",
    lead:"14 of 24 — on track, somehow.",
    body:["Finished the Le Guin tonight. Slower than I wanted but worth every page."],
    bullets:["Start the next on the list","Return library holds"] },
  { id:3, day:"15", weekday:"MONDAY", date:"Monday, June 15, 2026", time:"7:45 AM", type:"quote", tag:"Quote",
    title:"On beginnings",
    lead:"\u201CStart where you are. Use what you have. Do what you can.\u201D",
    body:["Arthur Ashe. Pinned this above the desk."],
    bullets:[] },
];

function JournalEditor({ entry, onClose }) {
  return (
    <div style={{ position:"absolute", top:0, right:0, bottom:0, left:0, zIndex:50, background:"var(--bg-app)", display:"flex", flexDirection:"column", animation:"sheetUp 220ms ease-out" }}>
      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 16px 12px", flex:"none" }}>
        <button onClick={onClose} aria-label="Back" style={{ border:"none", background:"transparent", cursor:"pointer", padding:6, marginLeft:-6, display:"flex", color:"var(--text-primary)" }}>
          <Icon name="arrow-left" size={20} strokeWidth={2} />
        </button>
        <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
          {[{icon:"bookmark"},{icon:"share"},{icon:"trash",muted:true}].map(b => (
            <button key={b.icon} style={{ width:34, height:34, border:"none", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color: b.muted ? "var(--text-tertiary)" : "var(--text-secondary)" }}>
              <Icon name={b.icon} size={17} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>
      {/* Scroll body */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 20px 24px" }}>
        {/* Date block */}
        <div style={{ display:"flex", alignItems:"flex-end", gap:14, paddingTop:18, marginBottom:18, borderTop:"2px solid var(--color-accent)" }}>
          <span style={{ fontFamily:"var(--font-display)", fontSize:64, fontWeight:200, lineHeight:0.82, letterSpacing:"-0.02em", color:"var(--text-primary)" }}>{entry.day}</span>
          <span style={{ fontFamily:"var(--font-label)", fontSize:11, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-tertiary)", paddingBottom:6 }}>{entry.weekday}</span>
        </div>
        {/* Title */}
        <h1 style={{ fontFamily:"var(--font-display)", fontSize:30, fontWeight:200, letterSpacing:"-0.01em", lineHeight:1.12, color:"var(--text-primary)", margin:"0 0 12px" }}>{entry.title}</h1>
        {/* Topic picker + actions */}
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"0 0 22px", paddingTop:14, paddingBottom:16, borderTop:"1px solid var(--border-subtle)", borderBottom:"1px solid var(--border-subtle)" }}>
          <select defaultValue={entry.tag} style={{
            fontFamily:"var(--font-label)", fontSize:12, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase",
            color:"var(--text-primary)", border:"none", borderRadius:0, padding:"3px 22px 3px 0",
            background:"transparent", cursor:"pointer", appearance:"none",
            backgroundImage:"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
            backgroundRepeat:"no-repeat", backgroundPosition:"right 4px center",
          }}>
            <option>Journal</option><option>Task</option><option>Event</option>
            <option>Goal</option><option>Quote</option><option>Meal</option>
          </select>
          <div style={{ marginLeft:"auto", display:"flex", gap:2 }}>
            <button aria-label="Voice" style={{ width:32, height:32, border:"none", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-secondary)" }}><Icon name="mic" size={17} strokeWidth={2} /></button>
            <button aria-label="Format" style={{ width:32, height:32, border:"none", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-secondary)" }}><Icon name="pencil" size={17} strokeWidth={2} /></button>
          </div>
        </div>
        {/* Lead */}
        <p style={{ fontFamily:"var(--font-display)", fontSize:19, fontWeight:300, fontStyle:"italic", lineHeight:1.5, color:"var(--text-primary)", margin:"0 0 20px" }}>{entry.lead}</p>
        {/* Body */}
        {entry.body.map((p,i) => (
          <p key={i} style={{ fontFamily:"var(--font-sans)", fontSize:15, lineHeight:1.72, color:"var(--text-secondary)", margin:"0 0 16px" }}>{p}</p>
        ))}
        {/* Bullets */}
        {entry.bullets.length > 0 && (
          <div style={{ marginTop:22 }}>
            {entry.bullets.map((b,i) => (
              <div key={i} style={{ display:"flex", alignItems:"baseline", gap:13, padding:"9px 0", borderBottom: i < entry.bullets.length-1 ? "1px solid var(--border-subtle)" : "none" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--color-accent)", flex:"none", transform:"translateY(-2px)" }} />
                <span style={{ fontSize:15, color:"var(--text-primary)", lineHeight:1.5 }}>{b}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Footer */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:20, padding:"12px 20px 24px", borderTop:"1px solid var(--border-subtle)", flex:"none" }}>
        <button onClick={onClose} style={{ border:"none", background:"transparent", cursor:"pointer", fontFamily:"var(--font-label)", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-tertiary)" }}>Discard</button>
        <button onClick={onClose} style={{ border:"1px solid var(--color-accent)", background:"transparent", borderRadius:999, cursor:"pointer", padding:"7px 22px", fontFamily:"var(--font-label)", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--color-accent)" }}>Save entry</button>
      </div>
    </div>
  );
}

function JournalTab({ onOpen }) {
  const setOpen = onOpen;
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-app)", paddingBottom: 96 }}>
      <div style={{ padding: "12px 20px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 200, color: "var(--text-primary)", margin: 0 }}>Journal</h1>
      </div>
      <div style={{ padding: "8px 20px 0" }}>
        {journalEntries.map((e,i) => (
          <button key={e.id} onClick={() => setOpen(e)} style={{
            display:"grid", gridTemplateColumns:"46px 1fr auto", alignItems:"start", gap:14, width:"100%", textAlign:"left",
            border:"none", background:"transparent", cursor:"pointer", padding:"16px 0",
            borderBottom:"1px solid var(--border-subtle)" }}>
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontWeight:300, fontSize:26, lineHeight:1, color:"var(--text-primary)" }}>{e.day}</div>
              <Eyebrow style={{ fontSize:9, letterSpacing:"0.12em", display:"block", marginTop:4 }}>{e.weekday.slice(0,3)}</Eyebrow>
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:TOPIC_COLOR[e.type], flex:"none" }} />
                <Eyebrow style={{ fontSize:9, letterSpacing:"0.14em" }}>{e.tag}</Eyebrow>
              </div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:17, fontWeight:300, color:"var(--text-primary)", lineHeight:1.25, marginBottom:3 }}>{e.title}</div>
              <div style={{ fontSize:13, color:"var(--text-tertiary)", lineHeight:1.4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.lead}</div>
            </div>
            <Icon name="chevron-right" size={16} style={{ color:"var(--text-tertiary)", marginTop:4 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Calendar ────────────────────────────────────────────── */
function CalendarTab() {
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-app)", paddingBottom: 96 }}>
      <div style={{ padding: "12px 20px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <Eyebrow style={{ display: "block", marginBottom: 4 }}>June 2026</Eyebrow>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 200, color: "var(--text-primary)", margin: 0 }}>Wednesday, 17</h1>
      </div>
      <div style={{ padding: "14px 20px 0" }}><WeekStrip /></div>
      <div style={{ padding: "0 20px" }}>
        <Eyebrow style={{ display: "block", padding: "16px 0 10px" }}>Today</Eyebrow>
        <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <BulletEntry type="event" text="Standup" time="09:00" />
          <BulletEntry type="event" text="Lunch with Sam" time="12:30" />
          <BulletEntry type="event" text="1:1 with Priya" time="15:00" />
          <BulletEntry type="task" text="Submit timesheet" time="EOD" priority />
        </div>
      </div>
    </div>
  );
}

/* ── Topics ──────────────────────────────────────────────── */
function TopicsTab() {
  const topics = [
    { id:1, icon:"feather", name:"Journal", count:84 },
    { id:2, icon:"check-circle", name:"Task", count:212 },
    { id:3, icon:"calendar", name:"Event", count:47 },
    { id:4, icon:"trophy", name:"Goal", count:14 },
    { id:5, icon:"utensils", name:"Meal", count:91 },
    { id:6, icon:"quote", name:"Quote", count:31 },
    { id:7, icon:"pill", name:"Medication", count:28 },
    { id:8, icon:"heart", name:"Wellness", count:55 },
  ];
  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-app)", paddingBottom: 96 }}>
      <div style={{ padding: "12px 20px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 200, color: "var(--text-primary)", margin: 0 }}>Topics</h1>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {topics.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
              <Icon name={t.icon} size={18} style={{ color: "var(--color-accent)", flex: "none" }} />
              <span style={{ fontSize: 15, color: "var(--text-primary)", flex: 1, fontWeight: 500 }}>{t.name}</span>
              <Eyebrow>{t.count}</Eyebrow>
              <Icon name="chevron-right" size={15} style={{ color: "var(--text-tertiary)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Capture sheet ───────────────────────────────────────── */
function CaptureSheet({ open, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: "var(--bg-app)", borderTop: "2px solid var(--color-accent)", padding: "12px 0 24px", animation: "sheetUp 200ms ease-out" }}>
        <div style={{ width: 32, height: 2, background: "var(--border-strong)", margin: "0 auto 10px" }} />
        <QuickEntry />
      </div>
    </div>
  );
}

/* ── Bottom nav ──────────────────────────────────────────── */
function BottomNav({ tab, setTab, onCompose }) {
  const items = [
    { id: "home",     icon: "layout-grid", label: "Home"     },
    { id: "journal",  icon: "book",        label: "Journal"  },
    { id: "compose",  icon: "plus",        label: ""         },
    { id: "calendar", icon: "calendar",    label: "Calendar" },
    { id: "topics",   icon: "tag",         label: "Topics"   },
  ];
  return (
    <nav style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "10px 10px 30px", background: "var(--bg-app)",
      borderTop: "1px solid var(--border-subtle)" }}>
      {items.map(it => it.id === "compose" ? (
        <button key={it.id} onClick={onCompose} aria-label="New entry"
          style={{ width: 46, height: 46, border: "none", cursor: "pointer",
            background: "var(--color-accent)", color: "#fff", display: "grid", placeItems: "center" }}>
          <Icon name="plus" size={22} />
        </button>
      ) : (
        <button key={it.id} onClick={() => setTab(it.id)} aria-label={it.label}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            border: "none", background: "transparent", cursor: "pointer", padding: "4px 10px",
            color: tab===it.id ? "var(--color-accent)" : "var(--text-tertiary)" }}>
          <Icon name={it.icon} size={20} strokeWidth={tab===it.id ? 2.4 : 1.8} />
          <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "var(--font-label)", letterSpacing: "0.06em" }}>{it.label}</span>
        </button>
      ))}
    </nav>
  );
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh",
      display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-app)" }}>
      <StatusBar />
      <AppBar onMenu={() => setMenu(true)} />
      {tab === "home"     && <Home data={data} setData={setData} />}
      {tab === "journal"  && <JournalTab onOpen={setEntry} />}
      {tab === "calendar" && <CalendarTab />}
      {tab === "topics"   && <TopicsTab />}
      {entry && <JournalEditor entry={entry} onClose={() => setEntry(null)} />}
      <CaptureSheet open={sheet} onClose={() => setSheet(false)} />
      <NavDrawer open={menu} onClose={() => setMenu(false)} tab={tab} setTab={setTab} />
      <BottomNav tab={tab} setTab={setTab} onCompose={() => setSheet(true)} />
    </div>
  );
}

const s = document.createElement("style");
s.textContent = "@keyframes sheetUp { from { transform:translateY(100%); opacity:0; } to { transform:none; opacity:1; } } @keyframes drawerIn { from { transform:translateX(-100%); } to { transform:none; } }";
document.head.appendChild(s);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
