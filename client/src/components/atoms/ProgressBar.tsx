import styled from 'styled-components';

const Outer = styled.div`
  height: 9px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Inner = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $color }) => $color};
  opacity: 0.25;
  border-radius: 999px;
  transition: width 0.3s ease;
`;

interface ProgressBarProps {
  percent: number;
  color: string;
}

export function ProgressBar({ percent, color }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <Outer role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100}>
      <Inner $percent={clamped} $color={color} />
    </Outer>
  );
}
