import styled from 'styled-components';
import { useId, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(43, 40, 36, 0.48);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  overscroll-behavior: contain;
  touch-action: none;
`;

const Content = styled.div<{ $size: string }>`
  width: 100%;
  max-width: ${({ $size }) =>
    $size === 'sm' ? '380px' :
    $size === 'lg' ? '600px' :
    $size === 'xl' ? '800px' : '480px'};
  margin: 0 16px;
  background: var(--paper-surface, ${({ theme }) => theme.colors.surface});
  border: 1px solid var(--ink, ${({ theme }) => theme.colors.text});
  border-radius: var(--r-lg, ${({ theme }) => theme.borderRadius.lg}px);
  box-shadow: var(--shadow-3, ${({ theme }) => theme.shadow.lg});
  overflow: hidden;
  overscroll-behavior: contain;
  touch-action: pan-y;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--s-4, 16px) var(--s-5, 20px);
  border-bottom: 1px solid var(--border-subtle);
`;

const Title = styled.h3`
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 18px;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--r-md, 1px);
  transition: background 120ms ease;
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
`;

const Body = styled.div`
  padding: var(--s-5, 20px);
  color: var(--text-secondary);
  font-size: 14.5px;
  line-height: 1.55;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--s-2, 10px);
  padding: var(--s-4, 16px) var(--s-5, 20px);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-app);
`;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, size = 'md', children, footer }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useFocusTrap(contentRef, open, onClose);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <Overlay onClick={onClose}>
      <Content
        ref={contentRef}
        $size={size}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <Header>
            <Title id={titleId}>{title}</Title>
            <CloseButton onClick={onClose} aria-label="Close">&times;</CloseButton>
          </Header>
        )}
        <Body>{children}</Body>
        {footer && <Footer>{footer}</Footer>}
      </Content>
    </Overlay>,
    document.body,
  );
}
