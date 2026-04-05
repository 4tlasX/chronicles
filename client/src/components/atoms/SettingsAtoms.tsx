import styled from 'styled-components';
import { Link } from 'react-router-dom';

const isDark = (theme: { colors: { background: string } }) => theme.colors.background === '#1a1b1d';

export const ActionButton = styled.button`
  && {
    padding: 6px 16px;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => isDark(theme) ? '#2a2b2d' : '#faf8f2'};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md}px;
    cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
    &:hover { background: ${({ theme }) => isDark(theme) ? '#3a3b3d' : '#ecebe7'}; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`;

export const SignOutButton = styled(ActionButton)``;

export const SelectedColorLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 8px;
`;

export const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  &:hover { opacity: 0.7; }
`;
