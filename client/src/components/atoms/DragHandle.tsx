import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';

const Handle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  opacity: 0.35;
  transition: opacity 0.15s, color 0.15s;
  background: none;
  border: none;
  cursor: grab;
  font-size: 14px;
  touch-action: none;
  flex-shrink: 0;
  padding: 8px;
  &:active { cursor: grabbing; }
  &:hover { opacity: 1; color: ${({ theme }) => theme.colors.text}; }
`;

interface DragHandleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function DragHandle(props: DragHandleProps) {
  return (
    <Handle type="button" aria-label="Drag to reorder" aria-roledescription="sortable" {...props}>
      <FontAwesomeIcon icon={faGripVertical} />
    </Handle>
  );
}
