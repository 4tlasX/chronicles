import { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const Section = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Header = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  &:hover { background: rgba(0,0,0,0.02); }
`;

const Body = styled.div`
  padding: 0 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

interface ExpandableSectionProps {
  label: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function ExpandableSection({ label, defaultExpanded = false, children }: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Section>
      <Header onClick={() => setExpanded(!expanded)}>
        <span>{label}</span>
        <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} size="xs" />
      </Header>
      {expanded && <Body>{children}</Body>}
    </Section>
  );
}
