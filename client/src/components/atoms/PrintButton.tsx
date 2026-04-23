import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint } from '@fortawesome/free-solid-svg-icons';

const Btn = styled.button`
  display: flex;
  align-items: center;
  padding: 4px 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: ${({ theme }) => theme.colors.text}; }

  @media print {
    display: none !important;
  }
`;

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export function PrintButton() {
  return (
    <Btn onClick={() => window.print()} aria-label="Print this page" data-print-hide>
      <FontAwesomeIcon icon={faPrint} aria-hidden="true" />
      <SrOnly>Print</SrOnly>
    </Btn>
  );
}
