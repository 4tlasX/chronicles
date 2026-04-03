import styled from 'styled-components';
import { BACKGROUND_IMAGES } from '@shared/theme/backgrounds';
import { RangeInput } from '../atoms/RangeInput.js';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.sm}px;

  @media (max-width: 500px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Thumbnail = styled.div<{ $selected: boolean }>`
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.colors.accent : theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const ThumbImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: bottom;
`;

const NoneLabel = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ImageLabel = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xs}px;
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
`;

const OpacityControl = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

interface BackgroundPickerProps {
  selected: string;
  onImageChange: (image: string) => void;
}

export function BackgroundPicker({
  selected,
  onImageChange,
}: BackgroundPickerProps) {
  return (
    <Grid>
      {BACKGROUND_IMAGES.map(bg => (
        <div key={bg.value || 'none'}>
          <Thumbnail
            $selected={selected === bg.value}
            onClick={() => onImageChange(bg.value)}
          >
            {bg.thumb ? (
              <ThumbImage src={bg.thumb} alt={bg.label} loading="lazy" />
            ) : (
              <NoneLabel>None</NoneLabel>
            )}
          </Thumbnail>
          <ImageLabel>{bg.label}</ImageLabel>
        </div>
      ))}
    </Grid>
  );
}
