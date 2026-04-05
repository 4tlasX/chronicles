import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';

const Btn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.text};
  }

  @media print {
    display: none !important;
  }
`;

export function PrintButton() {
  return (
    <Btn onClick={() => window.print()} aria-label="Print this page" data-print-hide>
      <FontAwesomeIcon icon={faPrint} />
      Print
    </Btn>
  );
}
