import styled from 'styled-components';

/** Card wrapper for the QuickEntry organism in the side panel. */
export const QuickEntryCard = styled.div`
  margin: 0 12px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  position: relative;
  z-index: 2;
  overflow: visible;

  /* Remove QuickEntry's own border/padding since the card provides it */
  & > div {
    border: none;
    border-bottom: none;
  }
`;
