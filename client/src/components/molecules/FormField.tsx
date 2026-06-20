import styled from 'styled-components';
import { Label } from '../atoms/Label.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--s-1, 4px);
`;

const ErrorText = styled.span`
  font-size: var(--text-xs, 13px);
  color: var(--text-danger);
`;

interface FormFieldProps {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function FormField({ label, error, htmlFor, children, style }: FormFieldProps) {
  return (
    <Wrapper style={style}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}
