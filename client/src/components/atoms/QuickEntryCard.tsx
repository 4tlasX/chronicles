import styled from 'styled-components';

/** Card wrapper for the QuickEntry organism in the side panel. */
export const QuickEntryCard = styled.div`
  margin: 0;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 12px;
  border-radius: 0;
  background: transparent;
  position: relative;
  z-index: 2;
  overflow: visible;

  display: none;

  /* Remove QuickEntry's own border/padding since the card provides it */
  & > div {
    border: none;
    border-bottom: none;
  }
`;
