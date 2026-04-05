import styled from 'styled-components';
import type { CorrelationResult } from '../../../utils/correlationAnalysis.js';

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px;
`;

const Title = styled.h3`
  font-family: ${({ theme }) => theme.typography.bodySm.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodySm.fontSize};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 12px;
`;

const Empty = styled.div`
  text-align: center;
  padding: 24px 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Row = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  & + & { margin-top: 8px; }
`;

const RowHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const TriggerLabel = styled.span`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const Arrow = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 0 6px;
`;

const SymptomLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const Percent = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const BarTrack = styled.div`
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
`;

const BarFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  border-radius: 3px;
`;

const MetaRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

function getCorrelationColor(c: number): string {
  if (c >= 75) return '#9B4444';
  if (c >= 50) return '#B5704F';
  return '#B8965A';
}

interface CorrelationChartProps {
  data: CorrelationResult[];
  title: string;
}

export function CorrelationChart({ data, title }: CorrelationChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <Title>{title}</Title>
        <Empty>No correlations detected yet. Keep logging food, symptoms, and medications to find patterns.</Empty>
      </Card>
    );
  }

  return (
    <Card>
      <Title>{title}</Title>
      {data.slice(0, 10).map((item, i) => (
        <Row key={i}>
          <RowHeader>
            <div>
              <TriggerLabel>{item.trigger.name}</TriggerLabel>
              <Arrow>&rarr;</Arrow>
              <SymptomLabel>{item.symptom.name}</SymptomLabel>
            </div>
            <Percent>{item.correlation}%</Percent>
          </RowHeader>
          <BarTrack>
            <BarFill $width={item.correlation} $color={getCorrelationColor(item.correlation)} />
          </BarTrack>
          <MetaRow>
            <span>{item.occurrences} of {item.totalSymptomOccurrences} occurrences</span>
            {item.avgTimeToSymptom > 0 && (
              <span>Avg: {item.avgTimeToSymptom < 60 ? `${item.avgTimeToSymptom} min` : `${(item.avgTimeToSymptom / 60).toFixed(1)} hrs`}</span>
            )}
          </MetaRow>
        </Row>
      ))}
    </Card>
  );
}
