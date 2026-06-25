import styled from 'styled-components';
import type { UserFieldDef } from '../../../types/userFields.js';
import { Checkbox } from '../../atoms/Checkbox.js';
import { TextInput } from '../../atoms/TextInput.js';
import { FormField } from '../FormField.js';

/* Renders a topic's user-defined custom fields. Uses the shared FormField +
   TextInput/Checkbox atoms — styling and layout come from those, so changing
   the atoms or FormField changes these fields everywhere too. */

const UrlWrapper = styled.div`
  position: relative;
  width: 100%;
  &::before {
    content: 'https://';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--mono, ${({ theme }) => theme.fontFamily.mono});
    font-size: 11px;
    color: var(--text-tertiary);
    pointer-events: none;
  }
  input { padding-left: 56px; }
`;

interface UserFieldsFormProps {
  fieldDefs: UserFieldDef[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function UserFieldsForm({ fieldDefs, values, onChange }: UserFieldsFormProps) {
  const set = (id: string, value: unknown) => onChange({ ...values, [id]: value });

  return (
    <>
      {fieldDefs.map(f => {
        const val = values[f.id];
        switch (f.type) {
          case 'boolean':
            return (
              <FormField key={f.id} label={f.label}>
                <Checkbox
                  checked={!!val}
                  onChange={checked => set(f.id, checked)}
                  label={f.label}
                />
              </FormField>
            );
          case 'number':
            return (
              <FormField key={f.id} label={f.label}>
                <TextInput
                  type="number"
                  value={val != null ? String(val) : ''}
                  onChange={e => set(f.id, e.target.value === '' ? '' : Number(e.target.value))}
                />
              </FormField>
            );
          case 'date':
            return (
              <FormField key={f.id} label={f.label}>
                <TextInput
                  type="date"
                  value={typeof val === 'string' ? val : ''}
                  onChange={e => set(f.id, e.target.value)}
                />
              </FormField>
            );
          case 'url':
            return (
              <FormField key={f.id} label={f.label}>
                <UrlWrapper>
                  <TextInput
                    type="url"
                    value={typeof val === 'string' ? val : ''}
                    onChange={e => set(f.id, e.target.value)}
                    placeholder="goodreads.com/book/show/…"
                  />
                </UrlWrapper>
              </FormField>
            );
          default: // text
            return (
              <FormField key={f.id} label={f.label}>
                <TextInput
                  type="text"
                  placeholder={`Add ${f.label.toLowerCase()}…`}
                  value={typeof val === 'string' ? val : ''}
                  onChange={e => set(f.id, e.target.value)}
                />
              </FormField>
            );
        }
      })}
    </>
  );
}
