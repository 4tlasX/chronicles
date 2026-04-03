import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

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
  font-family: ${({ theme }) => theme.typography.h2.fontFamily};
  font-size: ${({ theme }) => theme.typography.h2.fontSize};
  font-weight: ${({ theme }) => theme.typography.h2.fontWeight};
  color: ${({ theme }) => theme.colors.text};
`;

const Back = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  cursor: pointer;
  &:hover { opacity: 0.7; }
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
      <Back onClick={onBack}><FontAwesomeIcon icon={faChevronLeft} size="xs" /> {backLabel}</Back>
    </Bar>
  );
}
