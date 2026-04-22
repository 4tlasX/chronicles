import styled from 'styled-components';
import type { UserFieldDef } from '../../../types/userFields.js';
import { Checkbox } from '../../atoms/Checkbox.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--s-3, 12px);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FieldLabel = styled.label`
  font-family: var(--ui, ${({ theme }) => theme.fontFamily.sans});
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--ink-3, ${({ theme }) => theme.colors.textMuted});
  margin-bottom: 3px;
  display: block;
`;

const BaseInput = styled.input`
  width: 100%;
  padding: 7px 10px;
  background: var(--paper-surface, #f7f4ee);
  border: 1px solid var(--rule, ${({ theme }) => theme.colors.border});
  border-radius: var(--r-sm, 2px);
  font-family: var(--sans, ${({ theme }) => theme.fontFamily.sans});
  font-size: 14px;
  color: var(--ink, ${({ theme }) => theme.colors.text});
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: var(--accent-stroke, ${({ theme }) => theme.colors.accent}); }
`;

const MonoInput = styled(BaseInput)`
  font-family: var(--mono, ${({ theme }) => theme.fontFamily.mono});
`;

const UrlWrapper = styled.div`
  position: relative;
  &::before {
    content: 'https://';
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--mono, ${({ theme }) => theme.fontFamily.mono});
    font-size: 11px;
    color: var(--ink-4, ${({ theme }) => theme.colors.textMuted});
    pointer-events: none;
  }
`;

const UrlInput = styled(MonoInput)`
  padding-left: 60px;
`;

interface UserFieldsFormProps {
  fieldDefs: UserFieldDef[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function UserFieldsForm({ fieldDefs, values, onChange }: UserFieldsFormProps) {
  const set = (id: string, value: unknown) => onChange({ ...values, [id]: value });

  return (
    <Wrapper>
      {fieldDefs.map(f => {
        const val = values[f.id];
        switch (f.type) {
          case 'boolean':
            return (
              <FieldGroup key={f.id}>
                <Checkbox
                  checked={!!val}
                  onChange={checked => set(f.id, checked)}
                  label={f.label}
                />
              </FieldGroup>
            );
          case 'number':
            return (
              <FieldGroup key={f.id}>
                <FieldLabel>{f.label}</FieldLabel>
                <MonoInput
                  type="number"
                  value={val != null ? String(val) : ''}
                  onChange={e => set(f.id, e.target.value === '' ? '' : Number(e.target.value))}
                />
              </FieldGroup>
            );
          case 'date':
            return (
              <FieldGroup key={f.id}>
                <FieldLabel>{f.label}</FieldLabel>
                <MonoInput
                  type="date"
                  value={typeof val === 'string' ? val : ''}
                  onChange={e => set(f.id, e.target.value)}
                />
              </FieldGroup>
            );
          case 'url':
            return (
              <FieldGroup key={f.id}>
                <FieldLabel>{f.label}</FieldLabel>
                <UrlWrapper>
                  <UrlInput
                    type="url"
                    value={typeof val === 'string' ? val : ''}
                    onChange={e => set(f.id, e.target.value)}
                    placeholder="goodreads.com/book/show/…"
                  />
                </UrlWrapper>
              </FieldGroup>
            );
          default: // text
            return (
              <FieldGroup key={f.id}>
                <FieldLabel>{f.label}</FieldLabel>
                <BaseInput
                  type="text"
                  value={typeof val === 'string' ? val : ''}
                  onChange={e => set(f.id, e.target.value)}
                />
              </FieldGroup>
            );
        }
      })}
    </Wrapper>
  );
}
