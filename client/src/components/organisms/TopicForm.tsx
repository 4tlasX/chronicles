import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { TextInput } from '../atoms/TextInput.js';
import { Button } from '../atoms/Button.js';
import { Spinner } from '../atoms/Spinner.js';
import { FormField } from '../molecules/FormField.js';

const TOPIC_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899',
  '#EF4444', '#14B8A6', '#F97316', '#6366F1', '#22C55E',
];

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const ColorRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const ColorDot = styled.button<{ $color: string; $selected: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.colors.text : 'transparent'};
  cursor: pointer;
  transition: transform 0.1s;
  padding: 0;

  &:hover { transform: scale(1.15); }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm}px;
  justify-content: flex-end;
`;

interface TopicFormProps {
  initialName?: string;
  initialColor?: string;
  initialIcon?: string;
  onSubmit: (data: { name: string; color: string; icon?: string }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function TopicForm({
  initialName = '',
  initialColor = TOPIC_COLORS[0],
  onSubmit,
  onCancel,
  submitLabel = 'Create Topic',
}: TopicFormProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), color });
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormField label="Topic Name" error={error}>
        <TextInput
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Work, Personal, Ideas"
          autoFocus
        />
      </FormField>
      <FormField label="Color">
        <ColorRow>
          {TOPIC_COLORS.map(c => (
            <ColorDot
              key={c}
              type="button"
              $color={c}
              $selected={color === c}
              onClick={() => setColor(c)}
            />
          ))}
        </ColorRow>
      </FormField>
      <Actions>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size={16} /> : submitLabel}
        </Button>
      </Actions>
    </Form>
  );
}
