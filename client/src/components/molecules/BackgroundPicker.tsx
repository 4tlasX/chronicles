import styled from 'styled-components';
import { BACKGROUND_IMAGES } from '@shared/theme/backgrounds';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.sm}px;

  @media (max-width: 500px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Thumbnail = styled.button<{ $selected: boolean; $hasImage: boolean }>`
  aspect-ratio: 16 / 10;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.colors.accent : 'transparent'};
  background: ${({ $hasImage }) => $hasImage ? 'transparent' : '#f3f4f6'};
  background-size: cover;
  background-position: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s, transform 0.1s;
  padding: 0;

  &:hover {
    transform: scale(1.03);
  }
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const NoneLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xs}px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Attribution = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textMuted};

  a {
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration: underline;
  }
`;

interface BackgroundPickerProps {
  selected: string;
  onChange: (value: string) => void;
}

export function BackgroundPicker({ selected, onChange }: BackgroundPickerProps) {
  const selectedBg = BACKGROUND_IMAGES.find(b => b.value === selected);

  return (
    <>
      <Grid>
        {BACKGROUND_IMAGES.map(bg => (
          <Thumbnail
            key={bg.value || 'none'}
            $selected={selected === bg.value}
            $hasImage={!!bg.value}
            onClick={() => onChange(bg.value)}
            title={bg.label}
          >
            {bg.value ? (
              <ThumbnailImage src={bg.thumb} alt={bg.label} loading="lazy" />
            ) : (
              <NoneLabel>None</NoneLabel>
            )}
          </Thumbnail>
        ))}
      </Grid>
      {selectedBg?.artist && (
        <Attribution>
          Photo by <a href={selectedBg.artistUrl || '#'} target="_blank" rel="noopener noreferrer">{selectedBg.artist}</a> on Unsplash
        </Attribution>
      )}
    </>
  );
}
