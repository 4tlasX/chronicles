import { useMemo } from 'react';
import styled from 'styled-components';
import { Icon } from '../../../../../design-system/components/core/Icon.jsx';
import { TextInput } from '../../atoms/TextInput.js';
import { Select } from '../../atoms/Select.js';
import { Checkbox } from '../../atoms/Checkbox.js';
import { Textarea } from '../../atoms/Textarea.js';
import { FormField } from '../FormField.js';
import { RecipeAutocomplete } from '../RecipeAutocomplete.js';
import type { ShoppingListFieldValues, ShoppingItem, ShoppingCategory } from '../../../types/fields.js';
export type { ShoppingListFieldValues } from '../../../types/fields.js';

const CATEGORIES: { value: ShoppingCategory; label: string }[] = [
  { value: 'produce',      label: 'Produce' },
  { value: 'meat',         label: 'Meat' },
  { value: 'dairy',        label: 'Dairy' },
  { value: 'bakery',       label: 'Bakery' },
  { value: 'frozen',       label: 'Frozen' },
  { value: 'beverages',    label: 'Beverages' },
  { value: 'sundries',     label: 'Sundries' },
  { value: 'personal_care',label: 'Personal Care' },
  { value: 'household',    label: 'Household' },
  { value: 'other',        label: 'Other' },
];

const CATEGORY_ORDER = CATEGORIES.map(c => c.value);

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
`;

const GroupHeader = styled.div`
  font-family: var(--font-label);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 16px 0 6px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 4px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

const NameInput = styled(TextInput)`
  flex: 1;
  min-width: 0;
`;

const CategorySelect = styled(Select)`
  flex: 1;
  min-width: 0;
`;

const RemoveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  &:hover { color: ${({ theme }) => theme.colors.danger}; background: ${({ theme }) => theme.colors.surfaceHover}; }
`;

const AddBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 6px 12px;
  font-family: var(--font-label);
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text}; border-color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const NotesSection = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const LinkedSection = styled.div`
  margin-top: 20px;
`;

const SectionLabel = styled.div`
  font-family: var(--font-label);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 8px;
`;

const LinkedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
`;

const LinkedItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  font-size: 15px;
  background: ${({ theme }) => theme.colors.surfaceHover};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
`;

const LinkedItemTitle = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text};
`;

const UnlinkBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: 4px;
  &:hover { color: ${({ theme }) => theme.colors.danger}; }
`;

const Empty = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  padding: 8px 0;
`;

interface ShoppingListFieldsProps {
  values: ShoppingListFieldValues;
  onChange: (values: ShoppingListFieldValues) => void;
  recipeOptions?: { id: number; title: string }[];
}

export function ShoppingListFields({ values, onChange, recipeOptions = [] }: ShoppingListFieldsProps) {
  const items = values.items || [];
  const linkedRecipeIds = values.linkedRecipeIds || [];

  const groups = useMemo(() => {
    const map = new Map<ShoppingCategory, { item: ShoppingItem; index: number }[]>();
    items.forEach((item, index) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push({ item, index });
    });
    return CATEGORY_ORDER
      .map(cat => ({
        cat,
        label: CATEGORIES.find(c => c.value === cat)!.label,
        entries: map.get(cat as ShoppingCategory) || [],
      }))
      .filter(g => g.entries.length > 0);
  }, [items]);

  const updateItem = (index: number, patch: Partial<ShoppingItem>) => {
    onChange({ ...values, items: items.map((item, i) => i === index ? { ...item, ...patch } : item) });
  };

  const removeItem = (index: number) => {
    onChange({ ...values, items: items.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: '',
      category: 'other',
      checked: false,
    };
    onChange({ ...values, items: [...items, newItem] });
  };

  return (
    <Wrapper>
      {items.length === 0 && <Empty>No items yet. Add your first item below.</Empty>}
      {groups.map(({ cat, label, entries }) => (
        <Group key={cat}>
          <GroupHeader>{label}</GroupHeader>
          {entries.map(({ item, index }) => (
            <ItemRow key={item.id}>
              <Checkbox
                checked={item.checked}
                onChange={v => updateItem(index, { checked: v })}
              />
              <NameInput
                value={item.name}
                onChange={e => updateItem(index, { name: e.target.value })}
                placeholder="Item"
              />
              <CategorySelect
                value={item.category}
                onChange={e => updateItem(index, { category: e.target.value as ShoppingCategory })}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </CategorySelect>
              <RemoveBtn type="button" onClick={() => removeItem(index)} aria-label="Remove item">
                <Icon name="x" size={14} strokeWidth={2} />
              </RemoveBtn>
            </ItemRow>
          ))}
        </Group>
      ))}
      <AddBtn type="button" onClick={addItem}>
        <Icon name="plus" size={12} strokeWidth={2} />
        Add Item
      </AddBtn>
      <NotesSection>
        <FormField label="Notes">
          <Textarea
            value={values.notes || ''}
            onChange={e => onChange({ ...values, notes: e.target.value })}
            placeholder="General notes for this shopping list"
            style={{ minHeight: 60 }}
          />
        </FormField>
      </NotesSection>

      <LinkedSection>
        {recipeOptions.filter(r => !linkedRecipeIds.includes(r.id)).length > 0 && (
          <RecipeAutocomplete
            recipes={recipeOptions.filter(r => !linkedRecipeIds.includes(r.id))}
            placeholder="Link a recipe..."
            onSelect={id => {
              if (!linkedRecipeIds.includes(id)) {
                onChange({ ...values, linkedRecipeIds: [...linkedRecipeIds, id] });
              }
            }}
          />
        )}
        {linkedRecipeIds.length > 0 ? (
          <LinkedList>
            {linkedRecipeIds.map(id => {
              const recipe = recipeOptions.find(r => r.id === id);
              return (
                <LinkedItem key={id}>
                  <LinkedItemTitle>{recipe?.title || `Recipe #${id}`}</LinkedItemTitle>
                  <UnlinkBtn
                    type="button"
                    onClick={() => onChange({ ...values, linkedRecipeIds: linkedRecipeIds.filter(rid => rid !== id) })}
                    aria-label="Unlink recipe"
                  >
                    <Icon name="x" size={12} strokeWidth={2} />
                  </UnlinkBtn>
                </LinkedItem>
              );
            })}
          </LinkedList>
        ) : (
          <div style={{ fontSize: 13, fontStyle: 'italic', opacity: 0.5, padding: '4px 0' }}>
            No recipes linked yet.
          </div>
        )}
      </LinkedSection>
    </Wrapper>
  );
}
