import { Switch as DSSwitch } from '../../../../design-system/components/core/Switch.jsx';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <DSSwitch
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      label={label}
    />
  );
}
