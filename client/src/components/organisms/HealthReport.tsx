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
} from '../../utils/correlationAnalysis.js';
import {
  calculateCorrelations,
  calculateExerciseCorrelations,
  calculateSymptomFrequency,
  calculateSeverityTrend,
  calculateExerciseImpact,
  calculateExerciseFrequency,
  calculateSymptomCoOccurrences,
} from '../../utils/correlationAnalysis.js';
import { useMemo } from 'react';

/* ── Styled ── */

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
`;

const StatCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: white;
  padding: 14px;
  text-align: center;
`;

const StatValue = styled.div<{ $color: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

const StatSub = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 4px;
`;

const SectionCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: white;
  padding: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 12px;
`;

const SectionDesc = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 0 12px;
`;

const ListRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
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
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const CoArrow = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CoBadge = styled.span<{ $color: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  background: ${({ $color }) => `${$color}18`};
  color: ${({ $color }) => $color};
`;

const CoMeta = styled.div`
  text-align: right;
  font-size: 11px;
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
  font-size: 22px;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;

const CalorieLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const HDivider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 10px;
`;

const SubTitle = styled.h4`
  font-size: 13px;
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
  font-size: 12px;
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
  font-size: 12px;
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
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  text-transform: capitalize;
`;
const ImpactSub = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ImpactRight = styled.div`
  text-align: right;
`;

const ImpactArrow = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ImpactChange = styled.div<{ $positive: boolean; $neutral: boolean }>`
  font-size: 13px;
  font-weight: 500;
  color: ${({ $positive, $neutral }) => $neutral ? '#6b7280' : $positive ? '#22c55e' : '#ef4444'};
`;

/* ── Helpers ── */

function strengthColor(c: number): string {
  if (c >= 75) return '#ef4444';
  if (c >= 50) return '#f97316';
  return '#eab308';
}

/* ── Props ── */

interface HealthReportProps {
  symptoms: DecryptedSymptom[];
  foods: DecryptedFood[];
  medLogs: DecryptedMedicationLog[];
  exercises: DecryptedExercise[];
  period: PeriodType;
  headerColor: string;
}

/* ── Component ── */

export function HealthReport({ symptoms, foods, medLogs, exercises, period, headerColor }: HealthReportProps) {
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
