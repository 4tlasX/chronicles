import styled from 'styled-components';
import { ScrollList } from '../atoms/ScrollList.js';
import { CorrelationChart } from '../molecules/charts/CorrelationChart.js';
import { FrequencyChart } from '../molecules/charts/FrequencyChart.js';
import { SeverityTrendChart } from '../molecules/charts/SeverityTrendChart.js';
import type { PeriodType } from '../../types/health.js';
import type {
  DecryptedSymptom,
  DecryptedFood,
  DecryptedMedicationLog,
  DecryptedExercise,
  DecryptedWellness,
  WellnessTrendPoint,
  WellnessInsight,
} from '../../utils/correlationAnalysis.js';
import {
  calculateCorrelations,
  calculateExerciseCorrelations,
  calculateSymptomFrequency,
  calculateSeverityTrend,
  calculateExerciseImpact,
  calculateExerciseFrequency,
  calculateSymptomCoOccurrences,
  calculateWellnessTrend,
  calculateWellnessInsights,
} from '../../utils/correlationAnalysis.js';
import React, { useMemo, useState } from 'react';

/* ── Styled ── */

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
`;

const StatCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 14px;
  text-align: center;
`;

const StatValue = styled.div<{ $color: string }>`
  font-size: 31px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

const StatSub = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 4px;
`;

const SectionCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px;
`;

const SectionTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.h3.fontFamily};
  font-size: ${({ theme }) => theme.typography.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.h3.fontWeight};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 12px;
`;

const SectionDesc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 12px;
`;

const ListRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 15px;
`;

const ListLabel = styled.span`
  color: ${({ theme }) => theme.colors.text};
  text-transform: capitalize;
`;

const ListValue = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  & + & { margin-top: 6px; }
`;

const CoLabels = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
`;

const CoArrow = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CoBadge = styled.span<{ $color: string }>`
  font-size: 13px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  background: ${({ $color }) => `${$color}18`};
  color: ${({ $color }) => $color};
`;

const CoMeta = styled.div`
  text-align: right;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CalorieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
`;

const CalorieStat = styled.div`
  text-align: center;
`;

const CalorieValue = styled.div<{ $color: string }>`
  font-size: 25px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const CalorieLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const HDivider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 10px;
`;

const SubTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px;
`;

const ExFreqRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

const ExFreqLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  width: 80px;
  flex-shrink: 0;
`;

const ExFreqBar = styled.div`
  flex: 1;
  height: 12px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const ExFreqFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  border-radius: 6px;
`;

const ExFreqValue = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  width: 80px;
  text-align: right;
  flex-shrink: 0;
`;

const ImpactRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  & + & { margin-top: 6px; }
`;

const ImpactLeft = styled.div``;
const ImpactName = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  text-transform: capitalize;
`;
const ImpactSub = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ImpactRight = styled.div`
  text-align: right;
`;

const ImpactArrow = styled.div`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ImpactChange = styled.div<{ $positive: boolean; $neutral: boolean }>`
  font-size: 15px;
  font-weight: 500;
  color: ${({ $positive, $neutral, theme }) => $neutral ? theme.colors.textMuted : $positive ? theme.colors.success : theme.colors.danger};
`;

const WellnessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const WellnessTrendWrap = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 80px;
  margin-bottom: 8px;
`;

const WellnessTrendCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
`;

const WellnessTrendBar = styled.div<{ $height: number; $color: string }>`
  width: 100%;
  min-width: 10px;
  height: ${({ $height }) => Math.max($height, 2)}px;
  background: ${({ $color }) => $color};
  border-radius: 3px 3px 0 0;
`;

const WellnessTrendLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 3px;
  white-space: nowrap;
`;

const WellnessDotRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 80px;
  margin-bottom: 8px;
`;

const WellnessDotCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
`;

const WellnessDot = styled.div<{ $bottom: number; $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  margin-bottom: ${({ $bottom }) => $bottom}px;
`;

const TrendChartLegend = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 4px;
`;

const TrendLegendDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const TrendLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InsightRow = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: rgba(0, 0, 0, 0.02);
  & + & { margin-top: 8px; }
`;

const InsightLabel = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const InsightDetail = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.5;
`;

const InsightBadge = styled.span<{ $positive: boolean }>`
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 3px;
  margin-left: 6px;
  background: ${({ $positive }) => $positive ? 'rgba(90,138,106,0.12)' : 'rgba(0,0,0,0.06)'};
  color: ${({ $positive }) => $positive ? '#5A8A6A' : '#888'};
`;

/* ── Helpers ── */

function strengthColor(c: number): string {
  if (c >= 75) return '#9B4444';
  if (c >= 50) return '#B5704F';
  return '#B8965A';
}

/* ── Cycle calendar styles ── */

const CalNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const CalMonthLabel = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CalNavBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 4px 8px;
  border-radius: 4px;
  &:hover { background: rgba(0,0,0,0.05); }
`;

const CalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
`;

const CalDayLabel = styled.div`
  text-align: center;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textMuted};
  padding-bottom: 4px;
`;

const CalDay = styled.button<{ $period?: boolean; $predicted?: boolean; $today?: boolean; $selected?: boolean; $future?: boolean; $color: string }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 12px;
  font-weight: ${({ $today }) => $today ? 700 : 400};
  border-radius: 4px;
  cursor: pointer;
  border: ${({ $today, $selected, $predicted, $color, theme }) =>
    $selected ? `2px solid ${$color}` :
    $today ? `1.5px solid ${theme.colors.textMuted}` :
    $predicted ? `1.5px dashed ${$color}88` :
    '1.5px solid transparent'};
  background: ${({ $period, $color }) => $period ? $color + '33' : 'transparent'};
  color: ${({ $future, $period, $color, theme }) =>
    $period ? $color :
    $future ? theme.colors.textMuted :
    theme.colors.text};
  opacity: ${({ $future }) => $future ? 0.5 : 1};
  transition: background 0.1s;
  &:hover { background: ${({ $period, $color }) => $period ? $color + '44' : 'rgba(0,0,0,0.06)'}; }
  &:disabled { cursor: default; }
`;

const CalEditRow = styled.div`
  margin-top: 10px;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.surfaceOverlay};
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CalEditLabel = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FlowChipRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const FlowChip = styled.button<{ $active: boolean; $color: string }>`
  padding: 4px 10px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid ${({ $active, $color, theme }) => $active ? $color : theme.colors.border};
  background: ${({ $active, $color }) => $active ? $color + '22' : 'transparent'};
  color: ${({ $active, $color, theme }) => $active ? $color : theme.colors.textSecondary};
  cursor: pointer;
`;

const PeriodToggle = styled.button<{ $active: boolean; $color: string }>`
  padding: 5px 14px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  border: 1px solid ${({ $active, $color, theme }) => $active ? $color : theme.colors.border};
  background: ${({ $active, $color }) => $active ? $color + '22' : 'transparent'};
  color: ${({ $active, $color, theme }) => $active ? $color : theme.colors.textSecondary};
  cursor: pointer;
  align-self: flex-start;
`;

const PredictionBanner = styled.div<{ $color: string }>`
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background: ${({ $color }) => $color + '12'};
  border: 1px dashed ${({ $color }) => $color + '55'};
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const FLOW_OPTIONS = ['spotting', 'light', 'medium', 'heavy'] as const;
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/* ── Props ── */

interface HealthReportProps {
  symptoms: DecryptedSymptom[];
  foods: DecryptedFood[];
  medLogs: DecryptedMedicationLog[];
  exercises: DecryptedExercise[];
  wellness: DecryptedWellness[];
  period: PeriodType;
  headerColor: string;
  cycleTrackingEnabled?: boolean;
  onSaveCycleDay?: (date: string, periodToday: boolean, flowIntensity: string) => Promise<void>;
}

/* ── Component ── */

export function HealthReport({ symptoms, foods, medLogs, exercises, wellness, period, headerColor, cycleTrackingEnabled, onSaveCycleDay }: HealthReportProps) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [cycleSaving, setCycleSaving] = useState(false);

  const periodDaySet = useMemo(() => {
    const s = new Set<string>();
    for (const w of wellness) if (w.periodToday) s.add(w.date);
    return s;
  }, [wellness]);

  const flowByDate = useMemo(() => {
    const m: Record<string, string> = {};
    for (const w of wellness) if (w.periodToday && w.flowIntensity) m[w.date] = w.flowIntensity;
    return m;
  }, [wellness]);
  const correlations = useMemo(() => {
    if (symptoms.length === 0) return [];
    return [...calculateCorrelations(symptoms, foods, medLogs), ...calculateExerciseCorrelations(symptoms, exercises)];
  }, [symptoms, foods, medLogs, exercises]);

  const symptomFrequency = useMemo(() =>
    symptoms.length > 0 ? calculateSymptomFrequency(symptoms, period === 'year' ? 'month' : 'day') : [], [symptoms, period]);

  const severityTrend = useMemo(() =>
    symptoms.length > 0 ? calculateSeverityTrend(symptoms, period === 'year' ? 'week' : 'day') : [], [symptoms, period]);

  const coOccurrences = useMemo(() =>
    symptoms.length > 0 ? calculateSymptomCoOccurrences(symptoms) : [], [symptoms]);

  const exerciseImpact = useMemo(() =>
    exercises.length > 0 ? calculateExerciseImpact(symptoms, exercises) : [], [symptoms, exercises]);

  const exerciseFrequency = useMemo(() =>
    exercises.length > 0 ? calculateExerciseFrequency(exercises, period === 'year' ? 'month' : 'week') : [], [exercises, period]);

  const calorieSummary = useMemo(() => {
    const withCal = foods.filter(f => f.calories && f.calories > 0);
    if (withCal.length === 0) return null;
    const total = withCal.reduce((s, f) => s + (f.calories || 0), 0);
    const avgPerMeal = Math.round(total / withCal.length);
    const byDate = withCal.reduce((acc, f) => { const d = f.consumedAt.split('T')[0]; acc[d] = (acc[d] || 0) + (f.calories || 0); return acc; }, {} as Record<string, number>);
    const daily = Object.values(byDate);
    const avgDaily = daily.length > 0 ? Math.round(daily.reduce((a, b) => a + b, 0) / daily.length) : 0;
    const byMeal = withCal.reduce((acc, f) => { const m = f.mealType || 'unknown'; if (!acc[m]) acc[m] = { count: 0, cal: 0 }; acc[m].count++; acc[m].cal += f.calories || 0; return acc; }, {} as Record<string, { count: number; cal: number }>);
    return { total, avgPerMeal, avgDaily, byMeal };
  }, [foods]);

  const exerciseSummary = useMemo(() => {
    if (exercises.length === 0) return null;
    const byType = exercises.reduce((acc, e) => {
      const k = e.exerciseType.toLowerCase();
      if (!acc[k]) acc[k] = { count: 0, duration: 0 };
      acc[k].count++;
      acc[k].duration += e.duration;
      return acc;
    }, {} as Record<string, { count: number; duration: number }>);
    return byType;
  }, [exercises]);

  const topSymptoms = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of symptoms) { const k = s.name.toLowerCase(); counts[k] = (counts[k] || 0) + 1; }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [symptoms]);

  const topIngredients = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of foods) for (const ing of f.ingredients) { const k = ing.toLowerCase(); counts[k] = (counts[k] || 0) + 1; }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [foods]);

  const totalExerciseMin = exercises.reduce((s, e) => s + e.duration, 0);

  const wellnessTrend: WellnessTrendPoint[] = useMemo(() =>
    wellness.length > 0 ? calculateWellnessTrend(wellness) : [], [wellness]);

  const wellnessInsights: WellnessInsight[] = useMemo(() =>
    wellness.length >= 3 ? calculateWellnessInsights(wellness, symptoms, exercises) : [],
    [wellness, symptoms, exercises]);

  const wellnessSummary = useMemo(() => {
    if (wellness.length === 0) return null;
    const withWater = wellness.filter(w => w.waterGlasses > 0);
    const withMood  = wellness.filter(w => w.moodScore > 0);
    const withSleep = wellness.filter(w => w.sleepHours > 0);
    const withSleepQ = wellness.filter(w => w.sleepQuality > 0);
    return {
      avgWater:  withWater.length  > 0 ? withWater.reduce((s, w) => s + w.waterGlasses, 0) / withWater.length : 0,
      avgMood:   withMood.length   > 0 ? withMood.reduce((s, w) => s + w.moodScore, 0) / withMood.length : 0,
      avgSleep:  withSleep.length  > 0 ? withSleep.reduce((s, w) => s + w.sleepHours, 0) / withSleep.length : 0,
      avgSleepQ: withSleepQ.length > 0 ? withSleepQ.reduce((s, w) => s + w.sleepQuality, 0) / withSleepQ.length : 0,
      days: wellness.length,
    };
  }, [wellness]);

  const cycleSummary = useMemo(() => {
    const allPeriodDays = [...wellness].filter(w => w.periodToday).sort((a, b) => a.date.localeCompare(b.date));
    const flowCounts: Record<string, number> = {};
    for (const w of allPeriodDays) if (w.flowIntensity) flowCounts[w.flowIntensity] = (flowCounts[w.flowIntensity] || 0) + 1;

    // First days of each run
    const sortedAll = [...wellness].sort((a, b) => a.date.localeCompare(b.date));
    const firstDays: string[] = [];
    let inPeriod = false;
    for (const w of sortedAll) {
      if (w.periodToday && !inPeriod) { firstDays.push(w.date); inPeriod = true; }
      else if (!w.periodToday) inPeriod = false;
    }
    const cycleLengths: number[] = [];
    for (let i = 1; i < firstDays.length; i++) {
      const diff = Math.round((new Date(firstDays[i]).getTime() - new Date(firstDays[i - 1]).getTime()) / 86400000);
      if (diff > 0 && diff < 60) cycleLengths.push(diff);
    }
    const avgCycleLength = cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : null;

    // Predict next period from last known first day + avg (or 28 days if only 1 cycle)
    const lastFirstDay = firstDays[firstDays.length - 1] ?? null;
    const predictedLength = avgCycleLength ?? 28;
    const predictedStart = lastFirstDay
      ? new Date(new Date(lastFirstDay + 'T12:00:00').getTime() + predictedLength * 86400000)
      : null;

    return {
      periodDays: allPeriodDays.length,
      flowCounts,
      avgCycleLength,
      cycleCount: firstDays.length,
      predictedStart: predictedStart ? predictedStart.toISOString().split('T')[0] : null,
      predictedLength,
      isEstimated: avgCycleLength === null,
    };
  }, [wellness]);

  return (
    <ScrollList $gap="16px">
      {/* Summary stats */}
      <StatsGrid>
        <StatCard>
          <StatValue $color={headerColor}>{symptoms.length}</StatValue>
          <StatLabel>Symptoms</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue $color={headerColor}>{foods.length}</StatValue>
          <StatLabel>Food Entries</StatLabel>
          {calorieSummary && <StatSub>{calorieSummary.total.toLocaleString()} cal total</StatSub>}
        </StatCard>
        <StatCard>
          <StatValue $color={headerColor}>{medLogs.length}</StatValue>
          <StatLabel>Doses Taken</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue $color={headerColor}>{exercises.length}</StatValue>
          <StatLabel>Workouts</StatLabel>
          {totalExerciseMin > 0 && <StatSub>{totalExerciseMin} min total</StatSub>}
        </StatCard>
      </StatsGrid>

      {/* Wellness summary stats */}
      {wellnessSummary && (
        <WellnessGrid>
          <StatCard>
            <StatValue $color={headerColor}>{wellnessSummary.avgWater.toFixed(1)}</StatValue>
            <StatLabel>Avg Water</StatLabel>
            <StatSub>/ 8 glasses · {wellnessSummary.days} days</StatSub>
          </StatCard>
          <StatCard>
            <StatValue $color={headerColor}>{wellnessSummary.avgMood > 0 ? wellnessSummary.avgMood.toFixed(1) : '—'}</StatValue>
            <StatLabel>Avg Mood</StatLabel>
            <StatSub>/ 5</StatSub>
          </StatCard>
          <StatCard>
            <StatValue $color={headerColor}>{wellnessSummary.avgSleep > 0 ? `${wellnessSummary.avgSleep.toFixed(1)}h` : '—'}</StatValue>
            <StatLabel>Avg Sleep</StatLabel>
            {wellnessSummary.avgSleepQ > 0 && <StatSub>Quality {wellnessSummary.avgSleepQ.toFixed(1)}/5</StatSub>}
          </StatCard>
        </WellnessGrid>
      )}

      {/* Cycle tracking calendar */}
      {cycleTrackingEnabled && (
        <SectionCard>
          <SectionTitle>Cycle Tracking</SectionTitle>

          {/* Stats row */}
          {cycleSummary && cycleSummary.periodDays > 0 && (
            <WellnessGrid style={{ marginBottom: 12 }}>
              <StatCard>
                <StatValue $color={headerColor}>{cycleSummary.periodDays}</StatValue>
                <StatLabel>Period Days</StatLabel>
              </StatCard>
              {cycleSummary.avgCycleLength && (
                <StatCard>
                  <StatValue $color={headerColor}>{cycleSummary.avgCycleLength}</StatValue>
                  <StatLabel>Avg Cycle</StatLabel>
                  <StatSub>days</StatSub>
                </StatCard>
              )}
              {cycleSummary.cycleCount > 0 && (
                <StatCard>
                  <StatValue $color={headerColor}>{cycleSummary.cycleCount}</StatValue>
                  <StatLabel>Period{cycleSummary.cycleCount !== 1 ? 's' : ''}</StatLabel>
                </StatCard>
              )}
            </WellnessGrid>
          )}

          {/* Prediction banner */}
          {cycleSummary?.predictedStart && (() => {
            const ps = new Date(cycleSummary.predictedStart + 'T12:00:00');
            const todayMs = new Date(today.toISOString().split('T')[0] + 'T12:00:00').getTime();
            const daysUntil = Math.round((ps.getTime() - todayMs) / 86400000);
            const label = daysUntil === 0 ? 'today' : daysUntil > 0 ? `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` : `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} ago`;
            return (
              <PredictionBanner $color={headerColor}>
                🩸 Next period predicted {label} — {ps.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {cycleSummary.isEstimated && <span style={{ opacity: 0.6, fontSize: 11 }}> (estimated · log more cycles to improve accuracy)</span>}
              </PredictionBanner>
            );
          })()}

          {/* Month calendar */}
          <CalNav style={{ marginTop: 12 }}>
            <CalNavBtn onClick={() => { const d = new Date(calYear, calMonth - 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); setSelectedDay(null); }}>‹</CalNavBtn>
            <CalMonthLabel>{new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CalMonthLabel>
            <CalNavBtn onClick={() => { const d = new Date(calYear, calMonth + 1); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); setSelectedDay(null); }}>›</CalNavBtn>
          </CalNav>
          <CalGrid>
            {DAYS_OF_WEEK.map(d => <CalDayLabel key={d}>{d}</CalDayLabel>)}
            {(() => {
              const firstOfMonth = new Date(calYear, calMonth, 1);
              const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
              const startDow = firstOfMonth.getDay();
              const todayStr = today.toISOString().split('T')[0];
              const cells: React.ReactElement[] = [];

              // Predicted days set (±1 around predicted start)
              const predictedDays = new Set<string>();
              if (cycleSummary?.predictedStart) {
                const base = new Date(cycleSummary.predictedStart + 'T12:00:00');
                for (let offset = -1; offset <= 4; offset++) {
                  const d = new Date(base.getTime() + offset * 86400000);
                  predictedDays.add(d.toISOString().split('T')[0]);
                }
              }

              for (let i = 0; i < startDow; i++) cells.push(<div key={`e${i}`} />);
              for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const isPeriod = periodDaySet.has(dateStr);
                const isPredicted = !isPeriod && predictedDays.has(dateStr);
                const isToday = dateStr === todayStr;
                const isFuture = dateStr > todayStr && !isPredicted;
                const isSelected = selectedDay === dateStr;
                cells.push(
                  <CalDay
                    key={dateStr}
                    $period={isPeriod}
                    $predicted={isPredicted}
                    $today={isToday}
                    $selected={isSelected}
                    $future={isFuture && !isPredicted}
                    $color={headerColor}
                    onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                    title={isPeriod ? `Period day${flowByDate[dateStr] ? ` · ${flowByDate[dateStr]}` : ''}` : isPredicted ? 'Predicted period' : dateStr}
                  >
                    {d}
                  </CalDay>
                );
              }
              return cells;
            })()}
          </CalGrid>

          {/* Inline editor for selected day */}
          {selectedDay && onSaveCycleDay && (
            <CalEditRow>
              <CalEditLabel>{new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</CalEditLabel>
              <PeriodToggle
                $active={periodDaySet.has(selectedDay)}
                $color={headerColor}
                disabled={cycleSaving}
                onClick={async () => {
                  const wasOn = periodDaySet.has(selectedDay);
                  setCycleSaving(true);
                  await onSaveCycleDay(selectedDay, !wasOn, wasOn ? '' : 'medium');
                  setCycleSaving(false);
                }}
              >
                {periodDaySet.has(selectedDay) ? '🩸 Period — tap to remove' : 'Mark as period day'}
              </PeriodToggle>
              {periodDaySet.has(selectedDay) && (
                <>
                  <CalEditLabel>Flow</CalEditLabel>
                  <FlowChipRow>
                    {FLOW_OPTIONS.map(f => (
                      <FlowChip
                        key={f}
                        $active={flowByDate[selectedDay] === f}
                        $color={headerColor}
                        disabled={cycleSaving}
                        onClick={async () => {
                          setCycleSaving(true);
                          await onSaveCycleDay(selectedDay, true, flowByDate[selectedDay] === f ? '' : f);
                          setCycleSaving(false);
                        }}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </FlowChip>
                    ))}
                  </FlowChipRow>
                </>
              )}
            </CalEditRow>
          )}

          {/* Flow breakdown */}
          {cycleSummary && Object.keys(cycleSummary.flowCounts).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <SectionDesc style={{ marginBottom: 8 }}>Flow breakdown</SectionDesc>
              {FLOW_OPTIONS.map(f => {
                const count = cycleSummary.flowCounts[f] || 0;
                if (!count) return null;
                const pct = Math.round((count / cycleSummary.periodDays) * 100);
                return (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 64, fontSize: 12, textTransform: 'capitalize', flexShrink: 0 }}>{f}</span>
                    <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: headerColor, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12, opacity: 0.6, width: 40, textAlign: 'right' }}>{count}d</span>
                  </div>
                );
              })}
            </div>
          )}

          {!cycleSummary?.periodDays && (
            <SectionDesc style={{ marginTop: 8 }}>No period days logged yet. Tap any day above to add tracking.</SectionDesc>
          )}
        </SectionCard>
      )}

      {/* Wellness trends */}
      {wellnessTrend.length > 1 && (
        <SectionCard>
          <SectionTitle>Wellness Trends</SectionTitle>
          <TrendChartLegend>
            <TrendLegendItem><TrendLegendDot $color={headerColor} /><span>Water (glasses)</span></TrendLegendItem>
            <TrendLegendItem><TrendLegendDot $color="#5A8A6A" /><span>Mood (×2)</span></TrendLegendItem>
            <TrendLegendItem><TrendLegendDot $color="#B8965A" /><span>Sleep (hours ÷ 2)</span></TrendLegendItem>
          </TrendChartLegend>
          <WellnessTrendWrap>
            {wellnessTrend.slice(-14).map((pt, i) => {
              const maxH = 72;
              const waterH  = (pt.waterGlasses / 8) * maxH;
              const moodH   = pt.moodScore   > 0 ? ((pt.moodScore * 2) / 10) * maxH : 0;
              const sleepH  = pt.sleepHours  > 0 ? (pt.sleepHours / 12) * maxH : 0;
              const date = new Date(pt.date + 'T12:00:00');
              const label = `${date.getMonth() + 1}/${date.getDate()}`;
              return (
                <WellnessTrendCol key={i} title={`${pt.date}: ${pt.waterGlasses} water, mood ${pt.moodScore}/5, ${pt.sleepHours}h sleep`}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, flex: 1, justifyContent: 'center' }}>
                    <WellnessTrendBar $height={waterH} $color={headerColor} style={{ width: 5 }} />
                    {moodH > 0  && <WellnessTrendBar $height={moodH}  $color="#5A8A6A" style={{ width: 5 }} />}
                    {sleepH > 0 && <WellnessTrendBar $height={sleepH} $color="#B8965A" style={{ width: 5 }} />}
                  </div>
                  <WellnessTrendLabel>{label}</WellnessTrendLabel>
                </WellnessTrendCol>
              );
            })}
          </WellnessTrendWrap>
        </SectionCard>
      )}

      {/* Wellness cross-correlation insights */}
      {wellnessInsights.length > 0 && (
        <SectionCard>
          <SectionTitle>Wellness Insights</SectionTitle>
          <SectionDesc>Cross-correlations between sleep, water, mood, exercise, and symptoms</SectionDesc>
          {wellnessInsights.map((insight, i) => (
            <InsightRow key={i}>
              <InsightLabel>
                {insight.label}
                <InsightBadge $positive={insight.direction === 'positive'}>
                  {insight.direction === 'positive' ? 'pattern found' : 'tracking'} · {insight.dataPoints} days
                </InsightBadge>
              </InsightLabel>
              <InsightDetail>
                {insight.high}<br />{insight.low}
              </InsightDetail>
            </InsightRow>
          ))}
        </SectionCard>
      )}

      {/* Correlations */}
      <CorrelationChart data={correlations} title="Correlations Detected" />

      {/* Co-occurrences */}
      {coOccurrences.length > 0 && (
        <SectionCard>
          <SectionTitle>Symptom Co-occurrences</SectionTitle>
          <SectionDesc>Symptoms that tend to occur together within 24 hours</SectionDesc>
          {coOccurrences.slice(0, 10).map((co, i) => (
            <CoRow key={i}>
              <CoLabels>
                <span>{co.symptom1.name}</span>
                <CoArrow>&harr;</CoArrow>
                <span>{co.symptom2.name}</span>
              </CoLabels>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CoBadge $color={strengthColor(co.correlation)}>{co.correlation}%</CoBadge>
                <CoMeta>
                  <div>{co.coOccurrences} co-occurrences</div>
                  {co.avgTimeBetween > 0 && (
                    <div>~{co.avgTimeBetween < 60 ? `${co.avgTimeBetween}m` : `${Math.round(co.avgTimeBetween / 60)}h`} apart</div>
                  )}
                </CoMeta>
              </div>
            </CoRow>
          ))}
        </SectionCard>
      )}

      {/* Symptom frequency */}
      <FrequencyChart data={symptomFrequency} title="Symptom Frequency" color={headerColor} />

      {/* Severity trend */}
      <SeverityTrendChart data={severityTrend} title="Severity Trend Over Time" />

      {/* Top symptoms */}
      {topSymptoms.length > 0 && (
        <SectionCard>
          <SectionTitle>Most Common Symptoms</SectionTitle>
          {topSymptoms.map(([name, count]) => (
            <ListRow key={name}><ListLabel>{name}</ListLabel><ListValue>{count} occurrence{count !== 1 ? 's' : ''}</ListValue></ListRow>
          ))}
        </SectionCard>
      )}

      {/* Top ingredients */}
      {topIngredients.length > 0 && (
        <SectionCard>
          <SectionTitle>Most Consumed Ingredients</SectionTitle>
          {topIngredients.map(([name, count]) => (
            <ListRow key={name}><ListLabel>{name}</ListLabel><ListValue>{count} time{count !== 1 ? 's' : ''}</ListValue></ListRow>
          ))}
        </SectionCard>
      )}

      {/* Calorie summary */}
      {calorieSummary && (
        <SectionCard>
          <SectionTitle>Calorie Summary</SectionTitle>
          <CalorieGrid>
            <CalorieStat><CalorieValue $color={headerColor}>{calorieSummary.total.toLocaleString()}</CalorieValue><CalorieLabel>Total Calories</CalorieLabel></CalorieStat>
            <CalorieStat><CalorieValue $color={headerColor}>{calorieSummary.avgDaily.toLocaleString()}</CalorieValue><CalorieLabel>Avg Daily</CalorieLabel></CalorieStat>
            <CalorieStat><CalorieValue $color={headerColor}>{calorieSummary.avgPerMeal.toLocaleString()}</CalorieValue><CalorieLabel>Avg per Meal</CalorieLabel></CalorieStat>
          </CalorieGrid>
          {Object.keys(calorieSummary.byMeal).length > 0 && (
            <HDivider>
              <SubTitle>By Meal Type</SubTitle>
              {Object.entries(calorieSummary.byMeal)
                .sort((a, b) => b[1].cal - a[1].cal)
                .map(([meal, data]) => (
                  <ListRow key={meal}><ListLabel>{meal}</ListLabel><ListValue>{data.cal.toLocaleString()} cal ({data.count} meal{data.count !== 1 ? 's' : ''})</ListValue></ListRow>
                ))}
            </HDivider>
          )}
        </SectionCard>
      )}

      {/* Exercise summary */}
      {exerciseSummary && (
        <SectionCard>
          <SectionTitle>Exercise Summary</SectionTitle>
          {Object.entries(exerciseSummary)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([type, data]) => (
              <ListRow key={type}><ListLabel>{type}</ListLabel><ListValue>{data.count} session{data.count !== 1 ? 's' : ''} ({data.duration} min)</ListValue></ListRow>
            ))}
        </SectionCard>
      )}

      {/* Exercise frequency */}
      {exerciseFrequency.length > 0 && (
        <SectionCard>
          <SectionTitle>Exercise Frequency</SectionTitle>
          {exerciseFrequency.slice(-7).map(data => {
            const maxCount = Math.max(...exerciseFrequency.map(d => d.count));
            return (
              <ExFreqRow key={data.period}>
                <ExFreqLabel>{data.period}</ExFreqLabel>
                <ExFreqBar><ExFreqFill $width={maxCount > 0 ? (data.count / maxCount) * 100 : 0} $color={headerColor} /></ExFreqBar>
                <ExFreqValue>{data.count} ({data.totalDuration} min)</ExFreqValue>
              </ExFreqRow>
            );
          })}
        </SectionCard>
      )}

      {/* Exercise impact on symptoms */}
      {exerciseImpact.length > 0 && (
        <SectionCard>
          <SectionTitle>Exercise Impact on Symptoms</SectionTitle>
          <SectionDesc>How symptom severity changes after different exercise types (within 24 hours)</SectionDesc>
          {exerciseImpact.map(impact => (
            <ImpactRow key={impact.exerciseType}>
              <ImpactLeft>
                <ImpactName>{impact.exerciseType}</ImpactName>
                <ImpactSub>{impact.occurrences} data points</ImpactSub>
              </ImpactLeft>
              <ImpactRight>
                <ImpactArrow>Before: {impact.avgSeverityBefore} &rarr; After: {impact.avgSeverityAfter}</ImpactArrow>
                <ImpactChange $positive={impact.improvement > 0} $neutral={impact.improvement === 0}>
                  {impact.improvement > 0 ? '\u2193' : impact.improvement < 0 ? '\u2191' : '\u2212'}{' '}
                  {Math.abs(impact.improvement)} point{Math.abs(impact.improvement) !== 1 ? 's' : ''}{' '}
                  {impact.improvement > 0 ? 'improvement' : impact.improvement < 0 ? 'increase' : 'no change'}
                </ImpactChange>
              </ImpactRight>
            </ImpactRow>
          ))}
        </SectionCard>
      )}
    </ScrollList>
  );
}
