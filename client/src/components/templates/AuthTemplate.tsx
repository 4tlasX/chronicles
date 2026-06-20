import styled from 'styled-components';
import type { ReactNode } from 'react';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md}px;
  position: relative;
  background: var(--bg-app, ${({ theme }) => theme.colors.background});
`;

const Card = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  font-style: normal;
  background: var(--bg-surface, ${({ theme }) => theme.colors.surface});
  border: 1px solid var(--border-subtle, ${({ theme }) => theme.colors.border});
  border-radius: var(--r-xl, ${({ theme }) => theme.borderRadius.xl}px);
  box-shadow: var(--shadow-lg, ${({ theme }) => theme.shadow.lg});
`;

const LogoMark = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 24px;
  margin-bottom: 10px;
`;

const LogoText = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display, 'Work Sans', sans-serif);
  font-size: 22px;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-primary, ${({ theme }) => theme.colors.text});
`;

const PageTitle = styled.h1`
  font-family: var(--font-display, 'Work Sans', serif);
  font-size: 1.6rem;
  font-weight: 200;
  font-style: normal;
  color: var(--text-primary, ${({ theme }) => theme.colors.text});
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  text-align: center;
`;

const Footer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSize.sm}px;
  font-style: normal;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: ${({ theme }) => theme.colors.text};
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

interface AuthTemplateProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  brand?: boolean;
}

export function AuthTemplate({ title, children, footer, brand }: AuthTemplateProps) {
  return (
    <Wrapper>
      <Card>
        <LogoMark>
          <LogoText>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--color-accent)' }} aria-hidden>
              <path d="M16 6L26 16L16 26L6 16Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
              <circle cx="16" cy="16" r="3.6" fill="currentColor" />
            </svg>
            Chronicles
          </LogoText>
        </LogoMark>
        {!brand && <PageTitle>{title}</PageTitle>}
        {children}
        {footer && <Footer>{footer}</Footer>}
      </Card>
    </Wrapper>
  );
}
