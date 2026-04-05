import styled from 'styled-components';

/** Scrollable flex-grow container for list content. */
export const ScrollList = styled.div<{ $padding?: string; $gap?: string }>`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-width: 0;
  padding: ${({ $padding }) => $padding || '16px 20px'};
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap || '12px'};
  padding-bottom: 48px;
`;
