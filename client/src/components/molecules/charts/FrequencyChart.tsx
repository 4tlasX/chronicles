import styled from 'styled-components';
import type { FrequencyData } from '../../../utils/correlationAnalysis.js';

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

const ChartArea = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 3px;
  height: 140px;
`;

const BarCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Bar = styled.div<{ $height: number; $color: string }>`
  width: 100%;
  min-width: 16px;
  height: ${({ $height }) => Math.max($height, 4)}px;
  background: ${({ $color }) => $color};
  border-radius: 4px 4px 0 0;
  transition: opacity 0.15s;
  &:hover { opacity: 0.8; }
`;

const BarLabel = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 4px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

function formatPeriod(period: string): string {
  if (period.startsWith('W')) {
    const date = new Date(period.substring(1) + 'T12:00:00');
    return `W${Math.ceil(date.getDate() / 7)}`;
  }
  if (period.length === 7) {
    const [year, month] = period.split('-');
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${names[parseInt(month) - 1]} ${year.slice(2)}`;
  }
  const date = new Date(period + 'T12:00:00');
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

interface FrequencyChartProps {
  data: FrequencyData[];
  title: string;
  color: string;
}

export function FrequencyChart({ data, title, color }: FrequencyChartProps) {
  if (data.length === 0) return <Card><Title>{title}</Title><Empty>No data available</Empty></Card>;

  const visible = data.slice(-12);
  const maxCount = Math.max(...visible.map(d => d.count));
  const maxHeight = 110;

  return (
    <Card>
      <Title>{title}</Title>
      <ChartArea>
        {visible.map((item, i) => (
          <BarCol key={i} title={`${item.count}`}>
            <Bar $height={maxCount > 0 ? (item.count / maxCount) * maxHeight : 0} $color={color} />
            <BarLabel>{formatPeriod(item.period)}</BarLabel>
          </BarCol>
        ))}
      </ChartArea>
    </Card>
  );
}
