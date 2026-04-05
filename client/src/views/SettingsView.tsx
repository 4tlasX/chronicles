import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { SettingsTemplate } from '../components/templates/SettingsTemplate.js';
import { SettingsCard, SettingsRow } from '../components/molecules/SettingsCard.js';
import {
  HeaderRow, Title, SectionTitle, SectionDescription, DangerTitle,
  CollapsibleHeader, CollapsibleTitle, CollapsibleDesc, CollapsibleBody,
  PrivacyCard, DangerCard, PasswordForm, SessionsList, SessionItem,
  ColorSection, ColorSectionTitle, ColorSectionDesc,
} from '../components/molecules/SettingsSection.js';
import { ActionButton, SignOutButton, SelectedColorLabel, BackLink } from '../components/atoms/SettingsAtoms.js';
import { Toggle } from '../components/atoms/Toggle.js';
import { Select } from '../components/atoms/Select.js';
import { PasswordInput } from '../components/atoms/PasswordInput.js';
import { TextInput } from '../components/atoms/TextInput.js';
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
import { auth as authApi, settings as settingsApi, sessions as sessionsApi, topics as topicsApi, entries as entriesApi } from '../services/api.js';
import { seedTestData } from '../utils/seedTestData.js';
import { HEADER_COLORS } from '@shared/theme/accentColors';
import { stripHtml } from '../utils/stripHtml.js';

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function splitCsvLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') i++;
      if (current.trim()) lines.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);
  return lines;
}

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
  const setTopics = useEntriesStore(s => s.setTopics);
  const seedTopics = useEntriesStore(s => s.topics);
  const setFeatureFlags = useEntriesStore(s => s.setFeatureFlags);
  const headerColor = useUIStore(s => s.headerColor);
  const setHeaderColor = useUIStore(s => s.setHeaderColor);
  const themeMode = useUIStore(s => s.themeMode);
  const setThemeMode = useUIStore(s => s.setThemeMode);
  const backgroundImage = useUIStore(s => s.backgroundImage);
  const setBackgroundImage = useUIStore(s => s.setBackgroundImage);
  const backgroundOpacity = useUIStore(s => s.backgroundOpacity);
  const setBackgroundOpacity = useUIStore(s => s.setBackgroundOpacity);
  const navigate = useNavigate();

  // How to Use
  const [showHowToUse, setShowHowToUse] = useState(false);

  // Email
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState(false);

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
      if (map.themeMode === 'light' || map.themeMode === 'dark') setThemeMode(map.themeMode);
      if (typeof map.backgroundImage === 'string') setBackgroundImage(map.backgroundImage);
      if (typeof map.backgroundOpacity === 'string') setBackgroundOpacity(parseFloat(map.backgroundOpacity as string));
      const f: Record<string, boolean> = {};
      for (const feat of FEATURES) {
        f[feat.key] = map[feat.key] === true;
      }
      setFeatures(f);
      setFeatureFlags(f);
    }).catch(() => {});
  }, []);

  // Handlers
  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setEmailLoading(true);
    setEmailMessage('');
    setEmailError(false);
    try {
      const result = await authApi.changeEmail({ newEmail: newEmail.trim() });
      setEmailMessage('Email updated');
      setEditingEmail(false);
      setNewEmail('');
      if (user) (user as Record<string, unknown>).email = result.email;
    } catch (err) {
      setEmailError(true);
      setEmailMessage(err instanceof Error ? err.message : 'Failed to change email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleTimezoneChange = async (tz: string) => {
    setTimezone(tz);
    await settingsApi.upsert('timezone', tz).catch(() => {});
  };

  const handleHeaderColorChange = async (color: string) => {
    setHeaderColor(color);
    await settingsApi.upsert('headerColor', color).catch(() => {});
  };

  const handleThemeModeChange = async (mode: 'light' | 'dark') => {
    setThemeMode(mode);
    await settingsApi.upsert('themeMode', mode).catch(() => {});
  };

  const handleImageChange = async (image: string) => {
    setBackgroundImage(image);
    await settingsApi.upsert('backgroundImage', image).catch(() => {});
  };

  const handleOpacityChange = async (opacity: number) => {
    setBackgroundOpacity(opacity);
    await settingsApi.upsert('backgroundOpacity', String(opacity)).catch(() => {});
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
      const { salt, wrappedMK, wrapIv } = await rewrapMasterKey(newPw, currentPw);
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
      const freshTopics = await topicsApi.getAll(); // triggers auto-seed on server
      setTopics(freshTopics as typeof allTopics);
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

  // Import CSV
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleImportCsv = async (file: File) => {
    setImporting(true);
    setImportResult('');
    try {
      const text = await file.text();
      const lines = splitCsvLines(text);
      if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

      const headers = parseCsvRow(lines[0]).map(h => h.trim());
      const dateIdx = headers.findIndex(h => h.toLowerCase() === 'date');
      const contentIdx = headers.findIndex(h => h.toLowerCase() === 'content');
      const topicIdx = headers.findIndex(h => h.toLowerCase() === 'topic');
      const bookmarkedIdx = headers.findIndex(h => h.toLowerCase() === 'bookmarked');

      if (contentIdx === -1) throw new Error('CSV must have a "Content" column');
      if (dateIdx === -1) throw new Error('CSV must have a "Date" column');

      // Build topic name → id map (case-insensitive)
      const topicNameMap = new Map<string, number>();
      for (const t of allTopics) {
        topicNameMap.set(t.name.toLowerCase(), t.id);
      }

      // Known non-custom-field columns
      const skipHeaders = new Set(['id', 'date', 'updated', 'topic', 'content', 'bookmarked']);

      let imported = 0;
      let skipped = 0;
      const total = lines.length - 1;

      for (let i = 1; i < lines.length; i++) {
        const fields = parseCsvRow(lines[i]);
        const content = fields[contentIdx]?.trim();
        const dateStr = fields[dateIdx]?.trim();

        if (!content || !dateStr) { skipped++; continue; }

        // Build metadata
        const metadata: Record<string, unknown> = {};
        const customFields: Record<string, unknown> = {};

        // Topic
        if (topicIdx !== -1 && fields[topicIdx]?.trim()) {
          const topicId = topicNameMap.get(fields[topicIdx].trim().toLowerCase());
          if (topicId) metadata._taxonomyId = topicId;
        }

        // Bookmarked
        if (bookmarkedIdx !== -1 && fields[bookmarkedIdx]?.trim().toLowerCase() === 'yes') {
          customFields._isFavorite = true;
        }

        // Custom fields from extra columns
        for (let h = 0; h < headers.length; h++) {
          if (skipHeaders.has(headers[h].toLowerCase()) || h >= fields.length) continue;
          const val = fields[h]?.trim();
          if (!val) continue;
          if (val.toLowerCase() === 'yes') customFields[headers[h]] = true;
          else if (val.toLowerCase() === 'no') customFields[headers[h]] = false;
          else customFields[headers[h]] = val;
        }

        if (Object.keys(customFields).length > 0) {
          metadata._customFields = customFields;
        }

        // Wrap plain text in HTML paragraphs for TipTap
        const htmlContent = content.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');

        // Encrypt
        const encrypted = await encryptPost(htmlContent, metadata);

        // Parse date
        const createdAt = new Date(dateStr).toISOString();

        // Create entry via API
        const taxonomyIds = metadata._taxonomyId ? [metadata._taxonomyId as number] : [];
        const result = await entriesApi.create({
          contentEncrypted: encrypted.contentEncrypted,
          contentIv: encrypted.contentIv,
          metadataEncrypted: encrypted.metadataEncrypted,
          metadataIv: encrypted.metadataIv,
          isEncrypted: true,
          taxonomyIds,
          createdAt,
        });

        // Add to local store
        addDecryptedEntry({
          id: result.id as number,
          content: htmlContent,
          metadata,
          isEncrypted: true,
          createdAt: new Date(result.createdAt as string),
          updatedAt: new Date((result.updatedAt || result.createdAt) as string),
        });

        imported++;
        setImportResult(`Importing ${imported} of ${total}...`);
      }

      setImportResult(`Imported ${imported} entries${skipped > 0 ? `, ${skipped} skipped` : ''}`);
    } catch (err) {
      setImportResult(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setImporting(false);
      if (importFileRef.current) importFileRef.current.value = '';
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
        <BackLink to="/"><FontAwesomeIcon icon={faChevronLeft} size="xs" /> Back to Journal</BackLink>
      </HeaderRow>

      {/* Account */}
      <SectionTitle>Account</SectionTitle>
      <SettingsCard>
        <SettingsRow
          title="Email"
          description={!editingEmail ? (user?.email || 'Unknown') : undefined}
          action={
            !editingEmail ? (
              <ActionButton onClick={() => { setEditingEmail(true); setNewEmail(user?.email || ''); setEmailMessage(''); }}>
                Change
              </ActionButton>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <ActionButton onClick={handleChangeEmail} disabled={emailLoading || !newEmail.trim()}>
                  {emailLoading ? <Spinner size={14} /> : 'Save'}
                </ActionButton>
                <ActionButton onClick={() => { setEditingEmail(false); setNewEmail(''); setEmailMessage(''); }}>
                  Cancel
                </ActionButton>
              </div>
            )
          }
        >
          {editingEmail && (
            <TextInput
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="New email address"
              type="email"
              autoFocus
              style={{ marginTop: 4 }}
            />
          )}
        </SettingsRow>
        {emailMessage && <div style={{ padding: '0 0 12px', fontSize: 13, color: emailError ? '#ef4444' : '#22c55e' }}>{emailMessage}</div>}
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
          <ColorSectionTitle>Appearance</ColorSectionTitle>
          <ColorSectionDesc>Choose light or dark mode</ColorSectionDesc>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="secondary"
              onClick={() => handleThemeModeChange('light')}
              style={{
                flex: 1,
                background: themeMode === 'light' ? '#ecebe7' : 'transparent',
                border: themeMode === 'light' ? '1px solid #b5b3ae' : undefined,
                fontWeight: themeMode === 'light' ? 600 : 400,
              }}
            >
              Light
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleThemeModeChange('dark')}
              style={{
                flex: 1,
                background: themeMode === 'dark' ? '#1a1b1d' : 'transparent',
                color: themeMode === 'dark' ? 'white' : undefined,
                border: themeMode === 'dark' ? 'none' : undefined,
                fontWeight: themeMode === 'dark' ? 600 : 400,
              }}
            >
              Dark
            </Button>
          </div>
        </ColorSection>
        <ColorSection>
          <ColorSectionTitle>Header and Accent Color</ColorSectionTitle>
          <ColorSectionDesc>Choose a color for the header bar and accents</ColorSectionDesc>
          <ColorPicker colors={HEADER_COLORS} selected={headerColor} onChange={handleHeaderColorChange} />
          <SelectedColorLabel>Selected: {selectedColorLabel}</SelectedColorLabel>
        </ColorSection>
        <ColorSection style={{ borderBottom: 'none' }}>
          <ColorSectionTitle>Background Pattern</ColorSectionTitle>
          <ColorSectionDesc>Choose a subtle paper texture for the background</ColorSectionDesc>
          <BackgroundPicker
            selected={backgroundImage}
            onImageChange={handleImageChange}
          />
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
            <ActionButton onClick={handleChangePassword} disabled={pwLoading}>
              {pwLoading ? <Spinner size={14} /> : 'Update Password'}
            </ActionButton>
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
            action={<Toggle checked={features[feat.key] ?? false} onChange={v => handleFeatureToggle(feat.key, v)} activeColor={themeMode === 'dark' ? '#2D2C2A' : '#ecebe7'} />}
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
        <SettingsRow
          title="Import Entries"
          description="Import entries from a CSV file (Date, Topic, Content, Bookmarked)"
          action={
            <>
              <input
                ref={importFileRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImportCsv(file);
                }}
              />
              <ActionButton onClick={() => importFileRef.current?.click()} disabled={importing}>
                {importing ? <Spinner size={14} /> : 'Import CSV'}
              </ActionButton>
            </>
          }
        />
        {importResult && <div style={{ padding: '0 20px 12px', fontSize: 13, color: importResult.startsWith('Failed') ? '#ef4444' : '#22c55e' }}>{importResult}</div>}
      </SettingsCard>

      {/* Privacy */}
      <SectionTitle>Privacy</SectionTitle>
      <PrivacyCard>
        <strong>Zero-Knowledge Encryption:</strong> Your journal entries are encrypted in your browser before being sent to the server. We cannot read your data. If you lose your password, your data cannot be recovered.
      </PrivacyCard>

      <DangerTitle />
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
