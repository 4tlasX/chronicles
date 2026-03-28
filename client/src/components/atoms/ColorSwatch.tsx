import styled from 'styled-components';

const Swatch = styled.button<{ $color: string; $selected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full}px;
  background: ${({ $color }) => $color === 'transparent' ? 'linear-gradient(135deg, #e5e7eb 50%, #f3f4f6 50%)' : $color};
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.colors.accent : 'transparent'};
  cursor: pointer;
  transition: transform 0.1s, border-color 0.15s;
  outline-offset: 2px;

  &:hover {
    transform: scale(1.1);
  }
`;

interface ColorSwatchProps {
  color: string;
  selected: boolean;
  onClick: () => void;
}

export function ColorSwatch({ color, selected, onClick }: ColorSwatchProps) {
  return <Swatch $color={color} $selected={selected} onClick={onClick} />;
}
