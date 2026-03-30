import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const ActionButton = styled.button`
  padding: 6px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.surfaceHover}; }
`;

export const SignOutButton = styled.button`
  padding: 6px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.danger};
  background: white;
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
  font-size: 14px;
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;
