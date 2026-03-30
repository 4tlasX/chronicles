import styled from 'styled-components';

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Back = styled.button`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.accent};
  background: none;
  border: none;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

interface ViewHeaderProps {
  title: string;
  backLabel?: string;
  onBack: () => void;
  right?: React.ReactNode;
}

export function ViewHeader({ title, backLabel = 'Back to Journal', onBack, right }: ViewHeaderProps) {
  return (
    <Bar>
      <TitleRow>
        <Title>{title}</Title>
        {right}
      </TitleRow>
      <Back onClick={onBack}>{backLabel}</Back>
    </Bar>
  );
}
