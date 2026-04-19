import styled from 'styled-components';
import { faXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextInput } from '../../atoms/TextInput.js';
import { Select } from '../../atoms/Select.js';
import { Textarea } from '../../atoms/Textarea.js';
import { FormField } from '../FormField.js';
import type { RecipeFieldValues, RecipeIngredient } from '../../../types/fields.js';
export type { RecipeFieldValues } from '../../../types/fields.js';

/* ── Styled components ── */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  & > * { flex: 1; min-width: 0; }
`;

const SectionLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 4px;
`;

const IngredientRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
`;

const AmountInput = styled(TextInput)`
  width: 90px;
  flex-shrink: 0;
`;

const IngredientName = styled(TextInput)`
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
  margin-top: 8px;
  padding: 6px 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: none;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text}; border-color: ${({ theme }) => theme.colors.textSecondary}; }
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

/* ── Component ── */

interface RecipeFieldsProps {
  values: RecipeFieldValues;
  onChange: (values: RecipeFieldValues) => void;
  shoppingListOptions?: { id: number; title: string }[];
}

export function RecipeFields({ values, onChange, shoppingListOptions = [] }: RecipeFieldsProps) {
  const ingredients = values.ingredients || [];
  const linkedShoppingListIds = values.linkedShoppingListIds || [];

  const updateIngredient = (index: number, patch: Partial<RecipeIngredient>) => {
    onChange({ ...values, ingredients: ingredients.map((ing, i) => i === index ? { ...ing, ...patch } : ing) });
  };

  const removeIngredient = (index: number) => {
    onChange({ ...values, ingredients: ingredients.filter((_, i) => i !== index) });
  };

  const addIngredient = () => {
    onChange({ ...values, ingredients: [...ingredients, { id: crypto.randomUUID(), amount: '', name: '' }] });
  };

  const linkShoppingList = (slId: number) => {
    if (!linkedShoppingListIds.includes(slId)) {
      onChange({ ...values, linkedShoppingListIds: [...linkedShoppingListIds, slId] });
    }
  };

  const unlinkShoppingList = (slId: number) => {
    onChange({ ...values, linkedShoppingListIds: linkedShoppingListIds.filter(id => id !== slId) });
  };

  const availableToLink = shoppingListOptions.filter(sl => !linkedShoppingListIds.includes(sl.id));

  return (
    <Wrapper>
      <Row>
        <FormField label="Servings">
          <TextInput
            type="number"
            min="1"
            value={values.servings}
            onChange={e => onChange({ ...values, servings: e.target.value })}
            placeholder="4"
          />
        </FormField>
        <FormField label="Prep Time">
          <TextInput
            value={values.prepTime}
            onChange={e => onChange({ ...values, prepTime: e.target.value })}
            placeholder="30 min"
          />
        </FormField>
        <FormField label="Cook Time">
          <TextInput
            value={values.cookTime}
            onChange={e => onChange({ ...values, cookTime: e.target.value })}
            placeholder="45 min"
          />
        </FormField>
      </Row>

      <FormField label="Cuisine">
        <TextInput
          value={values.cuisine}
          onChange={e => onChange({ ...values, cuisine: e.target.value })}
          placeholder="e.g. Italian, Mexican, Asian"
        />
      </FormField>

      <div>
        <SectionLabel>Ingredients</SectionLabel>
        {ingredients.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px 0 8px' }}>No ingredients yet.</div>
        )}
        {ingredients.map((ing, index) => (
          <IngredientRow key={ing.id}>
            <AmountInput
              value={ing.amount}
              onChange={e => updateIngredient(index, { amount: e.target.value })}
              placeholder="Amount"
            />
            <IngredientName
              value={ing.name}
              onChange={e => updateIngredient(index, { name: e.target.value })}
              placeholder="Ingredient"
            />
            <RemoveBtn type="button" onClick={() => removeIngredient(index)} aria-label="Remove ingredient">
              <FontAwesomeIcon icon={faXmark} />
            </RemoveBtn>
          </IngredientRow>
        ))}
        <AddBtn type="button" onClick={addIngredient}>
          <FontAwesomeIcon icon={faPlus} size="xs" />
          Add Ingredient
        </AddBtn>
      </div>

      <FormField label="Instructions">
        <Textarea
          value={values.instructions}
          onChange={e => onChange({ ...values, instructions: e.target.value })}
          placeholder="Step-by-step instructions..."
          style={{ minHeight: 100 }}
        />
      </FormField>

      <div>
        <SectionLabel>Linked Shopping Lists</SectionLabel>
        {availableToLink.length > 0 && (
          <Select
            value=""
            onChange={e => { if (e.target.value) linkShoppingList(parseInt(e.target.value)); }}
          >
            <option value="">Link a shopping list...</option>
            {availableToLink.map(sl => (
              <option key={sl.id} value={sl.id}>{sl.title}</option>
            ))}
          </Select>
        )}
        {linkedShoppingListIds.length > 0 && (
          <LinkedList>
            {linkedShoppingListIds.map(id => {
              const sl = shoppingListOptions.find(s => s.id === id);
              return (
                <LinkedItem key={id}>
                  <LinkedItemTitle>{sl?.title || `Shopping List #${id}`}</LinkedItemTitle>
                  <UnlinkBtn type="button" onClick={() => unlinkShoppingList(id)} aria-label="Unlink">
                    <FontAwesomeIcon icon={faXmark} size="xs" />
                  </UnlinkBtn>
                </LinkedItem>
              );
            })}
          </LinkedList>
        )}
        {linkedShoppingListIds.length === 0 && availableToLink.length === 0 && (
          <div style={{ fontSize: 13, fontStyle: 'italic', color: 'inherit', opacity: 0.5, padding: '4px 0' }}>
            No shopping lists available to link.
          </div>
        )}
      </div>
    </Wrapper>
  );
}
