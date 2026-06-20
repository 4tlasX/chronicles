import React from "react";
import { Dropdown } from "../core/Dropdown.jsx";
import { IconButton } from "../core/IconButton.jsx";
import { Button } from "../core/Button.jsx";
import { Tooltip } from "../feedback/Tooltip.jsx";

/* The full topic palette Chronicles sorts captures into. */
export const TOPICS = [
  { value: "task", label: "Task", icon: "check-circle" },
  { value: "event", label: "Event", icon: "calendar" },
  { value: "journal", label: "Journal", icon: "feather" },
  { value: "note", label: "Note", icon: "list" },
  { value: "quote", label: "Quote", icon: "quote" },
  { value: "goal", label: "Goal", icon: "trophy" },
  { value: "meal", label: "Meal", icon: "utensils" },
  { value: "recipe", label: "Recipe", icon: "coffee" },
  { value: "idea", label: "Idea", icon: "sparkles" },
];

const PLACEHOLDERS = {
  task: "What needs doing?",
  event: "What's happening, and when?",
  journal: "Write what's on your mind…",
  note: "Jot something down…",
  quote: "Capture a line worth keeping…",
  goal: "Name a goal to track…",
  meal: "What did you eat?",
  recipe: "Save a recipe…",
  idea: "Capture the idea…",
};

/*
 * Quick capture — the heart of the Chronicles dashboard. Pick a topic from the
 * dropdown, type (or dictate) anything, and it's sorted into the right view.
 * Includes a formatting toggle and a microphone for voice capture.
 */
export function QuickCapture({ topics = TOPICS, defaultTopic = "task", onCapture, autoFocus = false, className = "" }) {
  const [topic, setTopic] = React.useState(defaultTopic);
  const [text, setText] = React.useState("");
  const [listening, setListening] = React.useState(false);

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    onCapture && onCapture({ type: topic, text: v });
    setText("");
  };
  const onKey = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); }
  };

  return (
    <div className={`ch-capture ${className}`}>
      <div className="ch-capture__head">
        <Dropdown value={topic} onChange={setTopic} options={topics} />
        <div className="ch-capture__tools">
          <Tooltip label="Formatting">
            <IconButton icon="type" aria-label="Formatting" size="sm" />
          </Tooltip>
          <Tooltip label={listening ? "Stop" : "Dictate"}>
            <IconButton icon="mic" aria-label="Dictate" size="sm"
              className={listening ? "ch-capture__mic--live" : ""}
              onClick={() => setListening((l) => !l)} />
          </Tooltip>
        </div>
      </div>

      <textarea
        className="ch-capture__input" rows={2} autoFocus={autoFocus}
        placeholder={PLACEHOLDERS[topic] || "Capture anything…"}
        value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey}
      />

      <div className="ch-capture__foot">
        <span className="ch-capture__hint">{listening ? "Listening…" : "⌘ + Enter to save"}</span>
        <Button size="sm" icon="plus" onClick={submit}>Capture</Button>
      </div>
    </div>
  );
}
