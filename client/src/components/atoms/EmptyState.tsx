import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px;
  text-align: center;
  gap: 4px;
`;

const Message = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Sub = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

interface EmptyStateProps {
  message: string;
  submessage?: string;
}

export function EmptyState({ message, submessage }: EmptyStateProps) {
  return (
    <Wrapper>
      <Message>{message}</Message>
      {submessage && <Sub>{submessage}</Sub>}
    </Wrapper>
  );
}
