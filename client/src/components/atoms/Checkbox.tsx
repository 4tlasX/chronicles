import { Checkbox as DSCheckbox } from '../../../../design-system/components/core/Checkbox.jsx';
import type { ReactNode } from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
}

export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <DSCheckbox
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      label={label}
    />
  );
}
