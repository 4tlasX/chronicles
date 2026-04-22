import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ActionButton = styled.button`
  && {
    padding: 6px 16px;
    font-size: 16px;
    color: ${({ theme }) => theme.colors.text};
    background: var(--paper-surface);
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md}px;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
    &:hover { background: var(--paper-hover); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`;

export const SignOutButton = styled(ActionButton)``;

export const SelectedColorLabel = styled.div`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 8px;
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  &:hover { opacity: 0.7; }
`;
