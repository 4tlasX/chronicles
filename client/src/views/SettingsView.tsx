import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { SettingsTemplate } from '../components/templates/SettingsTemplate.js';
import { SettingsCard, SettingsRow } from '../components/molecules/SettingsCard.js';
import { Toggle } from '../components/atoms/Toggle.js';
import { Select } from '../components/atoms/Select.js';
import { PasswordInput } from '../components/atoms/PasswordInput.js';
import { Button } from '../components/atoms/Button.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { FormField } from '../components/molecules/FormField.js';
import { ColorPicker } from '../components/molecules/ColorPicker.js';
import { BackgroundPicker } from '../components/molecules/BackgroundPicker.js';
import { SessionRow } from '../components/molecules/SessionRow.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { useUIStore } from '../stores/uiStore.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useNavigate } from 'react-router-dom';
import { auth as authApi, settings as settingsApi, sessions as sessionsApi, topics as topicsApi } from '../services/api.js';
import { seedTestData } from '../utils/seedTestData.js';
import { HEADER_COLORS } from '@shared/theme/accentColors';

/* ── Styled ── */

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
`;

const BackLink = styled(Link)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 32px 0 12px;
`;

const SectionDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 12px;
`;

const CollapsibleHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 20px;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  cursor: pointer;
  text-align: left;
`;

const CollapsibleTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CollapsibleDesc = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

const CollapsibleBody = styled.div`
  padding: 16px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg}px ${({ theme }) => theme.borderRadius.lg}px;
  background: white;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PrivacyCard = styled.div`
  padding: 16px 20px;
  border: 1px solid #f5e6a3;
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: #fefce8;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
`;

const DangerTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.danger};
  margin: 32px 0 12px;
`;

const DangerCard = styled.div`
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: white;
  overflow: hidden;
`;

const PasswordForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: white;
`;

const SessionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 20px 16px;
`;

const SessionItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const SelectedColorLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 8px;
`;

const ColorSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ColorSectionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const ColorSectionDesc = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 12px;
`;

const ActionButton = styled.button`
  padding: 6px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.surfaceHover}; }
`;

const SignOutButton = styled.button`
  padding: 6px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.danger};
  background: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(239, 68, 68, 0.05); }
`;

const TIMEZONES = [
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKST)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
  { value: 'America/Denver', label: 'Mountain Time (MST)' },
  { value: 'America/Chicago', label: 'Central Time (CST)' },
  { value: 'America/New_York', label: 'Eastern Time (EST)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' },
  { value: 'UTC', label: 'UTC' },
];

const FEATURES = [
  { key: 'foodEnabled', title: 'Food', description: 'Track meals and nutrition' },
  { key: 'medicationEnabled', title: 'Medication', description: 'Track medications and health' },
  { key: 'goalsEnabled', title: 'Goal', description: 'Set and track goals' },
  { key: 'milestonesEnabled', title: 'Milestone', description: 'Break goals into milestones' },
  { key: 'exerciseEnabled', title: 'Exercise', description: 'Log workouts and fitness' },
  { key: 'allergiesEnabled', title: 'Allergy and Sensitivities', description: 'Track allergies and reactions' },
  { key: 'entertainmentEnabled', title: 'Entertainment', description: 'Track music, books, and TV/movies' },
  { key: 'inspirationEnabled', title: 'Inspiration', description: 'Save research, ideas, and quotes' },
];

/* ── View ── */

export function SettingsView() {
  const { user, logout } = useAuth();
  const { lock, rewrapMasterKey, encryptPost } = useEncryption();
  const clearAll = useEntriesStore(s => s.clearAll);
  const addDecryptedEntry = useEntriesStore(s => s.addDecryptedEntry);
  const decryptedEntries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const seedTopics = useEntriesStore(s => s.topics);
  const setFeatureFlags = useEntriesStore(s => s.setFeatureFlags);
  const headerColor = useUIStore(s => s.headerColor);
  const setHeaderColor = useUIStore(s => s.setHeaderColor);
  const backgroundImage = useUIStore(s => s.backgroundImage);
  const setBackgroundImage = useUIStore(s => s.setBackgroundImage);
  const navigate = useNavigate();

  // How to Use
  const [showHowToUse, setShowHowToUse] = useState(false);

  // Timezone
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Password
  const [showPassword, setShowPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState(false);

  // Sessions
  const [showSessions, setShowSessions] = useState(false);
  const [sessionList, setSessionList] = useState<{ id: number; deviceInfo: string | null; ipAddress: string | null; lastActiveAt: string; isCurrent: boolean }[]>([]);

  // Features
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  // Seeding
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState('');
  const [seedingEntries, setSeedingEntries] = useState(false);
  const [seedEntriesResult, setSeedEntriesResult] = useState('');

  // Load settings
  useEffect(() => {
    settingsApi.getAll().then(settings => {
      const map: Record<string, unknown> = {};
      for (const s of settings) map[s.key] = s.value;
      if (typeof map.timezone === 'string') setTimezone(map.timezone);
      if (typeof map.headerColor === 'string') setHeaderColor(map.headerColor);
      if (typeof map.backgroundImage === 'string') setBackgroundImage(map.backgroundImage);
      const f: Record<string, boolean> = {};
      for (const feat of FEATURES) {
        f[feat.key] = map[feat.key] === true;
      }
      setFeatures(f);
      setFeatureFlags(f);
    }).catch(() => {});
  }, []);

  // Handlers
  const handleTimezoneChange = async (tz: string) => {
    setTimezone(tz);
    await settingsApi.upsert('timezone', tz).catch(() => {});
  };

  const handleHeaderColorChange = async (color: string) => {
    setHeaderColor(color);
    await settingsApi.upsert('headerColor', color).catch(() => {});
  };

  const handleBackgroundChange = async (image: string) => {
    setBackgroundImage(image);
    await settingsApi.upsert('backgroundImage', image).catch(() => {});
  };

  const handleFeatureToggle = async (key: string, value: boolean) => {
    const updated = { ...features, [key]: value };
    setFeatures(updated);
    setFeatureFlags(updated);
    await settingsApi.upsert(key, value).catch(() => {});
  };

  const handleChangePassword = async () => {
    setPwMessage(''); setPwError(false);
    if (newPw !== confirmPw) { setPwMessage('Passwords do not match'); setPwError(true); return; }
    if (newPw.length < 12) { setPwMessage('Minimum 12 characters'); setPwError(true); return; }
    setPwLoading(true);
    try {
      const { salt, wrappedMK, wrapIv } = await rewrapMasterKey(newPw);
      await authApi.changePassword({ currentPassword: currentPw, newPassword: newPw, newEncryptedMasterKey: wrappedMK, newKekSalt: salt, newKekWrapIv: wrapIv });
      setPwMessage('Password changed'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setShowPassword(false);
    } catch (err) { setPwMessage(err instanceof Error ? err.message : 'Failed'); setPwError(true); }
    finally { setPwLoading(false); }
  };

  const handleLoadSessions = async () => {
    setShowSessions(!showSessions);
    if (!showSessions) {
      const data = await sessionsApi.getAll().catch(() => []);
      setSessionList(data as typeof sessionList);
    }
  };

  const handleRevokeSession = async (id: number) => {
    await sessionsApi.revoke(id);
    setSessionList(prev => prev.filter(s => s.id !== id));
  };

  const handleSeedTopics = async () => {
    setSeeding(true); setSeedResult('');
    try {
      await topicsApi.getAll(); // triggers auto-seed
      setSeedResult('Default topics created');
    } catch { setSeedResult('Failed'); }
    finally { setSeeding(false); }
  };

  const handleSeedEntries = async () => {
    setSeedingEntries(true); setSeedEntriesResult('');
    try {
      // Refresh topics first to make sure all defaults exist
      const freshTopics = await topicsApi.getAll();
      const result = await seedTestData({
        encryptPost,
        topics: freshTopics as { id: number; name: string; icon: string | null; color: string | null }[],
        addDecryptedEntry,
        onProgress: (msg) => setSeedEntriesResult(msg),
      });
      setSeedEntriesResult(result);
    } catch (err) {
      setSeedEntriesResult(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSeedingEntries(false);
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExportCsv = () => {
    setExporting(true);
    try {
      const topicMap = new Map(allTopics.map(t => [t.id, t.name]));

      const stripHtml = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      };

      const escCsv = (val: string) => {
        if (val.includes('"') || val.includes(',') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      };

      // Collect all custom field keys across entries
      const cfKeySet = new Set<string>();
      for (const entry of decryptedEntries) {
        const cf = (entry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> | undefined;
        if (cf) Object.keys(cf).forEach(k => { if (!k.startsWith('_')) cfKeySet.add(k); });
      }
      const cfKeys = [...cfKeySet].sort();

      const headers = ['ID', 'Date', 'Updated', 'Topic', 'Content', 'Bookmarked', ...cfKeys.map(k => k)];
      const rows = [headers.map(escCsv).join(',')];

      // Sort entries by date descending
      const sorted = [...decryptedEntries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      for (const entry of sorted) {
        const meta = entry.metadata as Record<string, unknown>;
        const cf = (meta?._customFields as Record<string, unknown>) || {};
        const topicId = meta?._taxonomyId as number | undefined;
        const topicName = topicId ? (topicMap.get(topicId) || '') : '';
        const bookmarked = cf._isFavorite ? 'Yes' : '';

        const row = [
          String(entry.id),
          new Date(entry.createdAt).toISOString().slice(0, 10),
          new Date(entry.updatedAt).toISOString().slice(0, 10),
          topicName,
          stripHtml(entry.content),
          bookmarked,
          ...cfKeys.map(k => {
            const v = cf[k];
            if (v == null) return '';
            if (typeof v === 'boolean') return v ? 'Yes' : 'No';
            return String(v);
          }),
        ];
        rows.push(row.map(escCsv).join(','));
      }

      const csv = rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chronicles-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleSignOut = async () => {
    lock(); clearAll(); await logout(); navigate('/login');
  };

  const selectedColorLabel = HEADER_COLORS.find(c => c.value === headerColor)?.label || 'Custom';

  return (
    <SettingsTemplate title="">
      <HeaderRow>
        <Title>Settings</Title>
        <BackLink to="/">Back to Journal</BackLink>
      </HeaderRow>

      {/* Account */}
      <SectionTitle>Account</SectionTitle>
      <SettingsCard>
        <SettingsRow title="Email" description={user?.email || 'Unknown'} />
      </SettingsCard>

      {/* How to Use */}
      <SectionTitle>How to Use Chronicles</SectionTitle>
      <CollapsibleHeader onClick={() => setShowHowToUse(!showHowToUse)} style={showHowToUse ? { borderRadius: '12px 12px 0 0' } : undefined}>
        <div>
          <CollapsibleTitle>Getting Started Guide</CollapsibleTitle>
          <CollapsibleDesc>Learn how to use Chronicles effectively</CollapsibleDesc>
        </div>
        <FontAwesomeIcon icon={showHowToUse ? faChevronUp : faChevronDown} color="#9ca3af" />
      </CollapsibleHeader>
      {showHowToUse && (
        <CollapsibleBody>
          <p><strong>Chronicles</strong> is designed as a simple daily log. Capture the key moments of your day in less than 10-15 minutes, then use topics to organize and find them later.</p>
          <p style={{ marginTop: 12 }}><strong>Topics</strong> are how you categorize entries — like tags or folders. Each has an icon and color. Some topics (Task, Goal, Food, etc.) show extra fields.</p>
          <p style={{ marginTop: 12 }}><strong>Quick Entry</strong> in the sidebar lets you add entries fast. Select a topic, type, and press Add or Enter.</p>
          <p style={{ marginTop: 12 }}><strong>Views:</strong> Date shows one day at a time. Tasks filters to todo items. All shows everything. Bookmarks shows favorites. Search lets you filter by text and date.</p>
        </CollapsibleBody>
      )}

      {/* Preferences */}
      <SectionTitle>Preferences</SectionTitle>
      <SettingsCard>
        <SettingsRow
          title="Timezone"
          description="Used to determine the current day for journal entries"
          action={
            <Select value={timezone} onChange={e => handleTimezoneChange(e.target.value)} style={{ width: 220 }}>
              {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
            </Select>
          }
        />
      </SettingsCard>

      {/* Theme */}
      <SectionTitle>Theme</SectionTitle>
      <SettingsCard>
        <ColorSection>
          <ColorSectionTitle>Header and Accent Color</ColorSectionTitle>
          <ColorSectionDesc>Choose a color for the header bar and accents</ColorSectionDesc>
          <ColorPicker colors={HEADER_COLORS} selected={headerColor} onChange={handleHeaderColorChange} />
          <SelectedColorLabel>Selected: {selectedColorLabel}</SelectedColorLabel>
        </ColorSection>
        <ColorSection style={{ borderBottom: 'none' }}>
          <ColorSectionTitle>Background Image</ColorSectionTitle>
          <ColorSectionDesc>Choose a background image for the app</ColorSectionDesc>
          <BackgroundPicker selected={backgroundImage} onChange={handleBackgroundChange} />
        </ColorSection>
      </SettingsCard>

      {/* Security */}
      <SectionTitle>Security</SectionTitle>
      <SettingsCard>
        <SettingsRow
          title="Password"
          description="Change your account password"
          action={<ActionButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Cancel' : 'Change'}</ActionButton>}
        />
        {showPassword && (
          <PasswordForm>
            {pwMessage && <div style={{ fontSize: 13, color: pwError ? '#ef4444' : '#22c55e' }}>{pwMessage}</div>}
            <FormField label="Current Password">
              <PasswordInput value={currentPw} onChange={e => setCurrentPw(e.target.value)} autoComplete="current-password" />
            </FormField>
            <FormField label="New Password">
              <PasswordInput value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 12 characters" autoComplete="new-password" />
            </FormField>
            <FormField label="Confirm New Password">
              <PasswordInput value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password" />
            </FormField>
            <Button onClick={handleChangePassword} disabled={pwLoading}>
              {pwLoading ? <Spinner size={14} /> : 'Update Password'}
            </Button>
          </PasswordForm>
        )}
        <SettingsRow
          title="Active Sessions"
          description="Manage your logged-in devices"
          action={<ActionButton onClick={handleLoadSessions}>{showSessions ? 'Hide' : 'View'}</ActionButton>}
        />
        {showSessions && (
          <SessionsList>
            {sessionList.map(s => (
              <SessionItem key={s.id}>
                <SessionRow
                  deviceInfo={s.deviceInfo}
                  ipAddress={s.ipAddress}
                  lastActiveAt={s.lastActiveAt}
                  isCurrent={s.isCurrent}
                  onRevoke={() => handleRevokeSession(s.id)}
                />
              </SessionItem>
            ))}
          </SessionsList>
        )}
      </SettingsCard>

      {/* Features */}
      <SectionTitle>Features</SectionTitle>
      <SectionDescription>Enable optional topics for specialized tracking</SectionDescription>
      <SettingsCard>
        {FEATURES.map(feat => (
          <SettingsRow
            key={feat.key}
            title={feat.title}
            description={feat.description}
            action={<Toggle checked={features[feat.key] ?? false} onChange={v => handleFeatureToggle(feat.key, v)} />}
          />
        ))}
      </SettingsCard>

      {/* Data */}
      <SectionTitle>Data</SectionTitle>
      <SettingsCard>
        <SettingsRow
          title="Default Topics"
          description="Create default journal topics if missing"
          action={
            <ActionButton onClick={handleSeedTopics} disabled={seeding}>
              {seeding ? <Spinner size={14} /> : 'Add Default Topics'}
            </ActionButton>
          }
        />
        {seedResult && <div style={{ padding: '0 20px 12px', fontSize: 13, color: '#22c55e' }}>{seedResult}</div>}
        <SettingsRow
          title="Seed Test Data"
          description="Create 18 test entries across all topic types with custom fields and linking"
          action={
            <ActionButton onClick={handleSeedEntries} disabled={seedingEntries}>
              {seedingEntries ? <Spinner size={14} /> : 'Seed Entries'}
            </ActionButton>
          }
        />
        {seedEntriesResult && <div style={{ padding: '0 20px 12px', fontSize: 13, color: seedEntriesResult.startsWith('Failed') ? '#ef4444' : '#22c55e' }}>{seedEntriesResult}</div>}
        <SettingsRow
          title="Export Entries"
          description="Download all entries as a decrypted CSV file"
          action={
            <ActionButton onClick={handleExportCsv} disabled={exporting || decryptedEntries.length === 0}>
              {exporting ? <Spinner size={14} /> : 'Export to CSV'}
            </ActionButton>
          }
        />
      </SettingsCard>

      {/* Privacy */}
      <SectionTitle>Privacy</SectionTitle>
      <PrivacyCard>
        <strong>Zero-Knowledge Encryption:</strong> Your journal entries are encrypted in your browser before being sent to the server. We cannot read your data. If you lose your password, your data cannot be recovered.
      </PrivacyCard>

      {/* Danger Zone */}
      <DangerTitle>Danger Zone</DangerTitle>
      <DangerCard>
        <SettingsRow
          title="Sign Out"
          description="Sign out of your account on this device"
          action={<SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>}
        />
      </DangerCard>

      <div style={{ height: 48 }} />
    </SettingsTemplate>
  );
}
