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

// Placeholder for Phase 2-4 views
function PlaceholderView({ name }: { name: string }) {
  return <div style={{ padding: 40, color: '#6b7280' }}>{name} — coming in next phase</div>;
}

function P(name: string) {
  return <ProtectedRoute><PlaceholderView name={name} /></ProtectedRoute>;
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

              {/* Phase 1 */}
              <Route path="/" element={<ProtectedRoute><JournalView /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
              <Route path="/topics" element={P('Topics')} />

              {/* Phase 2+ placeholders */}
              <Route path="/goals" element={P('Goals')} />
              <Route path="/calendar" element={P('Calendar')} />

              {/* Health sub-routes */}
              <Route path="/health" element={P('Health')} />
              <Route path="/health/meds" element={P('Medications')} />
              <Route path="/health/schedule" element={P('Medication Schedule')} />
              <Route path="/health/food" element={P('Food Tracking')} />
              <Route path="/health/symptoms" element={P('Symptoms')} />
              <Route path="/health/exercise" element={P('Exercise')} />
              <Route path="/health/reporting" element={P('Health Reporting')} />

              {/* Entertainment sub-routes */}
              <Route path="/entertainment/music" element={P('Music')} />
              <Route path="/entertainment/books" element={P('Books')} />
              <Route path="/entertainment/tv" element={P('TV/Movies')} />

              {/* Inspiration sub-routes */}
              <Route path="/inspiration/research" element={P('Research')} />
              <Route path="/inspiration/ideas" element={P('Ideas')} />
              <Route path="/inspiration/quotes" element={P('Quotes')} />
            </Routes>
          </BrowserRouter>
        </EncryptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
