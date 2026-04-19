import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 768px) { padding: 14px 16px; }
  @media (max-width: 480px) { padding: 12px 12px; }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 1.375rem;
  font-weight: 700;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text};
  @media (max-width: 480px) { font-size: 1.1rem; }
`;

const TitleLink = styled(Link)`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 1.375rem;
  font-weight: 700;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  &:hover { opacity: 0.65; }
  @media (max-width: 480px) { font-size: 1.1rem; }
`;

const TitlePipe = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 1.375rem;
  font-weight: 300;
  color: ${({ theme }) => theme.colors.textMuted};
  opacity: 0.4;
  @media (max-width: 480px) { font-size: 1.1rem; }
`;

const Subtitle = styled.span`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 1.375rem;
  font-weight: 400;
  font-style: italic;
  color: ${({ theme }) => theme.colors.textSecondary};
  @media (max-width: 480px) { font-size: 1.1rem; }
`;

const Back = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  cursor: pointer;
  &:hover { opacity: 0.7; }
  @media (max-width: 768px) { display: none; }
`;

interface ViewHeaderProps {
  title: string;
  titleTo?: string;
  subtitle?: string;
  backLabel?: string;
  onBack: () => void;
  right?: React.ReactNode;
}

export function ViewHeader({ title, titleTo, subtitle, backLabel = 'Back to Journal', onBack, right }: ViewHeaderProps) {
  return (
    <Bar>
      <TitleRow>
        {titleTo ? <TitleLink to={titleTo}>{title}</TitleLink> : <Title>{title}</Title>}
        {subtitle && <><TitlePipe>|</TitlePipe><Subtitle>{subtitle}</Subtitle></>}
        {right}
      </TitleRow>
      <Back onClick={onBack} data-print-hide><FontAwesomeIcon icon={faChevronLeft} size="xs" /> {backLabel}</Back>
    </Bar>
  );
}
