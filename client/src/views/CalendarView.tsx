import { useState, useMemo, useCallback } from 'react';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { CalendarGrid } from '../components/organisms/CalendarGrid.js';
import { CalendarDayDetail } from '../components/organisms/CalendarDayDetail.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useInitializeData } from '../hooks/useInitializeData.js';

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function CalendarView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#4E6E7E';
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const entry of entries) {
      const d = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
      const key = toDateStr(d);
      const arr = map.get(key) || [];
      arr.push(entry);
      map.set(key, arr);
    }
    return map;
  }, [entries]);

  const getTopicName = useCallback((entry: typeof entries[number]) => {
    const taxId = (entry.metadata as Record<string, unknown>)?._taxonomyId as number | undefined;
    const topic = taxId ? allTopics.find(t => t.id === taxId) : undefined;
    return topic?.name;
  }, [allTopics]);

  const handleDayClick = useCallback((dateStr: string) => {
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  }, []);

  const handleEntryClick = useCallback((entryId: number) => {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
      const d = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt);
      setSelectedDate(toDateStr(d));
    }
  }, [entries]);

  const goToPrev = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNext = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const selectedEntries = useMemo(() => {
    if (!selectedDate) return [];
    return entriesByDate.get(selectedDate) || [];
  }, [selectedDate, entriesByDate]);

  if (needsUnlock) return (<><ContentTemplate><EmptyState message="Unlock your journal to view calendar" /></ContentTemplate><UnlockDialog onUnlock={handleUnlock} /></>);
  if (isLoading || !isReady) return (<ContentTemplate><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Spinner size={40} /></div></ContentTemplate>);

  return (
    <ContentTemplate>
      {!selectedDate && (
        <CalendarGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          entriesByDate={entriesByDate}
          accentColor={headerColor}
          onPrevMonth={goToPrev}
          onNextMonth={goToNext}
          onDayClick={handleDayClick}
          onEntryClick={handleEntryClick}
          getTopicName={getTopicName}
        />
      )}

      {selectedDate && (
        <CalendarDayDetail
          dateStr={selectedDate}
          entries={selectedEntries}
          allTopics={allTopics}
          accentColor={headerColor}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </ContentTemplate>
  );
}
