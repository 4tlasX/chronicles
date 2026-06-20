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

const LogoSvg = styled.svg`
  width: 56px;
  height: 56px;
  stroke: var(--color-accent, #5b53d6);
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
          <LogoSvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Petal 1 (top) */}
            <g>
              <path strokeWidth="1.1" d="M44,47 C34,42 24,28 28,13 C32,4 48,4 50,8 C52,4 68,4 72,13 C76,28 66,42 56,47 Z"/>
              <path strokeWidth="0.7" d="M50,46 C50,36 50,22 50,10"/>
              <path strokeWidth="0.7" d="M50,36 C48,30 44,24 40,18"/>
              <path strokeWidth="0.7" d="M50,36 C52,30 56,24 60,18"/>
              <path strokeWidth="0.7" d="M50,28 C49,24 47,20 45,16"/>
              <path strokeWidth="0.7" d="M50,28 C51,24 53,20 55,16"/>
            </g>
            {/* Petal 2 */}
            <g transform="rotate(72,50,50)">
              <path strokeWidth="1.1" d="M44,47 C34,42 24,28 28,13 C32,4 48,4 50,8 C52,4 68,4 72,13 C76,28 66,42 56,47 Z"/>
              <path strokeWidth="0.7" d="M50,46 C50,36 50,22 50,10"/>
              <path strokeWidth="0.7" d="M50,36 C48,30 44,24 40,18"/>
              <path strokeWidth="0.7" d="M50,36 C52,30 56,24 60,18"/>
              <path strokeWidth="0.7" d="M50,28 C49,24 47,20 45,16"/>
              <path strokeWidth="0.7" d="M50,28 C51,24 53,20 55,16"/>
            </g>
            {/* Petal 3 */}
            <g transform="rotate(144,50,50)">
              <path strokeWidth="1.1" d="M44,47 C34,42 24,28 28,13 C32,4 48,4 50,8 C52,4 68,4 72,13 C76,28 66,42 56,47 Z"/>
              <path strokeWidth="0.7" d="M50,46 C50,36 50,22 50,10"/>
              <path strokeWidth="0.7" d="M50,36 C48,30 44,24 40,18"/>
              <path strokeWidth="0.7" d="M50,36 C52,30 56,24 60,18"/>
              <path strokeWidth="0.7" d="M50,28 C49,24 47,20 45,16"/>
              <path strokeWidth="0.7" d="M50,28 C51,24 53,20 55,16"/>
            </g>
            {/* Petal 4 */}
            <g transform="rotate(216,50,50)">
              <path strokeWidth="1.1" d="M44,47 C34,42 24,28 28,13 C32,4 48,4 50,8 C52,4 68,4 72,13 C76,28 66,42 56,47 Z"/>
              <path strokeWidth="0.7" d="M50,46 C50,36 50,22 50,10"/>
              <path strokeWidth="0.7" d="M50,36 C48,30 44,24 40,18"/>
              <path strokeWidth="0.7" d="M50,36 C52,30 56,24 60,18"/>
              <path strokeWidth="0.7" d="M50,28 C49,24 47,20 45,16"/>
              <path strokeWidth="0.7" d="M50,28 C51,24 53,20 55,16"/>
            </g>
            {/* Petal 5 */}
            <g transform="rotate(288,50,50)">
              <path strokeWidth="1.1" d="M44,47 C34,42 24,28 28,13 C32,4 48,4 50,8 C52,4 68,4 72,13 C76,28 66,42 56,47 Z"/>
              <path strokeWidth="0.7" d="M50,46 C50,36 50,22 50,10"/>
              <path strokeWidth="0.7" d="M50,36 C48,30 44,24 40,18"/>
              <path strokeWidth="0.7" d="M50,36 C52,30 56,24 60,18"/>
              <path strokeWidth="0.7" d="M50,28 C49,24 47,20 45,16"/>
              <path strokeWidth="0.7" d="M50,28 C51,24 53,20 55,16"/>
            </g>
            {/* Seed pod center */}
            <circle cx="50" cy="50" r="9" strokeWidth="1.1"/>
            {/* Stamen ring */}
            <g strokeWidth="1">
              <line x1="50" y1="39" x2="50" y2="36"/>
              <line transform="rotate(36,50,50)"  x1="50" y1="39" x2="50" y2="36"/>
              <line transform="rotate(72,50,50)"  x1="50" y1="39" x2="50" y2="36"/>
              <line transform="rotate(108,50,50)" x1="50" y1="39" x2="50" y2="36"/>
              <line transform="rotate(144,50,50)" x1="50" y1="39" x2="50" y2="36"/>
              <line transform="rotate(180,50,50)" x1="50" y1="39" x2="50" y2="36"/>
              <line transform="rotate(216,50,50)" x1="50" y1="39" x2="50" y2="36"/>
              <line transform="rotate(252,50,50)" x1="50" y1="39" x2="50" y2="36"/>
              <line transform="rotate(288,50,50)" x1="50" y1="39" x2="50" y2="36"/>
              <line transform="rotate(324,50,50)" x1="50" y1="39" x2="50" y2="36"/>
            </g>
            {/* Center dot */}
            <circle cx="50" cy="50" r="2.5" fill="var(--color-accent, #5b53d6)" stroke="none"/>
          </LogoSvg>
          <LogoText>
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
