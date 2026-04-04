import { useState, useMemo, useCallback, useEffect } from 'react';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { ViewHeader } from '../components/molecules/ViewHeader.js';
import { FilterTabs } from '../components/molecules/FilterTabs.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { HealthReport } from '../components/organisms/HealthReport.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import { doses as dosesApi } from '../services/api.js';
import { stripHtml } from '../utils/stripHtml.js';
import { useNavigate } from 'react-router-dom';
import type { PeriodType } from '../types/health.js';
import type {
  DecryptedSymptom,
  DecryptedFood,
  DecryptedMedicationLog,
  DecryptedExercise,
} from '../utils/correlationAnalysis.js';

/* ── Period filter ── */

const PERIOD_OPTIONS = [
  { value: 'week' as const, label: 'Week' },
  { value: 'month' as const, label: 'Month' },
  { value: 'year' as const, label: 'Year' },
];

/* ── Helpers ── */

function getDateRange(period: PeriodType): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  if (period === 'week') start.setDate(end.getDate() - 7);
  else if (period === 'month') start.setMonth(end.getMonth() - 1);
  else start.setFullYear(end.getFullYear() - 1);
  return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
}

/* ── View ── */

export function HealthReportingView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#4E6E7E';
  const navigate = useNavigate();

  const [period, setPeriod] = useState<PeriodType>('month');
  const [medLogs, setMedLogs] = useState<DecryptedMedicationLog[]>([]);

  // Resolve topic IDs
  const topicIdMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of allTopics) map[t.name.toLowerCase()] = t.id;
    return map;
  }, [allTopics]);

  const { startDate, endDate } = useMemo(() => getDateRange(period), [period]);

  // Filter entries by topic and date range
  const filterByTopic = useCallback((topicName: string) => {
    const tid = topicIdMap[topicName.toLowerCase()];
    if (!tid) return [];
    return entries.filter(e => {
      const meta = e.metadata as Record<string, unknown> | undefined;
      if (!meta || meta._taxonomyId !== tid) return false;
      const d = (e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt)).toISOString().split('T')[0];
      return d >= startDate && d <= endDate;
    });
  }, [entries, topicIdMap, startDate, endDate]);

  // Build typed arrays from decrypted entries
  const symptoms: DecryptedSymptom[] = useMemo(() =>
    filterByTopic('symptom').map(e => {
      const cf = ((e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown>) || {};
      const dateStr = (cf.occurredDate as string) || '';
      const timeStr = (cf.occurredTime as string) || '12:00';
      const occurredAt = dateStr ? `${dateStr}T${timeStr}:00` : (e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt)).toISOString();
      return { id: e.id, name: stripHtml(e.content).slice(0, 120), severity: (cf.severity as number) || 5, occurredAt };
    }), [filterByTopic]);

  const foods: DecryptedFood[] = useMemo(() =>
    filterByTopic('food').map(e => {
      const cf = ((e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown>) || {};
      const dateStr = (cf.consumedDate as string) || '';
      const timeStr = (cf.consumedTime as string) || '12:00';
      const consumedAt = dateStr ? `${dateStr}T${timeStr}:00` : (e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt)).toISOString();
      const rawIngredients = (cf.ingredients as string) || '';
      const ingredients = rawIngredients ? rawIngredients.split(',').map(s => s.trim()).filter(Boolean) : [];
      const rawCal = cf.calories;
      const calories = typeof rawCal === 'number' ? rawCal : (typeof rawCal === 'string' ? parseInt(rawCal, 10) || undefined : undefined);
      return { id: e.id, name: stripHtml(e.content).slice(0, 120), consumedAt, ingredients, calories, mealType: (cf.mealType as string) || undefined };
    }), [filterByTopic]);

  const exercises: DecryptedExercise[] = useMemo(() =>
    filterByTopic('exercise').map(e => {
      const cf = ((e.metadata as Record<string, unknown>)?._customFields as Record<string, unknown>) || {};
      const dateStr = (cf.performedDate as string) || '';
      const timeStr = (cf.performedTime as string) || '12:00';
      const performedAt = dateStr ? `${dateStr}T${timeStr}:00` : (e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt)).toISOString();
      const dur = cf.duration;
      return {
        id: e.id, name: stripHtml(e.content).slice(0, 120),
        exerciseType: (cf.exerciseType as string) || 'other',
        duration: typeof dur === 'number' ? dur : (typeof dur === 'string' ? parseInt(dur, 10) || 0 : 0),
        intensity: (cf.intensity as string) || 'medium', performedAt,
      };
    }), [filterByTopic]);

  // Fetch medication dose logs for the date range
  useEffect(() => {
    if (!isReady) return;
    const medTopicId = topicIdMap['medication'];
    if (!medTopicId) { setMedLogs([]); return; }

    // Build medication name map from entries
    const medEntries = entries.filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === medTopicId);
    const nameMap = new Map<number, string>();
    for (const e of medEntries) nameMap.set(e.id, stripHtml(e.content).slice(0, 120) || 'Unknown');

    const fetchLogs = async () => {
      const logs: DecryptedMedicationLog[] = [];
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');
      const day = new Date(start);

      while (day <= end) {
        const dateStr = day.toISOString().split('T')[0];
        try {
          const data = await dosesApi.getByDate(dateStr);
          for (const log of data.logs) {
            if (log.status === 'taken' && log.takenAt) {
              logs.push({
                id: log.id,
                medicationPostId: log.medicationPostId,
                medicationName: nameMap.get(log.medicationPostId) || 'Unknown',
                takenAt: `${dateStr}T${log.scheduledTime.substring(0, 5)}:00`,
              });
            }
          }
        } catch { /* skip */ }
        day.setDate(day.getDate() + 1);
      }
      setMedLogs(logs);
    };

    fetchLogs();
  }, [isReady, startDate, endDate, entries, topicIdMap]);

  if (needsUnlock) return (<><ContentTemplate><EmptyState message="Unlock your journal to view reports" /></ContentTemplate><UnlockDialog onUnlock={handleUnlock} /></>);
  if (isLoading || !isReady) return (<ContentTemplate><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Spinner size={40} /></div></ContentTemplate>);

  return (
    <ContentTemplate>
      <ViewHeader title="Health Reporting" onBack={() => navigate('/')} />
      <div style={{ padding: '0 20px 8px' }}>
        <FilterTabs options={PERIOD_OPTIONS} active={period} onChange={setPeriod} />
      </div>

      <HealthReport
        symptoms={symptoms}
        foods={foods}
        medLogs={medLogs}
        exercises={exercises}
        period={period}
        headerColor={headerColor}
      />
    </ContentTemplate>
  );
}
