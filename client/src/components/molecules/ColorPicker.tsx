import styled from 'styled-components';
import { ColorSwatch } from '../atoms/ColorSwatch.js';
import type { ColorOption } from '@shared/theme/accentColors';

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

interface ColorPickerProps {
  colors: ColorOption[];
  selected: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ colors, selected, onChange }: ColorPickerProps) {
  return (
    <Grid>
      {colors.map(c => (
        <ColorSwatch
          key={c.value}
          color={c.value}
          selected={selected === c.value}
          onClick={() => onChange(c.value)}
        />
      ))}
    </Grid>
  );
}
