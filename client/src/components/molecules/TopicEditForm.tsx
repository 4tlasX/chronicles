import styled from 'styled-components';
import { IconPicker } from './IconPicker.js';

const Card = styled.div`
  margin: 8px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.accent}; }
`;

const IconSection = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  padding: 8px;
`;

const IconLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 4px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const PrimaryBtn = styled.button<{ $color: string; $disabled?: boolean }>`
  flex: 1;
  padding: 8px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: ${({ $color, $disabled, theme }) => $disabled ? theme.colors.border : $color};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
`;

const GhostBtn = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  &:hover { background: rgba(0, 0, 0, 0.04); }
`;

interface TopicEditFormProps {
  name: string;
  icon: string | null;
  accentColor: string;
  saving?: boolean;
  saveLabel?: string;
  onNameChange: (name: string) => void;
  onIconChange: (icon: string | null) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function TopicEditForm({ name, icon, accentColor, saving, saveLabel = 'Save', onNameChange, onIconChange, onSave, onCancel, onKeyDown }: TopicEditFormProps) {
  return (
    <Card>
      <Input
        value={name}
        onChange={e => onNameChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSave();
          if (e.key === 'Escape') onCancel();
          onKeyDown?.(e);
        }}
        placeholder="Topic name"
        autoFocus
      />
      <IconSection>
        <IconLabel>Icon (optional)</IconLabel>
        <IconPicker selectedIcon={icon} onSelectIcon={onIconChange} />
      </IconSection>
      <Actions>
        <PrimaryBtn $color={accentColor} $disabled={saving || !name.trim()} disabled={saving || !name.trim()} onClick={onSave}>
          {saving ? 'Saving...' : saveLabel}
        </PrimaryBtn>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
      </Actions>
    </Card>
  );
}
