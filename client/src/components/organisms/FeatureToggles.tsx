import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Toggle } from '../atoms/Toggle.js';
import { settings as settingsApi } from '../../services/api.js';
import { useUIStore } from '../../stores/uiStore.js';

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

const SectionTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.h3.fontFamily};
  font-size: ${({ theme }) => theme.typography.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.h3.fontWeight};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ToggleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const features = [
  { key: 'foodEnabled', label: 'Food Tracking' },
  { key: 'medicationEnabled', label: 'Medication Tracking' },
  { key: 'goalsEnabled', label: 'Goals & Milestones' },
  { key: 'exerciseEnabled', label: 'Exercise Tracking' },
  { key: 'allergiesEnabled', label: 'Allergies & Sensitivities' },
];

export function FeatureToggles() {
  const themeMode = useUIStore(s => s.themeMode);
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    settingsApi.getAll().then(settings => {
      const map: Record<string, boolean> = {};
      for (const s of settings) {
        if (typeof s.value === 'boolean') map[s.key] = s.value;
      }
      setFlags(map);
    }).catch(console.error);
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    setFlags(prev => ({ ...prev, [key]: value }));
    try {
      await settingsApi.upsert(key, value);
    } catch (err) {
      console.error('Failed to save toggle:', err);
      setFlags(prev => ({ ...prev, [key]: !value }));
    }
  };

  return (
    <Section>
      <SectionTitle>Features</SectionTitle>
      <ToggleList>
        {features.map(f => (
          <Toggle
            key={f.key}
            checked={flags[f.key] ?? false}
            onChange={v => handleToggle(f.key, v)}
            label={f.label}
            activeColor={themeMode === 'dark' ? '#2D2C2A' : '#ecebe7'}
          />
        ))}
      </ToggleList>
    </Section>
  );
}
