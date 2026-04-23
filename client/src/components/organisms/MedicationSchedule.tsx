import { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '../atoms/EmptyState.js';
import { Spinner } from '../atoms/Spinner.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { useUIStore } from '../../stores/uiStore.js';
import { doses as dosesApi } from '../../services/api.js';
import { stripHtml } from '../../utils/stripHtml.js';
import { toDateStr, formatTime12h, formatDateDisplay } from '../../utils/dateUtils.js';
import type { DoseLogRecord } from '../../services/api.js';
import type { ScheduledDose } from '../../types/health.js';

/* ── Styled ── */

const DateNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  @media (max-width: 768px) { padding: 12px 16px; }
  @media (max-width: 480px) { padding: 10px 12px; }
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const DateLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.text};
`;

const ProgressWrapper = styled.div`
  padding: 0 24px 16px;
  @media (max-width: 768px) { padding: 0 16px 14px; }
  @media (max-width: 480px) { padding: 0 12px 12px; }
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ProgressTrack = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $color }) => $color};
  border-radius: 3px;
  transition: width 0.4s ease;
`;

const AllDoneMsg = styled.p<{ $color: string }>`
  font-size: 15px;
  font-weight: 500;
  margin-top: 6px;
  color: ${({ $color }) => $color};
`;

const HelpText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 0 24px 24px;
  @media (max-width: 768px) { padding: 0 16px 24px; }
  @media (max-width: 480px) { padding: 0 12px 24px; }
`;

const TimeGroup = styled.div`
  padding: 0 var(--s-4, 16px);
  &:first-of-type { margin-top: 8px; }
`;

const TimeHeader = styled.div`
  padding: 16px 0 10px;
  font-family: var(--sans, 'Lato', sans-serif);
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-2, ${({ theme }) => theme.colors.text});
  @media (max-width: 480px) { padding: 14px 0 8px; font-size: 14px; }
`;

const DoseCard = styled.div<{ $taken: boolean; $accentColor: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  background: var(--paper-surface, #f7f4ee);
  border: 1px solid var(--rule, #d5d0c5);
  border-left: 3px solid ${({ $accentColor }) => $accentColor};
  border-radius: 6px;
  @media (max-width: 480px) { padding: 12px 14px; gap: 10px; }
`;

const DoseCheckButton = styled.button<{ $taken: boolean; $color: string }>`
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 4px;
  border: 1.5px solid ${({ $taken, $color, theme }) => $taken ? $color : theme.colors.border};
  background: ${({ $taken, $color }) => $taken ? $color : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
  color: white;
  font-size: 12px;
  line-height: 1;
  padding: 0;
  &:disabled { opacity: 0.5; cursor: wait; }
  &:hover:not(:disabled) { opacity: 0.8; }
`;

const DoseInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DoseName = styled.span<{ $taken: boolean; $color: string }>`
  font-size: 16px;
  font-weight: 500;
  font-style: italic;
  color: ${({ $taken, $color, theme }) => $taken ? $color : theme.colors.text};
  text-decoration: ${({ $taken }) => $taken ? 'line-through' : 'none'};
`;

const DoseTakenAt = styled.span<{ $color: string }>`
  font-size: 13px;
  margin-left: 8px;
  color: ${({ $color }) => $color};
`;

const StatusBadge = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text};
  flex-shrink: 0;
`;

/* ── Props ── */

interface MedicationScheduleProps {
  isReady: boolean;
}

/* ── Component ── */

export function MedicationSchedule({ isReady }: MedicationScheduleProps) {
  const entries = useEntriesStore(s => s.decryptedEntries);
  const allTopics = useEntriesStore(s => s.allTopics);
  const headerColor = useUIStore(s => s.headerColor) || '#6A9B9B';

  const [viewDate, setViewDate] = useState(() => toDateStr(new Date()));
  const [doseLogs, setDoseLogs] = useState<Record<string, DoseLogRecord>>({});
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [savingDose, setSavingDose] = useState<string | null>(null);
  const [doseError, setDoseError] = useState<string | null>(null);

  const medicationTopicId = useMemo(
    () => allTopics.find(t => t.name.toLowerCase() === 'medication')?.id,
    [allTopics]
  );

  const scheduledDoses: ScheduledDose[] = useMemo(() => {
    if (!medicationTopicId) return [];
    const doses: ScheduledDose[] = [];

    for (const entry of entries) {
      const meta = entry.metadata as Record<string, unknown> | undefined;
      if (!meta || meta._taxonomyId !== medicationTopicId) continue;

      const cf = (meta._customFields as Record<string, unknown>) || {};
      if (cf.isActive === false) continue;

      const name = stripHtml(entry.content).slice(0, 120) || 'Unnamed Medication';
      const dosage = (cf.dosage as string) || '';
      const scheduleTimes = (cf.scheduleTimes as string[]) || [];

      for (const time of scheduleTimes) {
        doses.push({ medicationPostId: entry.id, medicationName: name, dosage, time });
      }
    }

    doses.sort((a, b) => a.time.localeCompare(b.time));
    return doses;
  }, [entries, medicationTopicId]);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const data = await dosesApi.getByDate(viewDate);
      const map: Record<string, DoseLogRecord> = {};
      for (const log of data.logs) {
        const normalizedTime = log.scheduledTime.substring(0, 5);
        map[`${log.medicationPostId}-${normalizedTime}`] = log;
      }
      setDoseLogs(map);
    } catch (err) {
      console.error('Failed to fetch dose logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, [viewDate]);

  useEffect(() => {
    if (!isReady) return;
    fetchLogs();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchLogs();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isReady, fetchLogs]);

  const handleCheckDose = async (dose: ScheduledDose, checked: boolean) => {
    // Normalize time to HH:MM for API validation
    const normalizedTime = dose.time.substring(0, 5).padStart(5, '0');
    const key = `${dose.medicationPostId}-${normalizedTime}`;
    const newStatus = checked ? 'taken' : 'pending';
    setSavingDose(key);
    setDoseError(null);

    try {
      const takenAt = newStatus === 'taken'
        ? new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        : null;

      const { log } = await dosesApi.log({
        medicationPostId: dose.medicationPostId,
        scheduledTime: normalizedTime,
        date: viewDate,
        status: newStatus,
        takenAt,
      });

      const normalizedLog = { ...log, scheduledTime: log.scheduledTime.substring(0, 5) };
      setDoseLogs(prev => ({ ...prev, [key]: normalizedLog }));
    } catch (err) {
      console.error('Failed to update dose:', err);
      setDoseError(`Failed to update ${dose.medicationName}`);
    } finally {
      setSavingDose(null);
    }
  };

  const getDoseStatus = (dose: ScheduledDose): string => {
    const key = `${dose.medicationPostId}-${dose.time.substring(0, 5)}`;
    return doseLogs[key]?.status || 'pending';
  };

  const getDoseLog = (dose: ScheduledDose): DoseLogRecord | undefined => {
    const key = `${dose.medicationPostId}-${dose.time.substring(0, 5)}`;
    return doseLogs[key];
  };

  const totalDoses = scheduledDoses.length;
  const completedDoses = scheduledDoses.filter(d => getDoseStatus(d) === 'taken').length;
  const progressPercent = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 0;

  const dosesByTime = useMemo(() => {
    const map: Record<string, ScheduledDose[]> = {};
    for (const dose of scheduledDoses) {
      (map[dose.time] ||= []).push(dose);
    }
    return map;
  }, [scheduledDoses]);

  const navigateDate = (days: number) => {
    const date = new Date(viewDate + 'T12:00:00');
    date.setDate(date.getDate() + days);
    setViewDate(toDateStr(date));
  };

  return (
    <>
      <DateNav>
        <NavButton onClick={() => navigateDate(-1)} title="Previous day">
          <FontAwesomeIcon icon={faChevronLeft} />
        </NavButton>
        <DateLabel>{formatDateDisplay(viewDate)}</DateLabel>
        <NavButton onClick={() => navigateDate(1)} title="Next day">
          <FontAwesomeIcon icon={faChevronRight} />
        </NavButton>
      </DateNav>

      {totalDoses > 0 && (
        <ProgressWrapper>
          <ProgressStats>
            <span>Daily Progress</span>
            <span>{completedDoses} of {totalDoses} doses taken ({progressPercent}%)</span>
          </ProgressStats>
          <ProgressTrack>
            <ProgressFill $percent={progressPercent} $color={headerColor} />
          </ProgressTrack>
          {progressPercent === 100 && (
            <AllDoneMsg $color={headerColor}>All medications taken for today!</AllDoneMsg>
          )}
        </ProgressWrapper>
      )}

      <HelpText>Click the circle to mark a medication as taken for this day.</HelpText>
      {doseError && <div style={{ padding: '0 20px 8px', fontSize: 13, color: '#9B4444' }}>{doseError}</div>}

      {loadingLogs ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={30} /></div>
      ) : scheduledDoses.length === 0 ? (
        <EmptyState message="No medications scheduled" submessage="Add active medications with schedule times to see your daily schedule." />
      ) : (
        Object.entries(dosesByTime).map(([time, timeDoses]) => (
          <TimeGroup key={time}>
            <TimeHeader>{formatTime12h(time)}</TimeHeader>
            {timeDoses.map((dose, i) => {
              const status = getDoseStatus(dose);
              const log = getDoseLog(dose);
              const isTaken = status === 'taken';
              const key = `${dose.medicationPostId}-${dose.time}`;
              const isSaving = savingDose === key;

              return (
                <DoseCard key={`${dose.medicationPostId}-${time}-${i}`} $taken={isTaken} $accentColor={headerColor}>
                  <DoseCheckButton
                    $taken={isTaken}
                    $color={headerColor}
                    disabled={isSaving}
                    onClick={() => handleCheckDose(dose, !isTaken)}
                    aria-label={isTaken ? 'Mark as not taken' : 'Mark as taken'}
                  >
                    {isTaken && <FontAwesomeIcon icon={faCheck} />}
                  </DoseCheckButton>
                  <DoseInfo>
                    <DoseName $taken={isTaken} $color={headerColor}>
                      {dose.medicationName} {dose.dosage}
                    </DoseName>
                    {isTaken && log?.takenAt && (
                      <DoseTakenAt $color={headerColor}>(taken at {log.takenAt})</DoseTakenAt>
                    )}
                  </DoseInfo>
                  <StatusBadge>
                    {isSaving ? 'Saving...' : isTaken ? 'Taken' : 'Pending'}
                  </StatusBadge>
                </DoseCard>
              );
            })}
          </TimeGroup>
        ))
      )}
    </>
  );
}
