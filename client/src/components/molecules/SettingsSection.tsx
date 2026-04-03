import styled from 'styled-components';

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

export const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.h1.fontFamily};
  font-size: ${({ theme }) => theme.typography.h1.fontSize};
  font-weight: ${({ theme }) => theme.typography.h1.fontWeight};
`;

export const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  color: ${({ theme }) => theme.colors.text};
  margin: 32px 0 12px;
`;

export const SectionDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 12px;
`;

export const DangerTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.h2.fontFamily};
  font-size: ${({ theme }) => theme.typography.h2.fontSize};
  font-weight: ${({ theme }) => theme.typography.h2.fontWeight};
  color: ${({ theme }) => theme.colors.danger};
  margin: 32px 0 12px;
`;

export const CollapsibleHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 20px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  cursor: pointer;
  text-align: left;
`;

export const CollapsibleTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const CollapsibleDesc = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

export const CollapsibleBody = styled.div`
  padding: 16px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg}px ${({ theme }) => theme.borderRadius.lg}px;
  background: ${({ theme }) => theme.colors.surface};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PrivacyCard = styled.div`
  padding: 16px 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: ${({ theme }) => theme.colors.surface};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
`;

export const DangerCard = styled.div`
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

export const PasswordForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

export const SessionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 20px 16px;
`;

export const SessionItem = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
`;

export const ColorSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ColorSectionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

export const ColorSectionDesc = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 12px;
`;
