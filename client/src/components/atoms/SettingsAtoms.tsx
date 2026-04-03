import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ActionButton = styled.button`
  padding: 6px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover { opacity: 0.85; }
`;

export const SignOutButton = styled.button`
  padding: 6px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(239, 68, 68, 0.05); }
`;

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
