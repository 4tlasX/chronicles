import styled from 'styled-components';

const Outer = styled.div`
  height: 6px;
  background: var(--rule, ${({ theme }) => theme.colors.border});
  border-radius: var(--r-sm, 2px);
  overflow: hidden;
`;

const Inner = styled.div<{ $percent: number; $accent?: boolean }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $accent }) => $accent ? 'var(--accent)' : 'var(--ink, #2b2824)'};
  transition: width 0.3s ease;
`;

interface ProgressBarProps {
  percent: number;
  color?: string;
  accent?: boolean;
}

export function ProgressBar({ percent, accent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <Outer role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100}>
      <Inner $percent={clamped} $accent={accent} />
    </Outer>
  );
}
