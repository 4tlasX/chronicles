import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Select } from '../atoms/Select.js';
import { FormField } from '../molecules/FormField.js';
import { settings as settingsApi } from '../../services/api.js';

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.md}px;
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Phoenix',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function TimezoneSelector() {
  const [timezone, setTimezone] = useState(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  useEffect(() => {
    settingsApi.getAll().then(settings => {
      const tz = settings.find(s => s.key === 'timezone');
      if (tz && typeof tz.value === 'string') setTimezone(tz.value);
    }).catch(() => {});
  }, []);

  const handleChange = async (tz: string) => {
    setTimezone(tz);
    try {
      await settingsApi.upsert('timezone', tz);
    } catch (err) {
      console.error('Failed to save timezone:', err);
    }
  };

  return (
    <Section>
      <SectionTitle>Preferences</SectionTitle>
      <FormField label="Timezone">
        <Select value={timezone} onChange={e => handleChange(e.target.value)}>
          <option value="">System default ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
          {TIMEZONES.map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </Select>
      </FormField>
    </Section>
  );
}
