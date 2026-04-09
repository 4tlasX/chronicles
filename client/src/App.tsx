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
import { TopicEntriesView } from './views/TopicEntriesView.js';
import { MedicationScheduleView } from './views/MedicationScheduleView.js';
import { HealthReportingView } from './views/HealthReportingView.js';
import { MenuView } from './views/MenuView.js';
import { ShoppingListsView } from './views/ShoppingListsView.js';
import { DashboardView } from './views/DashboardView.js';

function R({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export function App() {
  const themeMode = useUIStore(s => s.themeMode);
  const headerColor = useUIStore(s => s.headerColor);
  const activeTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const color = headerColor || '#4E6E7E';
    document.documentElement.style.setProperty('--focus-color', color);
    document.documentElement.style.setProperty('--focus-color-rgb', hexToRgb(color));
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
              <Route path="/menu" element={<R><MenuView /></R>} />
              <Route path="/shopping" element={<R><ShoppingListsView /></R>} />

              {/* Health */}
              <Route path="/health" element={<R><TopicEntriesView title="Health" topicNames={['Medication', 'Symptom', 'Food', 'Exercise', 'Allergy']} /></R>} />
              <Route path="/health/meds" element={<R><TopicEntriesView title="Medications" topicNames={['Medication']} metaFields={[{ key: 'dosage', label: 'Dosage' }, { key: 'frequency', label: 'Frequency' }, { key: 'isActive', label: 'Active' }]} showDateFilter={false} printable /></R>} />
              <Route path="/health/schedule" element={<R><MedicationScheduleView /></R>} />
              <Route path="/health/food" element={<R><TopicEntriesView title="Food" topicNames={['Food']} metaFields={[{ key: 'mealType', label: 'Meal' }, { key: 'calories', label: 'Calories' }, { key: 'ingredients', label: 'Ingredients' }]} summaryFields={[{ key: 'calories', label: 'Total Calories' }]} /></R>} />
              <Route path="/health/symptoms" element={<R><TopicEntriesView title="Symptoms" topicNames={['Symptom']} metaFields={[{ key: 'severity', label: 'Severity' }, { key: 'duration', label: 'Duration' }]} printable /></R>} />
              <Route path="/health/exercise" element={<R><TopicEntriesView title="Exercise" topicNames={['Exercise']} metaFields={[{ key: 'exerciseType', label: 'Type' }, { key: 'duration', label: 'Duration' }, { key: 'intensity', label: 'Intensity' }]} summaryFields={[{ key: 'duration', label: 'Total Minutes' }, { key: 'calories', label: 'Total Calories' }]} /></R>} />
              <Route path="/health/allergies" element={<R><TopicEntriesView title="Allergies" topicNames={['Allergy']} metaFields={[{ key: 'severity', label: 'Severity' }, { key: 'allergen', label: 'Allergen' }, { key: 'reaction', label: 'Reaction' }]} printable /></R>} />
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
