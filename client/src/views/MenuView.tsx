import { useState, useMemo, useCallback, useEffect, Fragment } from 'react';
import styled from 'styled-components';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { ViewHeader } from '../components/molecules/ViewHeader.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { useEntriesStore } from '../stores/entriesStore.js';
import { useEncryption } from '../contexts/EncryptionContext.js';
import { useInitializeData } from '../hooks/useInitializeData.js';
import { entries as entriesApi } from '../services/api.js';
import { stripHtml } from '../utils/stripHtml.js';
import { useNavigate } from 'react-router-dom';
import type { MenuPlanDay, MenuMealSlot, MealSlotType, RecipeIngredient, ShoppingItem } from '../types/fields.js';

/* ── Helpers ── */

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtDay(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

const MEAL_SLOTS: { key: MealSlotType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch',     label: 'Lunch' },
  { key: 'dinner',    label: 'Dinner' },
  { key: 'snack',     label: 'Snack' },
];

const emptySlot = (): MenuMealSlot => ({ mealName: '', recipeId: null, recipeName: '' });
const emptyDay  = (): MenuPlanDay  => ({ breakfast: emptySlot(), lunch: emptySlot(), dinner: emptySlot(), snack: emptySlot() });

/* ── Styled components ── */

const NavRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const WeekLabel = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 600;
  min-width: 180px;
  text-align: center;
`;

const NavBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  &:hover { background: ${({ theme }) => theme.colors.surfaceHover}; }
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  @media (max-width: 480px) { padding: 10px 12px; }
`;

const ActionBtn = styled.button<{ $primary?: boolean }>`
  padding: 7px 14px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  cursor: pointer;
  border: 1px solid ${({ $primary, theme }) => $primary ? 'transparent' : theme.colors.border};
  background: ${({ $primary, theme }) => $primary ? theme.colors.text : 'transparent'};
  color: ${({ $primary, theme }) => $primary ? theme.colors.textInverse : theme.colors.text};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { opacity: 0.85; }
`;

const StatusMsg = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 10px 24px;
  text-align: center;
`;

/* ── Desktop grid ── */

const ScrollArea = styled.div`
  flex: 1;
  overflow: auto;
  @media (max-width: 640px) { display: none; }
`;

const PlannerGrid = styled.div`
  display: grid;
  grid-template-columns: 90px repeat(7, minmax(140px, 1fr));
  min-width: 760px;
`;

const HeaderCell = styled.div`
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  &:last-child { border-right: none; }
`;

const DayName = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const DayDate = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 2px;
`;

const MealLabelCell = styled.div`
  padding: 10px 8px;
  display: flex;
  align-items: flex-start;
  padding-top: 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const MealCell = styled.div`
  padding: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 4px;
  &:last-child { border-right: none; }
`;

const MealInput = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  font-size: 13px;
  padding: 5px 7px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  resize: none;
  overflow: hidden;
  min-height: 30px;
  line-height: 1.4;
  field-sizing: content;
  &::placeholder { color: ${({ theme }) => theme.colors.textMuted}; }
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.textSecondary}; }
`;

const RecipeSelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  font-size: 13px;
  padding: 3px 20px 3px 5px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: inherit;
  cursor: pointer;
  appearance: auto;
`;

/* ── Mobile cards ── */

const MobileArea = styled.div`
  display: none;
  flex-direction: column;
  flex: 1;
  overflow: auto;
  @media (max-width: 640px) { display: flex; }
`;

const DayCard = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DayCardHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 10px 16px 6px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DayCardName = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DayCardDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MobileSlotRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  &:last-child { border-bottom: none; }
`;

const MobileSlotLabel = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 70px;
  flex-shrink: 0;
`;

const MobileSlotInputs = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

/* ── Component ── */

export function MenuView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();
  const entries              = useEntriesStore(s => s.decryptedEntries);
  const allTopics            = useEntriesStore(s => s.allTopics);
  const addDecryptedEntry    = useEntriesStore(s => s.addDecryptedEntry);
  const updateDecryptedEntry = useEntriesStore(s => s.updateDecryptedEntry);
  const { encryptPost } = useEncryption();
  const navigate = useNavigate();

  const [weekStart, setWeekStart]   = useState(() => getMonday(new Date()));
  const [meals, setMeals]           = useState<Record<string, MenuPlanDay>>({});
  const [isSaving, setIsSaving]     = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg]   = useState('');

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekStartStr = toDateStr(weekStart);

  const menuPlanTopicId     = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'menu plan')?.id,    [allTopics]);
  const recipeTopicId       = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'recipe')?.id,       [allTopics]);
  const shoppingListTopicId = useMemo(() => allTopics.find(t => t.name.toLowerCase() === 'shopping list')?.id, [allTopics]);

  const menuPlanEntry = useMemo(() => {
    if (!menuPlanTopicId) return undefined;
    return entries.find(e => {
      const meta = e.metadata as Record<string, unknown>;
      const cf   = meta?._customFields as Record<string, unknown> | undefined;
      return meta?._taxonomyId === menuPlanTopicId && cf?.weekStart === weekStartStr;
    });
  }, [entries, menuPlanTopicId, weekStartStr]);

  const recipes = useMemo(() => {
    if (!recipeTopicId) return [];
    return entries
      .filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === recipeTopicId)
      .map(e => ({ id: e.id, title: stripHtml(e.content).slice(0, 60) || `Recipe #${e.id}` }));
  }, [entries, recipeTopicId]);

  useEffect(() => {
    if (menuPlanEntry) {
      const cf = (menuPlanEntry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown>;
      setMeals((cf?.days as Record<string, MenuPlanDay>) || {});
    } else {
      setMeals({});
    }
  }, [menuPlanEntry?.id, weekStartStr]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSlot = useCallback((dateStr: string, slot: MealSlotType, patch: Partial<MenuMealSlot>) => {
    setMeals(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || emptyDay()),
        [slot]: { ...(prev[dateStr]?.[slot] || emptySlot()), ...patch },
      },
    }));
  }, []);

  const handleMealNameChange = useCallback((dateStr: string, slot: MealSlotType, mealName: string) => {
    updateSlot(dateStr, slot, { mealName });
  }, [updateSlot]);

  const handleRecipeChange = useCallback((dateStr: string, slot: MealSlotType, recipeId: number | null) => {
    const recipe = recipeId ? recipes.find(r => r.id === recipeId) : null;
    setMeals(prev => {
      const existing = prev[dateStr]?.[slot] || emptySlot();
      return {
        ...prev,
        [dateStr]: {
          ...(prev[dateStr] || emptyDay()),
          [slot]: {
            ...existing,
            recipeId,
            recipeName: recipe?.title || '',
            // Auto-fill meal name from recipe if it's currently empty
            mealName: existing.mealName || recipe?.title || '',
          },
        },
      };
    });
  }, [recipes]);

  const handleSave = useCallback(async () => {
    if (!menuPlanTopicId) return;
    setIsSaving(true);
    setStatusMsg('');
    try {
      const weekEnd  = addDays(weekStart, 6);
      const content  = `<p>Menu: ${fmtShort(weekStart)} – ${fmtShort(weekEnd)}</p>`;
      const customFields = { weekStart: weekStartStr, days: meals };
      const metadata: Record<string, unknown> = { _taxonomyId: menuPlanTopicId, _customFields: customFields };

      if (menuPlanEntry) {
        updateDecryptedEntry(menuPlanEntry.id, { metadata });
        const encrypted = await encryptPost(content, metadata);
        await entriesApi.update(menuPlanEntry.id, {
          contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
          metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
          taxonomyIds: [menuPlanTopicId],
        });
      } else {
        const encrypted = await encryptPost(content, metadata);
        const result = await entriesApi.create({
          contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
          metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
          isEncrypted: true, taxonomyIds: [menuPlanTopicId],
        });
        addDecryptedEntry({
          id: result.id as number, content, metadata, isEncrypted: true,
          createdAt: new Date(result.createdAt as string),
          updatedAt: new Date((result.updatedAt || result.createdAt) as string),
        });
      }
      setStatusMsg('Menu saved.');
    } catch (err) {
      console.error('Failed to save menu plan:', err);
      setStatusMsg('Save failed.');
    } finally {
      setIsSaving(false);
    }
  }, [menuPlanTopicId, menuPlanEntry, weekStart, weekStartStr, meals, encryptPost, updateDecryptedEntry, addDecryptedEntry]);

  const handleGenerateShoppingList = useCallback(async () => {
    if (!shoppingListTopicId) return;
    setIsGenerating(true);
    setStatusMsg('');
    try {
      const recipeIds = new Set<number>();
      Object.values(meals).forEach(day =>
        MEAL_SLOTS.forEach(({ key }) => {
          const slot = day[key];
          if (slot?.recipeId) recipeIds.add(slot.recipeId);
        })
      );

      const items: ShoppingItem[] = [];
      const linkedRecipeIds: number[] = [];

      recipeIds.forEach(recipeId => {
        const recipeEntry = entries.find(e => e.id === recipeId);
        if (!recipeEntry) return;
        linkedRecipeIds.push(recipeId);
        const cf = (recipeEntry.metadata as Record<string, unknown>)?._customFields as Record<string, unknown> | undefined;
        const ingredients = (cf?.ingredients as RecipeIngredient[]) || [];
        ingredients.forEach(ing => {
          items.push({
            id: crypto.randomUUID(),
            name: [ing.amount, ing.name].filter(Boolean).join(' '),
            category: 'other',
            checked: false,
          });
        });
      });

      const weekEnd = addDays(weekStart, 6);
      const content = `<p>Shopping List: ${fmtShort(weekStart)} – ${fmtShort(weekEnd)}</p>`;
      const customFields = { items, notes: '', linkedRecipeIds };
      const metadata: Record<string, unknown> = { _taxonomyId: shoppingListTopicId, _customFields: customFields };
      const encrypted = await encryptPost(content, metadata);
      const result = await entriesApi.create({
        contentEncrypted: encrypted.contentEncrypted, contentIv: encrypted.contentIv,
        metadataEncrypted: encrypted.metadataEncrypted, metadataIv: encrypted.metadataIv,
        isEncrypted: true, taxonomyIds: [shoppingListTopicId],
      });
      addDecryptedEntry({
        id: result.id as number, content, metadata, isEncrypted: true,
        createdAt: new Date(result.createdAt as string),
        updatedAt: new Date((result.updatedAt || result.createdAt) as string),
      });
      setStatusMsg(`Shopping list created with ${items.length} item${items.length !== 1 ? 's' : ''}.`);
    } catch (err) {
      console.error('Failed to generate shopping list:', err);
      setStatusMsg('Failed to generate shopping list.');
    } finally {
      setIsGenerating(false);
    }
  }, [meals, entries, weekStart, shoppingListTopicId, encryptPost, addDecryptedEntry]);

  /* ── Render helpers ── */

  const renderSlot = (dateStr: string, slotKey: MealSlotType) => {
    const slot = meals[dateStr]?.[slotKey] || emptySlot();
    return (
      <>
        <MealInput
          rows={1}
          value={slot.mealName}
          onChange={e => {
            const el = e.target as HTMLTextAreaElement;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
            handleMealNameChange(dateStr, slotKey, el.value);
          }}
          placeholder="What's for…"
        />
        {recipes.length > 0 && (
          <RecipeSelect
            value={slot.recipeId?.toString() || ''}
            onChange={e => handleRecipeChange(dateStr, slotKey, e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">link recipe…</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </RecipeSelect>
        )}
      </>
    );
  };

  /* ── Guards ── */

  if (needsUnlock) {
    return (
      <>
        <ContentTemplate><EmptyState message="Unlock your journal to view your menu" /></ContentTemplate>
        <UnlockDialog onUnlock={handleUnlock} />
      </>
    );
  }

  if (isLoading || !isReady) {
    return (
      <ContentTemplate>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Spinner size={40} />
        </div>
      </ContentTemplate>
    );
  }

  if (!menuPlanTopicId) {
    return (
      <ContentTemplate>
        <EmptyState
          message="Menu Plan topic not found."
          submessage="Make sure the Menu Plan topic exists in your Topics list."
        />
      </ContentTemplate>
    );
  }

  return (
    <ContentTemplate>
      <ViewHeader title="Menu Planner" onBack={() => navigate('/')} />

      {/* Week navigation */}
      <NavRow>
        <NavBtn onClick={() => setWeekStart(w => addDays(w, -7))} aria-label="Previous week">
          <FontAwesomeIcon icon={faChevronLeft} size="xs" />
        </NavBtn>
        <WeekLabel>{fmtShort(weekStart)} – {fmtShort(addDays(weekStart, 6))}</WeekLabel>
        <NavBtn onClick={() => setWeekStart(w => addDays(w, 7))} aria-label="Next week">
          <FontAwesomeIcon icon={faChevronRight} size="xs" />
        </NavBtn>
      </NavRow>

      {/* Action buttons */}
      <ActionRow>
        <ActionBtn onClick={() => navigate('/')} title="Create a new Recipe entry in your journal">
          + New Recipe
        </ActionBtn>
        <ActionBtn onClick={handleGenerateShoppingList} disabled={isGenerating}>
          {isGenerating ? 'Generating…' : 'Generate Shopping List'}
        </ActionBtn>
        <ActionBtn $primary onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Menu'}
        </ActionBtn>
      </ActionRow>

      {statusMsg && <StatusMsg>{statusMsg}</StatusMsg>}

      {/* Desktop grid (hidden on mobile) */}
      <ScrollArea>
        <PlannerGrid>
          {/* Header row */}
          <HeaderCell />
          {weekDays.map(day => (
            <HeaderCell key={toDateStr(day)}>
              <DayName>{fmtDay(day)}</DayName>
              <DayDate>{fmtShort(day)}</DayDate>
            </HeaderCell>
          ))}

          {/* Meal rows */}
          {MEAL_SLOTS.map(({ key, label }) => (
            <Fragment key={key}>
              <MealLabelCell>{label}</MealLabelCell>
              {weekDays.map(day => {
                const dateStr = toDateStr(day);
                return (
                  <MealCell key={`${dateStr}-${key}`}>
                    {renderSlot(dateStr, key)}
                  </MealCell>
                );
              })}
            </Fragment>
          ))}
        </PlannerGrid>
      </ScrollArea>

      {/* Mobile cards (hidden on desktop) */}
      <MobileArea>
        {weekDays.map(day => {
          const dateStr = toDateStr(day);
          return (
            <DayCard key={dateStr}>
              <DayCardHeader>
                <DayCardName>{fmtDay(day)}</DayCardName>
                <DayCardDate>{fmtShort(day)}</DayCardDate>
              </DayCardHeader>
              {MEAL_SLOTS.map(({ key, label }) => (
                <MobileSlotRow key={key}>
                  <MobileSlotLabel>{label}</MobileSlotLabel>
                  <MobileSlotInputs>
                    {renderSlot(dateStr, key)}
                  </MobileSlotInputs>
                </MobileSlotRow>
              ))}
            </DayCard>
          );
        })}
      </MobileArea>
    </ContentTemplate>
  );
}
