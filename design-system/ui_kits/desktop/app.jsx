// Forward each DS component to the live namespace at render time, so the
// standalone bundle's script-ordering/transform timing can never leave them
// undefined (reads window.ChroniclesDesignSystem_cefe3d on every render).
const _ns = () => window.ChroniclesDesignSystem_cefe3d || {};
const Icon         = (p) => React.createElement(_ns().Icon, p);
const IconButton   = (p) => React.createElement(_ns().IconButton, p);
const BulletEntry  = (p) => React.createElement(_ns().BulletEntry, p);
const QuickCapture = (p) => React.createElement(_ns().QuickCapture, p);
const Avatar       = (p) => React.createElement(_ns().Avatar, p);
const Button       = (p) => React.createElement(_ns().Button, p);
const Tooltip      = (p) => React.createElement(_ns().Tooltip, p);
const Switch       = (p) => React.createElement(_ns().Switch, p);
const { useState, useEffect } = React;

/* ── Seed ───────────────────────────────────────────────── */
const seed = {
  tasks: [
    { id: 1, text: "Send weekly review to team", done: true, time: "08:40" },
    { id: 2, text: "Book dentist appointment", done: false, priority: true },
    { id: 3, text: "Draft Q3 goals", done: false },
    { id: 4, text: "30 min walk", done: false, time: "18:00" },
  ],
  events: [
    { id: 10, text: "Lunch with Sam", time: "12:30" },
    { id: 11, text: "1:1 with Priya", time: "15:00" },
    { id: 12, text: "Design crit", time: "THU 10:00" },
  ],
  journal: [
    { id: 20, text: "Woke up clearheaded — the early walk helps more than I admit.", time: "JUN 17" },
    { id: 21, text: "Felt genuinely proud finishing the proposal.", time: "JUN 16" },
  ],
  goals: [
    { id: 30, text: "Read 24 books this year", sub: "14 of 24 — on track", priority: true },
    { id: 31, text: "Run a half marathon", sub: "Week 6 of 12" },
  ],
  shopping: [
    { id: 40, text: "Olive oil", done: false },
    { id: 41, text: "Lemons", done: true },
    { id: 42, text: "Greek yogurt", done: false },
  ],
};

/* ── Flat section — hairline + label + content, NO border box ── */
function Sec({ icon, label, action, children, accent }) {
  return (
    <div style={{
      borderTop: accent
        ? "2px solid var(--color-accent)"
        : "1px solid var(--border-subtle)",
      background: accent ? "var(--color-accent-subtle)" : "transparent",
      paddingBottom: 4,
    }}>
      {/* Section label row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 0 6px",
      }}>
        {icon && (
          <Icon name={icon} size={12}
            style={{ color: accent ? "var(--color-accent)" : "var(--text-tertiary)", flex: "none" }} />
        )}
        <span style={{
          fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: accent ? "var(--color-accent)" : "var(--text-tertiary)", flex: 1,
        }}>{label}</span>
        {action && (
          <span style={{
            fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--text-tertiary)",
          }}>{action}</span>
        )}
      </div>
      {/* Content — no padding, no border, sits directly on canvas */}
      {children}
    </div>
  );
}

/* ── Stat row (for medication/meal/weather data) ────────── */
function StatRow({ icon, label, value, accent }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "6px 0", borderBottom: "1px solid var(--border-subtle)",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8,
        fontSize: 13.5, color: "var(--text-secondary)" }}>
        {icon && <Icon name={icon} size={13}
          style={{ color: accent ? "var(--color-accent)" : "var(--text-tertiary)" }} />}
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600,
        color: accent ? "var(--color-accent)" : "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

/* ── Sidebar nav ────────────────────────────────────────── */
function NavRow({ icon, label, count, active, onClick, dark }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%",
      padding: "8px 14px", border: "none", cursor: "pointer", textAlign: "left",
      background: active ? "var(--color-accent)" : "transparent",
      color: active ? "#fff" : dark ? "#a0a0a8" : "var(--text-secondary)",
      fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: active ? 600 : 400,
    }}>
      <Icon name={icon} size={15} strokeWidth={active ? 2.2 : 1.8} />
      <span style={{ flex: 1 }}>{label}</span>
      {count > 0 && <span style={{
        fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700, opacity: 0.65
      }}>{count}</span>}
    </button>
  );
}

function NavSection({ label, children, defaultOpen = false, dark }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 6, width: "100%",
        padding: "7px 14px 5px", border: "none", background: "transparent",
        borderTop: "1px solid var(--border-subtle)", marginTop: 2,
        cursor: "pointer", fontFamily: "var(--font-label)", fontSize: 9.5,
        fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
        color: dark ? "#666" : "var(--text-tertiary)",
      }}>
        <Icon name={open ? "chevron-down" : "chevron-right"} size={9} />
        {label}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function Sidebar({ view, setView, dark }) {
  return (
    <aside style={{
      width: 228, flex: "none", background: dark ? "#13151e" : "#ffffff",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: "18px 16px 14px", display: "flex", flexDirection: "column", gap: 14,
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "var(--color-accent)" }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M16 6L26 16L16 26L6 16Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
              <circle cx="16" cy="16" r="3.6" fill="currentColor"/>
            </svg>
          </span>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 300,
            letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? "#e5e5e5" : "var(--text-primary)",
          }}>Chronicles</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          border: "1px solid var(--border-subtle)", padding: "5px 10px",
        }}>
          <Icon name="search" size={13} style={{ color: "var(--text-tertiary)", flex: "none" }} />
          <span style={{ fontSize: 12.5, color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}>
            Search ⌘K
          </span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto", paddingTop: 4, color: dark ? "#ccc" : "var(--text-secondary)" }}>
        <NavRow icon="layout-grid" label="Dashboard" active={view==="dashboard"} onClick={() => setView("dashboard")} dark={dark} />
        <NavRow icon="book"        label="Journal"   active={view==="journal"}   onClick={() => setView("journal")}   dark={dark} />
        <NavRow icon="calendar"    label="Calendar"  active={view==="calendar"}  onClick={() => setView("calendar")}  dark={dark} />
        <NavRow icon="tag"         label="Topics"    active={view==="topics"}    onClick={() => setView("topics")}    dark={dark} />

        <NavSection label="Planning" dark={dark}>
          <NavRow icon="trophy"       label="Goals"          active={view==="goals"}    onClick={() => setView("goals")}    dark={dark} />
          <NavRow icon="check-circle" label="Tasks"          active={view==="tasks"}    onClick={() => setView("tasks")}    dark={dark} />
          <NavRow icon="list"         label="Milestones"     active={false}             onClick={() => {}} dark={dark} />
          <NavRow icon="list"         label="Todos"          active={false}             onClick={() => {}} dark={dark} />
          <NavRow icon="calendar"     label="Menu Planner"   active={false}             onClick={() => {}} dark={dark} />
          <NavRow icon="list"         label="Shopping Lists" active={view==="shopping"} onClick={() => setView("shopping")} dark={dark} />
        </NavSection>

        <NavSection label="Health" dark={dark}>
          <NavRow icon="calendar"  label="Schedule"    active={false} onClick={() => {}} dark={dark} />
          <NavRow icon="pill"      label="Medications" active={false} onClick={() => {}} dark={dark} />
          <NavRow icon="utensils"  label="Meals"       active={false} onClick={() => {}} dark={dark} />
          <NavRow icon="activity"  label="Symptoms"    active={false} onClick={() => {}} dark={dark} />
          <NavRow icon="activity"  label="Exercise"    active={false} onClick={() => {}} dark={dark} />
          <NavRow icon="activity"  label="Allergies"   active={false} onClick={() => {}} dark={dark} />
          <NavRow icon="activity"  label="Reports"     active={false} onClick={() => {}} dark={dark} />
        </NavSection>

        <NavSection label="Inspiration" dark={dark}>
          <NavRow icon="quote"    label="Quotes"    active={false} onClick={() => {}} dark={dark} />
          <NavRow icon="sparkles" label="Ideas"     active={false} onClick={() => {}} dark={dark} />
          <NavRow icon="activity" label="Music"     active={false} onClick={() => {}} dark={dark} />
          <NavRow icon="book"     label="Books"     active={false} onClick={() => {}} dark={dark} />
          <NavRow icon="activity" label="TV/Movies" active={false} onClick={() => {}} dark={dark} />
        </NavSection>

        <NavSection label="Settings" dark={dark}>
          <NavRow icon="settings" label="Preferences" active={view==="settings"} onClick={() => setView("settings")} dark={dark} />
        </NavSection>
      </div>

      {/* User */}
      <div style={{
        padding: "10px 14px", borderTop: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Avatar name="Maya Okonkwo" size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12.5, fontWeight: 500, color: "var(--text-primary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>Maya Okonkwo</div>
          <span style={{
            fontFamily: "var(--font-label)", fontSize: 9.5, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-tertiary)",
          }}>284-day streak</span>
        </div>
      </div>
    </aside>
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
          color: sel===i ? "#fff" : "var(--text-secondary)",
        }}>
          <span style={{
            fontFamily: "var(--font-label)", fontSize: 9,
            letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700,
          }}>{d}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 300 }}>{nums[i]}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────── */
function Dashboard({ data, setData, capture, dark }) {
  const [mood, setMood] = useState(2);
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [cycle, setCycle] = useState(0);
  const moods = ["😞","😐","🙂","😊"];
  const toggle = id => setData(d => ({ ...d, tasks: d.tasks.map(t => t.id===id ? {...t,done:!t.done} : t) }));
  const doneCount = data.tasks.filter(t => t.done).length;

  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 1320, color: dark ? "#e5e5e5" : "var(--text-primary)" }}>
      {/* Date header */}
      <div style={{ paddingBottom: 28, marginBottom: 28, borderBottom: "2px solid var(--color-accent)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{
              fontFamily: "var(--font-display)", fontSize: 88, fontWeight: 200,
              color: dark ? "#e5e5e5" : "var(--text-primary)", margin: 0, lineHeight: 1, letterSpacing: "-0.02em",
            }}>18</span>
            <div>
              <span style={{
                display: "block", marginBottom: 6,
                fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase", color: dark ? "#888" : "var(--text-tertiary)",
              }}>Wednesday · June</span>
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 14, fontStyle: "italic",
                color: dark ? "#999" : "var(--text-secondary)", margin: 0, lineHeight: 1.4,
              }}>The only way out is through</p>
            </div>
          </div>

          {/* Weather glance */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icon name="sun" size={30} strokeWidth={2.4} style={{ color: "var(--color-accent)", flex: "none" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 200, lineHeight: 1,
                color: dark ? "#e5e5e5" : "var(--text-primary)",
              }}>72°</div>
              <div style={{
                fontFamily: "var(--font-label)", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? "#888" : "var(--text-tertiary)",
                marginTop: 4,
              }}>Sunny · Austin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Quick Entry */}
          <div style={{ 
            paddingBottom: 12,
            background: dark ? "#1b1d26" : "#ffffff",
          }}>

            {/* Topic dropdown */}
            <div style={{ padding: "6px 0 10px" }}>
              <select style={{
                padding: "7px 28px 7px 12px", border: "1px solid var(--border-subtle)",
                background: dark ? "#252834" : "#fafafa", color: dark ? "#e5e5e5" : "var(--text-primary)",
                fontFamily: "var(--font-sans)", fontSize: 13.5, borderRadius: 0, cursor: "pointer",
                appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
              }}>
                <option>No Topic</option>
                <option>Journal</option>
                <option>Task</option>
                <option>Event</option>
                <option>Quote</option>
                <option>Meal</option>
                <option>Goal</option>
              </select>
            </div>

            {/* Text input */}
            <textarea
              placeholder="What's one thing you could let go of today?"
              style={{
                width: "100%", minHeight: 130, resize: "none", boxSizing: "border-box",
                padding: "16px 2px", border: "none", borderBottom: "1px solid var(--border-subtle)", borderRadius: 0,
                background: "transparent", color: dark ? "#e5e5e5" : "var(--text-primary)",
                fontFamily: "var(--font-display)", fontSize: 17, fontStyle: "italic", lineHeight: 1.5,
                outline: "none",
              }}
            />

            {/* Action row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: -8 }}>
              <div style={{ display: "flex", gap: 4, marginLeft: -6 }}>
                <button aria-label="Voice" style={{
                  width: 30, height: 30, border: "none", borderRadius: 0,
                  background: "transparent", color: dark ? "#e5e5e5" : "var(--text-secondary)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                }}>
                  <Icon name="mic" size={17} strokeWidth={2} />
                </button>
                <button aria-label="Format" style={{
                  width: 30, height: 30, border: "none", borderRadius: 0,
                  background: "transparent", color: dark ? "#e5e5e5" : "var(--text-secondary)", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                }}>
                  <Icon name="pencil" size={17} strokeWidth={2} />
                </button>
              </div>
              <button style={{
                padding: "5px 20px", border: "1px solid var(--color-accent)", borderRadius: 999,
                background: "transparent", color: "var(--color-accent)",
                fontFamily: "var(--font-label)", fontSize: 11, fontWeight: 600, cursor: "pointer",
                letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 12, display: "flex", alignItems: "center", gap: 6,
              }}><Icon name="plus" size={13} strokeWidth={2.5} /> Capture</button>
            </div>
          </div>

          {/* Tasks widget */}
          <div style={{ 
            borderTop: "1px solid var(--border-subtle)",
            paddingBottom: 12,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 0 8px",
            }}>
              <Icon name="check-circle" size={12} style={{ color: "var(--text-tertiary)", flex: "none" }} />
              <span style={{
                fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--text-tertiary)", flex: 1,
              }}>Tasks</span>
              <span style={{
                fontFamily: "var(--font-label)", fontSize: 9, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--text-tertiary)",
              }}>{doneCount} of {data.tasks.length}</span>
            </div>
            <div>
              {data.tasks.map(t => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 0", borderBottom: "1px solid " + (dark ? "#333" : "var(--border-subtle)"),
                }}>
                  <button onClick={() => toggle(t.id)} style={{
                    border: "none", background: "transparent",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    flex: "none", padding: 0, color: "var(--color-accent)",
                  }}>
                    <Icon name={t.done ? "check-circle" : "circle"} size={18} strokeWidth={2} />
                  </button>
                  <span style={{
                    fontSize: 13.5, color: dark ? "#e5e5e5" : "var(--text-primary)",
                    flex: 1, textDecoration: t.done ? "line-through" : "none",
                    opacity: t.done ? 0.6 : 1,
                  }}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming widget */}
          <div style={{ 
            borderTop: "1px solid var(--border-subtle)",
            paddingBottom: 12,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 0 8px",
            }}>
              <Icon name="calendar" size={12} style={{ color: "var(--text-tertiary)", flex: "none" }} />
              <span style={{
                fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--text-tertiary)", flex: 1,
              }}>Upcoming</span>
            </div>
            <div>
              {[
                { day: "20", mon: "JUN", text: "Meet Sam for Lunch", when: "Sat · 7:00 PM" },
                { day: "26", mon: "JUN", text: "Bookclub", when: "Fri · 7:10 PM" },
                { day: "12", mon: "JUL", text: "Brunch with d", when: "Sun · 10:34 PM" },
                { day: "24", mon: "JUL", text: "Heroines club rose in chains", when: "Fri · 10:39 PM" },
                { day: "31", mon: "JUL", text: "LSDREAM and Lightcode", when: "Fri · 10:00 PM" },
              ].map((e, i, arr) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "48px 1fr", alignItems: "start", gap: 16,
                  padding: "14px 0",
                  borderBottom: i < arr.length - 1 ? "1px dashed " + (dark ? "#333" : "var(--border-subtle)") : "none",
                }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{
                      fontFamily: "var(--font-display)", fontWeight: 300, fontSize: 26, lineHeight: 1,
                      color: dark ? "#e5e5e5" : "var(--text-primary)", letterSpacing: "-0.01em",
                    }}>{e.day}</div>
                    <div style={{
                      fontFamily: "var(--font-label)", fontSize: 9, fontWeight: 700,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: "var(--text-tertiary)", marginTop: 4,
                    }}>{e.mon}</div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: 15, color: dark ? "#e5e5e5" : "var(--text-primary)",
                      lineHeight: 1.3, marginBottom: 5,
                    }}>{e.text}</div>
                    <div style={{
                      fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 600,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "var(--text-tertiary)",
                    }}>{e.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Wellness */}
          <div style={{ 
            borderTop: "1px solid var(--border-subtle)",
            paddingBottom: 12,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 0 8px",
            }}>
              <Icon name="heart" size={12} style={{ color: "var(--text-tertiary)", flex: "none" }} />
              <span style={{
                fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--text-tertiary)", flex: 1,
              }}>Wellness Checks</span>
            </div>
            {/* Water — row of droplets */}
            <div style={{ paddingTop: 8, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Water</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[...Array(8)].map((_, i) => (
                  <button key={i} onClick={() => setWater(water === i + 1 ? i : i + 1)} style={{
                    width: 16, height: 16, padding: 0, border: "none", background: "transparent", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: i < water ? "var(--color-accent)" : "var(--text-tertiary)", transition: "color 0.1s",
                  }}>
                    <Icon name="droplet" size={14} strokeWidth={2.4} />
                  </button>
                ))}
                <span style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 8 }}>{water}/8</span>
              </div>
            </div>

            {/* Mood — 5 icon buttons */}
            <div style={{ paddingTop: 8, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Mood</span>
              <div style={{ display: "flex", gap: 12 }}>
                {["mood-1", "mood-2", "mood-3", "mood-4", "mood-5"].map((icon, i) => (
                  <button key={i} onClick={() => setMood(mood === i ? -1 : i)} style={{
                    background: "transparent", border: "none", cursor: "pointer", padding: 0,
                    color: mood === i ? "var(--color-accent)" : "var(--text-tertiary)",
                    transition: "color 0.1s", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name={icon} size={22} strokeWidth={2.2} />
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep — row of moons */}
            <div style={{ paddingTop: 8, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Sleep</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[...Array(10)].map((_, i) => (
                  <button key={i} onClick={() => setSleep(sleep === i + 1 ? i : i + 1)} style={{
                    width: 16, height: 16, padding: 0, border: "none", background: "transparent", cursor: "pointer",
                    color: i < sleep ? "var(--color-accent)" : "var(--text-tertiary)", transition: "color 0.1s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name="moon" size={14} strokeWidth={2.4} />
                  </button>
                ))}
                <span style={{ fontSize: 11, color: "var(--text-secondary)", marginLeft: 8 }}>{sleep ? sleep + "h" : "—"}</span>
              </div>
            </div>

            {/* Cycle — row of droplets */}
            <div style={{ paddingTop: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Cycle</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                {[...Array(4)].map((_, i) => (
                  <button key={i} onClick={() => setCycle(cycle === i + 1 ? i : i + 1)} style={{
                    width: 16, height: 16, padding: 0, border: "none", background: "transparent", cursor: "pointer",
                    color: i < cycle ? "var(--color-accent)" : "var(--text-tertiary)", transition: "color 0.1s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon name="droplet" size={14} strokeWidth={2.4} />
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", fontStyle: "italic" }}>Predicted Period - June 26th</span>
            </div>
          </div>

          {/* Medications */}
          <div style={{ 
            borderTop: "1px solid var(--border-subtle)",
            paddingBottom: 12,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 0 8px",
            }}>
              <Icon name="pill" size={12} style={{ color: "var(--text-tertiary)", flex: "none" }} />
              <span style={{
                fontFamily: "var(--font-label)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--text-tertiary)", flex: 1,
              }}>Medications</span>
            </div>
            <div>
              {[
                { name: "Vitamin D", time: "8:00 AM", taken: true },
                { name: "Omega-3", time: "12:00 PM", taken: true },
                { name: "Magnesium", time: "9:00 PM", taken: false },
              ].map((m, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "6px 0", borderBottom: "1px solid " + (dark ? "#333" : "var(--border-subtle)"),
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, color: dark ? "#e5e5e5" : "var(--text-primary)" }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{m.time}</div>
                  </div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    color: "var(--color-accent)", flex: "none",
                  }}>
                    <Icon name={m.taken ? "check-circle" : "circle"} size={18} strokeWidth={2} />
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Journal view ────────────────────────────────────────── */
/* Month grid for the journal rail */
function MonthCal({ selected = 17, dotted = [] }) {
  // June 2026 — the 1st is a Monday, 30 days.
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontFamily:"var(--font-label)", fontSize:10, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--text-secondary)" }}>June 2026</span>
        <span style={{ display:"flex", gap:2 }}>
          <Icon name="chevron-left" size={14} style={{ color:"var(--text-tertiary)" }} />
          <Icon name="chevron-right" size={14} style={{ color:"var(--text-tertiary)" }} />
        </span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:4 }}>
        {["M","T","W","T","F","S","S"].map((d,i) => (
          <div key={i} style={{ textAlign:"center", fontFamily:"var(--font-label)", fontSize:9, fontWeight:700, letterSpacing:"0.06em", color:"var(--text-tertiary)", padding:"2px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {days.map(d => {
          const on = d === selected;
          return (
            <div key={d} style={{ position:"relative", aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11.5, cursor:"pointer",
              background: on ? "var(--color-accent)" : "transparent",
              color: on ? "#fff" : "var(--text-secondary)", fontWeight: on ? 600 : 400 }}>
              {d}
              {dotted.includes(d) && !on && <span style={{ position:"absolute", bottom:3, width:3, height:3, borderRadius:"50%", background:"var(--color-accent)" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JournalView({ data, setData, dark }) {
  const TOPIC = {
    journal: "var(--color-accent)",
    task:    "#d97706",
    event:   "#2563eb",
    goal:    "#65a30d",
    quote:   "#9333ea",
    meal:    "#e11d48",
  };
  const entries = [
    { id:1, day:"17", weekday:"Wednesday", date:"Wednesday, June 17, 2026", time:"9:10 AM", type:"journal", tag:"Journal",
      list:"The early walk", listSub:"Trying to make it the default, not the exception",
      title:"The early walk",
      lead:"Woke up clearheaded — the early walk helps more than I admit.",
      body:[
        "There's a version of the day that starts with movement and light, and a version that starts with a screen. They are not the same day, and I keep proving it to myself and forgetting by the next morning.",
        "Writing it down so tomorrow-me has fewer excuses. The hard part was never the walking — it was the ten minutes before, deciding.",
      ],
      bullets:["Out the door before 7:00", "Phone stays on the counter", "Coffee after, not before"] },
    { id:2, day:"17", weekday:"Wednesday", date:"Wednesday, June 17, 2026", time:"12:30 PM", type:"event", tag:"Event",
      list:"Lunch with Sam", listSub:"Riverside Café · 12:30 PM",
      title:"Lunch with Sam",
      lead:"Caught up over the grain bowls. Good to hear the new role is settling.",
      body:["Sam mentioned the reading group restarts in July — said I'd come. Note to self: actually finish the book this time."],
      bullets:["Bring the annotated copy", "Ask about the Lisbon trip"] },
    { id:3, day:"17", weekday:"Wednesday", date:"Wednesday, June 17, 2026", time:"9:00 PM", type:"goal", tag:"Goal",
      list:"Read 24 books this year", listSub:"14 of 24 — on track",
      title:"Read 24 books this year",
      lead:"Fourteen down. Comfortably on pace if I keep the nightly half-hour.",
      body:["The streak matters more than the page count. Even five pages keeps the habit warm."],
      bullets:["Half hour before bed", "No new book until the current one is finished"] },
    { id:4, day:"16", weekday:"Tuesday", date:"Tuesday, June 16, 2026", time:"9:18 PM", type:"journal", tag:"Journal",
      list:"Finished the proposal", listSub:"Momentum matters more than mood",
      title:"Finished the proposal",
      lead:"Felt genuinely proud finishing the proposal tonight.",
      body:["Momentum matters more than mood. I didn't feel like starting and did it anyway, and somewhere around the second section the resistance just dissolved."],
      bullets:["Send for review Thursday", "Block Friday morning for edits"] },
    { id:5, day:"16", weekday:"Tuesday", date:"Tuesday, June 16, 2026", time:"7:30 PM", type:"meal", tag:"Meal",
      list:"Roast chicken", listSub:"Lemon potatoes, greens",
      title:"Roast chicken, lemon potatoes",
      lead:"Simple and good. The lemon under the skin made the difference.",
      body:["Enough left for tomorrow's lunch. Keeping this one in rotation."],
      bullets:["More garlic next time", "Rest it longer before carving"] },
  ];
  const [sel, setSel] = useState(1);
  const active = entries.find(e => e.id === sel) || entries[0];

  return (
    <div style={{ display:"flex", height:"100%", minHeight:0 }}>
      {/* ── Left rail: calendar + search + entry list ── */}
      <aside style={{ width:312, flex:"none", borderRight:"1px solid var(--border-subtle)", display:"flex", flexDirection:"column", minHeight:0 }}>
        {/* Search */}
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border-subtle)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:999, background:"var(--bg-sunken)" }}>
            <Icon name="search" size={14} style={{ color:"var(--text-tertiary)", flex:"none" }} />
            <input placeholder="Search or filter" style={{ flex:1, border:"none", background:"transparent", outline:"none", fontFamily:"var(--font-sans)", fontSize:13, color:"var(--text-primary)" }} />
          </div>
        </div>
        {/* Entry list */}
        <div style={{ flex:1, overflowY:"auto", minHeight:0 }}>
          {entries.map(e => {
            const on = e.id === sel;
            return (
              <button key={e.id} onClick={() => setSel(e.id)} style={{
                display:"grid", gridTemplateColumns:"3px 1fr auto", gap:12, alignItems:"start",
                width:"100%", textAlign:"left", cursor:"pointer", border:"none",
                padding:"13px 18px 13px 0",
                background: on ? "var(--bg-active)" : "transparent",
                borderBottom:"1px solid var(--border-subtle)",
              }}>
                <span style={{ width:3, alignSelf:"stretch", background: on ? TOPIC[e.type] : "transparent" }} />
                <span style={{ minWidth:0 }}>
                  <span style={{ display:"block", fontSize:13.5, fontWeight:500, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.list}</span>
                  <span style={{ display:"block", fontSize:11.5, color:"var(--text-tertiary)", marginTop:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{e.listSub}</span>
                </span>
                <span style={{ fontFamily:"var(--font-label)", fontSize:9.5, fontWeight:700, letterSpacing:"0.08em", color: on ? TOPIC[e.type] : "var(--text-tertiary)", whiteSpace:"nowrap", paddingTop:1 }}>{e.time}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Entry editor pane ── */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", minHeight:0 }}>
        {/* Scrollable entry body */}
        <div style={{ flex:1, overflowY:"auto", minHeight:0 }}>
          <article style={{ maxWidth:680, padding:"34px 40px 40px" }}>
            {/* Date block */}
            <div style={{ display:"flex", alignItems:"flex-end", gap:16, marginBottom:22, paddingTop:26, borderTop:"2px solid var(--color-accent)" }}>
              <span style={{ fontFamily:"var(--font-display)", fontSize:72, fontWeight:200, lineHeight:0.82, letterSpacing:"-0.02em", color:"var(--text-primary)" }}>{active.day}</span>
              <span style={{ fontFamily:"var(--font-label)", fontSize:12, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-tertiary)", paddingBottom:8 }}>{active.weekday}</span>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:38, fontWeight:200, letterSpacing:"-0.01em", lineHeight:1.1, color:"var(--text-primary)", margin:"0 0 12px" }}>{active.title}</h1>

            {/* Topic picker + entry actions */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28, paddingTop:16, paddingBottom:20, borderTop:"1px solid var(--border-subtle)", borderBottom:"1px solid var(--border-subtle)" }}>
              <select defaultValue={active.tag} key={active.id} className="ch-topic-picker" style={{
                fontFamily:"var(--font-label)", fontSize:12, fontWeight:500,
                letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-primary)",
                border:"1px solid transparent", borderRadius:999, padding:"5px 22px 5px 13px",
                background:"transparent", cursor:"pointer", appearance:"none",
                backgroundImage:"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                backgroundRepeat:"no-repeat", backgroundPosition:"right 4px center",
              }}>
                <option>Journal</option>
                <option>Task</option>
                <option>Event</option>
                <option>Goal</option>
                <option>Quote</option>
                <option>Meal</option>
              </select>
              <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                {[
                  { icon:"bookmark", label:"Bookmark" },
                  { icon:"share",    label:"Share" },
                  { icon:"mic",      label:"Voice note" },
                  { icon:"pencil",   label:"Format" },
                  { icon:"trash",    label:"Delete", muted:true },
                ].map(b => (
                  <button key={b.icon} aria-label={b.label} title={b.label} className="ch-entry-action" style={{
                    width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center",
                    border:"1px solid transparent", borderRadius:4, background:"transparent", cursor:"pointer",
                    color: b.muted ? "var(--text-tertiary)" : "var(--text-secondary)",
                  }}>
                    <Icon name={b.icon} size={16} strokeWidth={2} />
                  </button>
                ))}
              </div>
            </div>

            {/* Lead */}
            <p style={{ fontFamily:"var(--font-display)", fontSize:21, fontWeight:300, fontStyle:"italic", lineHeight:1.5, color:"var(--text-primary)", margin:"0 0 22px" }}>{active.lead}</p>

            {/* Body */}
            {active.body.map((p,i) => (
              <p key={i} style={{ fontFamily:"var(--font-sans)", fontSize:15, lineHeight:1.75, color:"var(--text-secondary)", margin:"0 0 18px" }}>{p}</p>
            ))}

            {/* Bullets */}
            <div style={{ marginTop:26 }}>
              {active.bullets.map((b,i) => (
                <div key={i} style={{ display:"flex", alignItems:"baseline", gap:14, padding:"9px 0", borderBottom: i < active.bullets.length-1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--color-accent)", flex:"none", transform:"translateY(-2px)" }} />
                  <span style={{ fontSize:15, color:"var(--text-primary)", lineHeight:1.5 }}>{b}</span>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Footer: discard / save */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:22, padding:"13px 40px", borderTop:"1px solid var(--border-subtle)", flex:"none" }}>
          <button style={{ border:"none", background:"transparent", cursor:"pointer",
            fontFamily:"var(--font-label)", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--text-tertiary)" }}>Discard changes</button>
          <button style={{ border:"1px solid var(--color-accent)", background:"transparent", borderRadius:999, cursor:"pointer",
            padding:"7px 22px", fontFamily:"var(--font-label)", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--color-accent)" }}>Save entry</button>
        </div>
      </div>
    </div>
  );
}

/* ── Calendar view ───────────────────────────────────────── */
function CalendarView() {
  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 720 }}>
      <span style={{ display:"block", marginBottom:6, fontFamily:"var(--font-label)", fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-tertiary)" }}>June 2026</span>
      <h1 style={{ fontFamily:"var(--font-display)", fontSize:42, fontWeight:200, letterSpacing:"-0.01em", color:"var(--text-primary)", margin:"0 0 18px" }}>Wednesday, 17</h1>
      <div style={{ marginBottom:20 }}><WeekStrip /></div>
      <div style={{ borderTop:"1px solid var(--border-subtle)" }}>
        <BulletEntry type="event" text="Standup"          time="09:00" />
        <BulletEntry type="event" text="Lunch with Sam"   time="12:30" />
        <BulletEntry type="event" text="1:1 with Priya"   time="15:00" />
        <BulletEntry type="task"  text="Submit timesheet" time="EOD" priority />
      </div>
    </div>
  );
}

/* ── Topics view ─────────────────────────────────────────── */
function TopicsView() {
  const topics = [
    { id:1, icon:"feather",      name:"Journal",    count:84  },
    { id:2, icon:"check-circle", name:"Task",        count:212 },
    { id:3, icon:"calendar",     name:"Event",       count:47  },
    { id:4, icon:"trophy",       name:"Goal",        count:14  },
    { id:5, icon:"utensils",     name:"Meal",        count:91  },
    { id:6, icon:"quote",        name:"Quote",       count:31  },
    { id:7, icon:"pill",         name:"Medication",  count:28  },
    { id:8, icon:"heart",        name:"Wellness",    count:55  },
  ];
  return (
    <div style={{ padding:"24px 32px 60px", maxWidth:720 }}>
      <span style={{ display:"block", marginBottom:6, fontFamily:"var(--font-label)", fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-tertiary)" }}>{topics.length} topics</span>
      <h1 style={{ fontFamily:"var(--font-display)", fontSize:42, fontWeight:200, letterSpacing:"-0.01em", color:"var(--text-primary)", margin:"0 0 22px" }}>Topics</h1>
      <div style={{ borderTop:"1px solid var(--border-subtle)" }}>
        {topics.map(t => (
          <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid var(--border-subtle)" }}>
            <Icon name={t.icon} size={17} style={{ color:"var(--color-accent)", flex:"none" }} />
            <span style={{ fontSize:15, color:"var(--text-primary)", flex:1, fontWeight:500 }}>{t.name}</span>
            <span style={{ fontFamily:"var(--font-label)", fontSize:9.5, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--text-tertiary)" }}>{t.count} entries</span>
            <IconButton icon="chevron-right" size="sm" aria-label="Open" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Goals view ──────────────────────────────────────────── */
function GoalsView({ data }) {
  return (
    <div style={{ padding:"24px 32px 60px", maxWidth:720 }}>
      <span style={{ display:"block", marginBottom:6, fontFamily:"var(--font-label)", fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-tertiary)" }}>{data.goals.length} goals</span>
      <h1 style={{ fontFamily:"var(--font-display)", fontSize:42, fontWeight:200, letterSpacing:"-0.01em", color:"var(--text-primary)", margin:"0 0 22px" }}>Goals</h1>
      <div style={{ borderTop:"1px solid var(--border-subtle)" }}>
        {data.goals.map(e => <BulletEntry key={e.id} type="goal" text={e.text} sub={e.sub} priority={e.priority} />)}
      </div>
    </div>
  );
}

/* ── Shopping view ───────────────────────────────────────── */
function ShoppingView({ data, setData }) {
  const toggle = id => setData(d => ({ ...d, shopping: d.shopping.map(s => s.id===id ? {...s,done:!s.done} : s) }));
  return (
    <div style={{ padding:"24px 32px 60px", maxWidth:720 }}>
      <span style={{ display:"block", marginBottom:6, fontFamily:"var(--font-label)", fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-tertiary)" }}>{data.shopping.length} items</span>
      <h1 style={{ fontFamily:"var(--font-display)", fontSize:42, fontWeight:200, letterSpacing:"-0.01em", color:"var(--text-primary)", margin:"0 0 22px" }}>Shopping</h1>
      <div style={{ borderTop:"1px solid var(--border-subtle)" }}>
        {data.shopping.map(s => (
          <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:"1px solid var(--border-subtle)" }}>
            <button onClick={() => toggle(s.id)} style={{ border:"none", background:"transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flex:"none", padding:0, color:"var(--color-accent)" }}>
              <Icon name={s.done ? "check-circle" : "circle"} size={18} strokeWidth={2} />
            </button>
            <span style={{ fontSize:13.5, color:"var(--text-primary)", flex:1, textDecoration:s.done?"line-through":"none", opacity:s.done?0.6:1 }}>{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function SettingsView({ dark, setDark }) {
  return (
    <div style={{ padding:"24px 32px 60px", maxWidth:600 }}>
      <span style={{ display:"block", marginBottom:6, fontFamily:"var(--font-label)", fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-tertiary)" }}>Preferences</span>
      <h1 style={{ fontFamily:"var(--font-display)", fontSize:42, fontWeight:200, letterSpacing:"-0.01em", color:"var(--text-primary)", margin:"0 0 24px" }}>Settings</h1>
      <div style={{ borderTop:"1px solid var(--border-subtle)" }}>
        {[
          { label:"Dark mode", hint:"Switch between light and dark theme",
            control:<Switch label="" checked={dark} onChange={e => setDark(e.target.checked)} /> },
          { label:"Accent color", hint:"Personalize your theme color",
            control:(
              <div style={{ display:"flex", gap:6 }}>
                {["teal","ink","rose","amber","sage","denim"].map(a => (
                  <button key={a} onClick={() => { document.documentElement.dataset.accent = a; }}
                    style={{ width:22, height:22, border:"none", cursor:"pointer", borderRadius:"50%",
                      background:{teal:"#0d9488",ink:"#4f46e5",rose:"#e11d48",amber:"#d97706",sage:"#65a30d",denim:"#2563eb"}[a] }} />
                ))}
              </div>
            )},
          { label:"Daily reminder", hint:"Remind me to journal at 8:00 AM",
            control:<Switch label="" defaultChecked /> },
          { label:"Background image", hint:"Choose a background for the journal canvas",
            control:<span style={{ fontSize:13, color:"var(--text-tertiary)" }}>None</span> },
        ].map((row,i) => (
          <div key={i} style={{ padding:"16px 0", borderBottom:"1px solid var(--border-subtle)", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"var(--text-primary)" }}>{row.label}</div>
              <div style={{ fontSize:12.5, color:"var(--text-tertiary)", marginTop:2 }}>{row.hint}</div>
            </div>
            {row.control}
          </div>
        ))}
      </div>
    </div>
  );
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

  const capture = ({ type, text }) =>
    setData(d => ({ ...d, journal: [{ id: Date.now(), text, time: "Now" }, ...d.journal] }));

  const LABELS = { dashboard:"Dashboard", journal:"Journal", calendar:"Calendar", topics:"Topics", goals:"Goals", settings:"Settings", shopping:"Shopping Lists", tasks:"Tasks" };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background: dark ? "#1b1d26" : "#ffffff" }}>
      {/* 3px accent stripe */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:3, background:"var(--color-accent)", zIndex:200 }} />

      <Sidebar view={view} setView={setView} dark={dark} />

      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", paddingTop:3 }}>
        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 32px", height:44, borderBottom:"1px solid var(--border-subtle)", flex:"none", background: dark ? "#1b1d26" : "#ffffff" }}>
          <span style={{ fontFamily:"var(--font-label)", fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"var(--text-tertiary)" }}>
            {LABELS[view] || view}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", background: dark ? "#1b1d26" : "#ffffff" }}>
          {view==="dashboard" && <Dashboard data={data} setData={setData} capture={capture} dark={dark} />}
          {view==="shopping"   && <ShoppingView data={data} setData={setData} />}
          {view==="journal"   && <JournalView data={data} setData={setData} dark={dark} />}
          {view==="calendar"  && <CalendarView />}
          {view==="topics"    && <TopicsView />}
          {view==="goals"     && <GoalsView data={data} />}
          {view==="settings"  && <SettingsView dark={dark} setDark={setDark} />}
        </div>
      </div>
    </div>
  );
}

const chStyle = document.createElement("style");
chStyle.textContent = ".ch-topic-picker:hover, .ch-entry-action:hover { border-color: var(--border-strong) !important; } .ch-entry-action:hover { background: var(--bg-active) !important; }";
document.head.appendChild(chStyle);

// Export all components to window scope for bundling
Object.assign(window, {
  Sec, StatRow, NavRow, NavSection, Sidebar, WeekStrip, Dashboard,
  MonthCal, JournalView, CalendarView, TopicsView, GoalsView, ShoppingView, SettingsView, App
});

function chMount() {
  const ns = window.ChroniclesDesignSystem_cefe3d;
  if (!ns || !ns.Icon) { return setTimeout(chMount, 20); }
  if (window.__chDesktopMounted) { return; }
  window.__chDesktopMounted = true;
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
}
chMount();