import { useMemo } from 'react';
import styled from 'styled-components';
import type { ReactNode } from 'react';
import { BACKGROUND_IMAGES } from '@shared/theme/backgrounds';

const options = BACKGROUND_IMAGES.filter(b => b.value !== '');


const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md}px;
  position: relative;
`;

const BgLayer = styled.div<{ $bg?: string }>`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: ${({ $bg }) => $bg ? `url('${$bg}')` : 'none'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.15;
`;


const Card = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  font-style: normal;
  background: var(--paper-surface, ${({ theme }) => theme.colors.surface});
  border: 1px solid var(--accent-stroke, var(--rule, ${({ theme }) => theme.colors.border}));
  border-radius: var(--r-xl, ${({ theme }) => theme.borderRadius.xl}px);
  box-shadow: var(--shadow-2, ${({ theme }) => theme.shadow.md});
`;

const LogoMark = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-top: 32px;
  margin-bottom: 10px;
`;

const PoppyImg = styled.img`
  width: 52px;
  height: 52px;
  filter: invert(1);
  opacity: 0.65;
`;

const LogoText = styled.div`
  font-family: var(--brand, 'Josefin Sans', sans-serif);
  font-size: 32px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: ${({ theme }) => theme.colors.text};
`;

const LogoDivider = styled.div`
  width: 72px;
  height: 1px;
  background: ${({ theme }) => theme.colors.text};
  margin: 0 auto 10px;
  opacity: 0.4;
`;

const LogoTagline = styled.div`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 17px;
  font-style: italic;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  margin-top: -12px;
`;

const BrandTitle = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 2rem;
  font-weight: 100;
  text-transform: uppercase;
  letter-spacing: 0.12rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-family: var(--serif, 'Playfair Display', serif);
  font-size: 1.5rem;
  font-weight: 500;
  font-style: italic;
  color: ${({ theme }) => theme.colors.text};
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
  const bg = useMemo(() => {
    const idx = Math.floor(Math.random() * options.length);
    return options[idx].value;
  }, []);

  return (
    <Wrapper>
      <BgLayer $bg={bg} />
      <Card>
        <LogoMark>
          <LogoText>Chronicles</LogoText>
        </LogoMark>
        {!brand && <PageTitle>{title}</PageTitle>}
        {children}
        {footer && <Footer>{footer}</Footer>}
      </Card>
    </Wrapper>
  );
}
