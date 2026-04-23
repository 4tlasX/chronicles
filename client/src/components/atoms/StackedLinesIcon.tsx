interface StackedLinesIconProps {
  size?: number;
}

export function StackedLinesIcon({ size = 18 }: StackedLinesIconProps = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="3" width="14" height="2.2" rx="1" fill="currentColor" />
      <rect x="2" y="8" width="10" height="2.2" rx="1" fill="currentColor" />
      <rect x="2" y="13" width="6" height="2.2" rx="1" fill="currentColor" />
    </svg>
  );
}
