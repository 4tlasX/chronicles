import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from '@shared/theme/tokens';
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

function R({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export function App() {
  return (
    <ThemeProvider theme={theme}>
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
              <Route path="/" element={<R><JournalView /></R>} />
              <Route path="/settings" element={<R><SettingsView /></R>} />
              <Route path="/topics" element={<R><TopicsView /></R>} />
              <Route path="/calendar" element={<R><CalendarView /></R>} />
              <Route path="/goals" element={<R><GoalsView /></R>} />
              <Route path="/goals/milestones" element={<R><GoalsView /></R>} />

              {/* Health */}
              <Route path="/health" element={<R><TopicEntriesView title="Health" topicNames={['Medication', 'Symptom', 'Food', 'Exercise']} /></R>} />
              <Route path="/health/meds" element={<R><TopicEntriesView title="Medications" topicNames={['Medication']} metaFields={[{ key: 'dosage', label: 'Dosage' }, { key: 'frequency', label: 'Frequency' }, { key: 'isActive', label: 'Active' }]} /></R>} />
              <Route path="/health/schedule" element={<R><TopicEntriesView title="Medication Schedule" topicNames={['Medication']} metaFields={[{ key: 'dosage', label: 'Dosage' }, { key: 'scheduleTimes', label: 'Times' }]} /></R>} />
              <Route path="/health/food" element={<R><TopicEntriesView title="Food" topicNames={['Food']} metaFields={[{ key: 'mealType', label: 'Meal' }, { key: 'calories', label: 'Calories' }, { key: 'ingredients', label: 'Ingredients' }]} /></R>} />
              <Route path="/health/symptoms" element={<R><TopicEntriesView title="Symptoms" topicNames={['Symptom']} metaFields={[{ key: 'severity', label: 'Severity' }, { key: 'duration', label: 'Duration' }]} /></R>} />
              <Route path="/health/exercise" element={<R><TopicEntriesView title="Exercise" topicNames={['Exercise']} metaFields={[{ key: 'exerciseType', label: 'Type' }, { key: 'duration', label: 'Duration' }, { key: 'intensity', label: 'Intensity' }]} /></R>} />
              <Route path="/health/reporting" element={<R><TopicEntriesView title="Health Reporting" topicNames={['Medication', 'Symptom', 'Food', 'Exercise']} /></R>} />

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
