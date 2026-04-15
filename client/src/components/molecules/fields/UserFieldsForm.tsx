import styled from 'styled-components';
import type { UserFieldDef } from '../../../types/userFields.js';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TextInput = styled.input`
  width: 100%;
  padding: 7px 10px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: ${({ theme }) => theme.colors.accent}; }
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.accent};
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
                <CheckboxRow>
                  <CheckboxInput
                    type="checkbox"
                    checked={!!val}
                    onChange={e => set(f.id, e.target.checked)}
                  />
                  {f.label}
                </CheckboxRow>
              </FieldGroup>
            );
          case 'number':
            return (
              <FieldGroup key={f.id}>
                <FieldLabel>{f.label}</FieldLabel>
                <TextInput
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
                <TextInput
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
                <TextInput
                  type="url"
                  value={typeof val === 'string' ? val : ''}
                  onChange={e => set(f.id, e.target.value)}
                  placeholder="https://"
                />
              </FieldGroup>
            );
          default: // text
            return (
              <FieldGroup key={f.id}>
                <FieldLabel>{f.label}</FieldLabel>
                <TextInput
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
