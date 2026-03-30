import styled from 'styled-components';

const Outer = styled.div`
  height: 4px;
  background: ${({ theme }) => theme.colors.border};
`;

const Inner = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $color }) => $color};
  transition: width 0.3s ease;
`;

interface ProgressBarProps {
  percent: number;
  color: string;
}

export function ProgressBar({ percent, color }: ProgressBarProps) {
  return (
    <Outer>
      <Inner $percent={Math.min(100, Math.max(0, percent))} $color={color} />
    </Outer>
  );
}
