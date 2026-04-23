import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '@shared/theme/tokens';
import { useUIStore } from './stores/uiStore.js';
import { GlobalStyle } from './styles/GlobalStyle.js';
import { AuthProvider } from './contexts/AuthContext.js';
import { EncryptionProvider } from './contexts/EncryptionContext.js';
import { ProtectedRoute } from './components/organisms/ProtectedRoute.js';
import { LoginView } from './views/LoginView.js';
import { RegisterView } from './views/RegisterView.js';
import { RecoverView } from './views/RecoverView.js';
import { JournalView } from './views/JournalView.js';
import { SettingsView } from './views/SettingsView.js';
import { SharedEntryView } from './views/SharedEntryView.js';
import { TopicsView } from './views/TopicsView.js';
import { CalendarView } from './views/CalendarView.js';
import { GoalsView } from './views/GoalsView.js';
import { PlannerFilterView } from './views/PlannerFilterView.js';
import { TopicEntriesView } from './views/TopicEntriesView.js';
import { MedicationScheduleView } from './views/MedicationScheduleView.js';
import { HealthReportingView } from './views/HealthReportingView.js';
import { HealthTabBar } from './components/molecules/HealthTabBar.js';
import { MenuView } from './views/MenuView.js';
import { ShoppingListsView } from './views/ShoppingListsView.js';
import { DashboardView } from './views/DashboardView.js';

/* ── Design token CSS variable sets ─────────────────────────────────────── */

const LIGHT_CSS_VARS: Record<string, string> = {
  '--paper':             'rgb(240, 235, 223)',
  '--paper-deep':        'rgb(231, 224, 208)',
  '--paper-surface':     '#f7f4ee',
  '--paper-hover':       '#f0eeea',
  '--ink':               '#2b2824',
  '--ink-2':             '#453f38',
  '--ink-3':             '#6b645a',
  '--ink-4':             '#8a857c',
  '--rule':              '#d4cfc5',
  '--rule-2':            '#e5dfd2',
  '--btn-primary':       '#2b2824',
  '--btn-primary-ink':   '#f0ebdf',
  '--btn-primary-hover': '#453f38',
  '--accent-fill':       '#2b2824',
  '--accent-fill-ink':   '#f0ebdf',
  '--danger':            '#9B4444',
  '--success':           '#5A8A6A',
  '--warning':           '#B8965A',
  '--info':              '#5C6B8A',
  '--shadow-1':          '0 1px 2px rgba(0,0,0,0.04)',
  '--shadow-2':          '0 2px 8px rgba(0,0,0,0.06)',
  '--shadow-3':          '0 4px 12px rgba(0,0,0,0.08)',
};

const DARK_CSS_VARS: Record<string, string> = {
  '--paper':             '#1a1815',
  '--paper-deep':        '#120f0c',
  '--paper-surface':     '#24211d',
  '--paper-hover':       '#2d2a25',
  '--ink':               '#efeadd',
  '--ink-2':             '#cfc7b6',
  '--ink-3':             '#9a9385',
  '--ink-4':             '#6f6a5e',
  '--rule':              '#3a352e',
  '--rule-2':            '#2c2822',
  '--btn-primary':       '#efeadd',
  '--btn-primary-ink':   '#1a1815',
  '--btn-primary-hover': '#cfc7b6',
  '--accent-fill':       '#efeadd',
  '--accent-fill-ink':   '#1a1815',
  '--danger':            '#C47A7A',
  '--success':           '#7BAA8A',
  '--warning':           '#D4B47A',
  '--info':              '#7B9EB2',
  '--shadow-1':          '0 1px 2px rgba(0,0,0,0.35)',
  '--shadow-2':          '0 2px 8px rgba(0,0,0,0.45)',
  '--shadow-3':          '0 8px 24px rgba(0,0,0,0.55)',
};

/* Structural tokens that never change with theme or accent */
const STATIC_CSS_VARS: Record<string, string> = {
  '--r-sm':  '2px',
  '--r-md':  '4px',
  '--r-lg':  '6px',
  '--r-xl':  '8px',
  '--s-1':   '4px',
  '--s-2':   '8px',
  '--s-3':   '12px',
  '--s-4':   '16px',
  '--s-5':   '20px',
  '--s-6':   '24px',
  '--s-7':   '32px',
  '--s-8':   '48px',
  '--s-9':   '64px',
  '--s-10':  '96px',
  '--serif':  "'Playfair Display', Georgia, serif",
  '--sans':   "'Lato', -apple-system, sans-serif",
  '--mono':   "'JetBrains Mono', ui-monospace, Menlo, monospace",
  '--brand':  "'Josefin Sans', 'Inter', sans-serif",
  '--ui':     "'Lato', -apple-system, sans-serif",
};

/* Apply structural vars once at module load */
const root = document.documentElement;
Object.entries(STATIC_CSS_VARS).forEach(([k, v]) => root.style.setProperty(k, v));

/* ── Color derivation helpers ────────────────────────────────────────────── */

function hexToRgbParts(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function isLightHex(hex: string): boolean {
  const [r, g, b] = hexToRgbParts(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.75;
}

function deriveAccentStroke(hex: string): string {
  const [r, g, b] = hexToRgbParts(hex);
  return `rgb(${Math.round(r * 0.75)},${Math.round(g * 0.75)},${Math.round(b * 0.75)})`;
}

function deriveDarker(hex: string, factor: number): string {
  const [r, g, b] = hexToRgbParts(hex);
  return `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`;
}

function R({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export function App() {
  const headerColor = useUIStore(s => s.headerColor);
  // Dark mode disabled until fully styled — force light for everyone
  const activeTheme = lightTheme;

  useEffect(() => {
    const color = headerColor || '#2d2c2a';
    const isDark = false;
    const [r, g, b] = hexToRgbParts(color);

    root.setAttribute('data-theme', 'light');

    /* Theme-based tokens (flip between light and dark) */
    const themeVars = LIGHT_CSS_VARS;
    Object.entries(themeVars).forEach(([k, v]) => root.style.setProperty(k, v));

    /* Accent-derived tokens (from user's header color) */
    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-hover', deriveDarker(color, 0.85));
    root.style.setProperty('--accent-tint', `rgba(${r},${g},${b},0.12)`);
    root.style.setProperty('--accent-stroke', deriveAccentStroke(color));
    root.style.setProperty('--h-active', color);
    root.style.setProperty('--h-active-ink', isLightHex(color) ? 'rgba(0,0,0,0.85)' : '#f0ebdf');
    root.style.setProperty('--focus', `0 0 0 2px rgba(${r},${g},${b},0.28)`);

    /* Legacy vars for existing components that depend on them */
    root.style.setProperty('--focus-color', color);
    root.style.setProperty('--focus-color-rgb', `${r},${g},${b}`);
  }, [headerColor]);

  return (
    <ThemeProvider theme={activeTheme}>
      <GlobalStyle />
      <AuthProvider>
        <EncryptionProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginView />} />
              <Route path="/register" element={<RegisterView />} />
              <Route path="/recover" element={<RecoverView />} />
              <Route path="/share/:token" element={<SharedEntryView />} />

              {/* Core */}
              <Route path="/" element={<R><DashboardView /></R>} />
              <Route path="/journal" element={<R><JournalView /></R>} />
              <Route path="/settings" element={<R><SettingsView /></R>} />
              <Route path="/topics" element={<R><TopicsView /></R>} />
              <Route path="/calendar" element={<R><CalendarView /></R>} />
              <Route path="/goals" element={<R><GoalsView /></R>} />
              <Route path="/goals/milestones" element={<R><GoalsView /></R>} />
              <Route path="/goals/tasks" element={<R><GoalsView /></R>} />
              <Route path="/goals/todos" element={<R><GoalsView /></R>} />
              <Route path="/goals/filter" element={<R><PlannerFilterView /></R>} />
              <Route path="/menu" element={<R><MenuView /></R>} />
              <Route path="/shopping" element={<R><ShoppingListsView /></R>} />

              {/* Health */}
              <Route path="/health" element={<R><TopicEntriesView title="Health" topicNames={['Medication', 'Symptom', 'Food', 'Exercise', 'Allergy']} navBar={<HealthTabBar />} /></R>} />
              <Route path="/health/meds" element={<R><TopicEntriesView title="Medications" titleTo="/health" topicNames={['Medication']} metaFields={[{ key: 'dosage', label: 'Dosage' }, { key: 'frequency', label: 'Frequency' }, { key: 'isActive', label: 'Active' }]} showDateFilter={false} printable navBar={<HealthTabBar />} /></R>} />
              <Route path="/health/schedule" element={<R><MedicationScheduleView /></R>} />
              <Route path="/health/food" element={<R><TopicEntriesView title="Meals" titleTo="/health" topicNames={['Food']} metaFields={[{ key: 'mealType', label: 'Meal' }, { key: 'calories', label: 'Calories' }, { key: 'ingredients', label: 'Ingredients' }]} summaryFields={[{ key: 'calories', label: 'Total Calories' }]} navBar={<HealthTabBar />} /></R>} />
              <Route path="/health/symptoms" element={<R><TopicEntriesView title="Symptoms" titleTo="/health" topicNames={['Symptom']} metaFields={[{ key: 'severity', label: 'Severity' }, { key: 'duration', label: 'Duration' }]} printable navBar={<HealthTabBar />} /></R>} />
              <Route path="/health/exercise" element={<R><TopicEntriesView title="Exercise" titleTo="/health" topicNames={['Exercise']} metaFields={[{ key: 'exerciseType', label: 'Type' }, { key: 'duration', label: 'Duration' }, { key: 'intensity', label: 'Intensity' }]} summaryFields={[{ key: 'duration', label: 'Total Minutes' }, { key: 'calories', label: 'Total Calories' }]} navBar={<HealthTabBar />} /></R>} />
              <Route path="/health/allergies" element={<R><TopicEntriesView title="Allergies" titleTo="/health" topicNames={['Allergy']} metaFields={[{ key: 'severity', label: 'Severity' }, { key: 'allergen', label: 'Allergen' }, { key: 'reaction', label: 'Reaction' }]} printable navBar={<HealthTabBar />} /></R>} />
              <Route path="/health/reporting" element={<R><HealthReportingView /></R>} />

              {/* Entertainment */}
              <Route path="/entertainment/music" element={<R><TopicEntriesView title="Music" topicNames={['Music']} showDateFilter={false} /></R>} />
              <Route path="/entertainment/books" element={<R><TopicEntriesView title="Books" topicNames={['Books']} showDateFilter={false} /></R>} />
              <Route path="/entertainment/tv" element={<R><TopicEntriesView title="TV/Movies" topicNames={['TV/Movies']} showDateFilter={false} /></R>} />

              {/* Inspiration */}
              <Route path="/inspiration/research" element={<R><TopicEntriesView title="Research" topicNames={['Research']} showDateFilter={false} /></R>} />
              <Route path="/inspiration/ideas" element={<R><TopicEntriesView title="Ideas" topicNames={['Idea']} showDateFilter={false} /></R>} />
              <Route path="/inspiration/quotes" element={<R><TopicEntriesView title="Quotes" topicNames={['Quote']} showDateFilter={false} /></R>} />
            </Routes>
          </BrowserRouter>
        </EncryptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
