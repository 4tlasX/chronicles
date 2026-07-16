import type { RecipeFieldValues } from '../types/fields.js';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const CATEGORY: Record<string, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack', dessert: 'Dessert',
};
const DIFFICULTY: Record<string, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

/** Render a recipe's fields as share-safe HTML (only tags the shared-entry
 *  viewer's sanitizer allows: h1/h2, p, em, strong, ul/ol/li, hr). */
export function recipeShareHtml(values: RecipeFieldValues): string {
  const parts: string[] = [];

  if (values.category && CATEGORY[values.category]) parts.push(`<p><strong>${CATEGORY[values.category]}</strong></p>`);
  parts.push(`<h1>${esc(values.recipeName?.trim() || 'Untitled recipe')}</h1>`);
  if (values.description?.trim()) parts.push(`<p><em>${esc(values.description.trim())}</em></p>`);

  const stats: string[] = [];
  const min = (v?: string) => (v ?? '').replace(/\s*min(ute)?s?\.?\s*$/i, '').trim();
  if (min(values.prepTime)) stats.push(`Prep ${esc(min(values.prepTime))} min`);
  if (min(values.cookTime)) stats.push(`Cook ${esc(min(values.cookTime))} min`);
  if (values.servings?.trim()) stats.push(`Serves ${esc(values.servings.trim())}`);
  if (values.calories?.trim()) stats.push(`${esc(values.calories.trim())} kcal`);
  if (values.difficulty && DIFFICULTY[values.difficulty]) stats.push(DIFFICULTY[values.difficulty]);
  if (stats.length) parts.push(`<p>${stats.join(' · ')}</p>`);

  const ingredients = (values.ingredients ?? []).filter(i => i.name.trim());
  if (ingredients.length) {
    parts.push('<h2>Ingredients</h2>');
    parts.push(`<ul>${ingredients.map(i =>
      `<li>${esc([i.amount?.trim(), i.name.trim()].filter(Boolean).join(' '))}</li>`
    ).join('')}</ul>`);
  }

  const steps = (values.steps ?? []).filter(s => s.title.trim() || s.text.trim());
  if (steps.length) {
    parts.push('<h2>Method</h2>');
    parts.push(`<ol>${steps.map(s => {
      const title = s.title.trim() ? `<strong>${esc(s.title.trim().replace(/\.?$/, '.'))}</strong> ` : '';
      return `<li>${title}${esc(s.text.trim())}</li>`;
    }).join('')}</ol>`);
  } else if (values.instructions?.trim()) {
    parts.push('<h2>Method</h2>');
    parts.push(`<p>${esc(values.instructions.trim()).replace(/\n/g, '<br>')}</p>`);
  }

  return parts.join('');
}
