import { useState, useId } from 'react';
import styled from 'styled-components';
import { Icon } from '../../../../design-system/components/core/Icon.jsx';

const Section = styled.div`
  border-top: 1px solid var(--border-subtle);
`;

const Header = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  &:hover { background: var(--bg-hover); }
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
  const bodyId = useId();

  return (
    <Section>
      <Header onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls={bodyId}>
        <span>{label}</span>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={14} strokeWidth={2} />
      </Header>
      {expanded && <Body id={bodyId}>{children}</Body>}
    </Section>
  );
}
