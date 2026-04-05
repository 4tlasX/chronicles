import styled from 'styled-components';
import type { ReactNode } from 'react';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.md}px;
  background: #faf8f2;
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  font-style: normal;
`;

const BrandTitle = styled.h1`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 2rem;
  font-weight: 100;
  font-style: italic;
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
  return (
    <Wrapper>
      <Card>
        {brand ? <BrandTitle>{title}</BrandTitle> : <PageTitle>{title}</PageTitle>}
        {children}
        {footer && <Footer>{footer}</Footer>}
      </Card>
    </Wrapper>
  );
}
