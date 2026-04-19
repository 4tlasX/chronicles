import { useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import type { ReactNode } from 'react';
import { BACKGROUND_IMAGES } from '@shared/theme/backgrounds';

const options = BACKGROUND_IMAGES.filter(b => b.value !== '');

function isDarkTheme(bg: string): boolean {
  const c = bg.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md}px;
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const ImageOverlay = styled.div<{ $image: string; $opacity: number }>`
  position: fixed;
  top: -100px;
  left: -100px;
  right: -100px;
  bottom: 0;
  background-image: url(${({ $image }) => $image});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center bottom;
  opacity: ${({ $opacity }) => $opacity};
  pointer-events: none;
  z-index: 0;
`;

const Card = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  font-style: normal;
  background: #f7f6f3;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl}px;
`;

const LogoMark = styled.div`
  font-family: 'Cormorant Garamond', serif;
  font-size: 36px;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  padding-top: 4px;
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
  font-family: ${({ theme }) => theme.fontFamily.serif};
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
  const theme = useTheme();

  const { bg, opacity } = useMemo(() => {
    const idx = Math.floor(Math.random() * options.length);
    const picked = options[idx];
    const op = 0.10;
    return { bg: picked.value, opacity: op };
  }, []);

  return (
    <Wrapper>
      <ImageOverlay $image={bg} $opacity={opacity} />
      <Card>
        <LogoMark>Chronicles</LogoMark>
        {!brand && <PageTitle>{title}</PageTitle>}
        {children}
        {footer && <Footer>{footer}</Footer>}
      </Card>
    </Wrapper>
  );
}
