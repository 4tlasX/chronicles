import styled from 'styled-components';

/** Centered placeholder message for an empty editor panel. */
export const EmptyEditor = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 16px;
`;
