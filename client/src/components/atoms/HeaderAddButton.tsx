import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const Btn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

interface HeaderAddButtonProps {
  label: string;
  onClick: () => void;
}

export function HeaderAddButton({ label, onClick }: HeaderAddButtonProps) {
  return (
    <Btn onClick={onClick} aria-label={label} data-print-hide>
      <FontAwesomeIcon icon={faPlus} />
      {label}
    </Btn>
  );
}
