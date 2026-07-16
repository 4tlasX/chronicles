import { describe, it, expect } from 'vitest';
import { getTopicTrail } from '@/utils/topicBreadcrumb';

describe('getTopicTrail', () => {
  it('maps planning topics to Planning', () => {
    for (const name of ['Task', 'Goal', 'Milestone', 'Priorities']) {
      expect(getTopicTrail(name)).toEqual([{ label: 'Planning', path: '/goals' }]);
    }
  });

  it('maps health topics to Health', () => {
    for (const name of ['Medication', 'Symptom', 'Exercise', 'Allergy', 'Wellness']) {
      expect(getTopicTrail(name)).toEqual([{ label: 'Health', path: '/health' }]);
    }
  });

  it('gives the food log a Health / Food subview trail', () => {
    expect(getTopicTrail('Meals')).toEqual([
      { label: 'Health', path: '/health' },
      { label: 'Food', path: '/health/food' },
    ]);
  });

  it('maps recipes and shopping lists to Meals', () => {
    expect(getTopicTrail('Recipe')).toEqual([{ label: 'Meals', path: '/menu' }]);
    expect(getTopicTrail('Shopping List')).toEqual([{ label: 'Meals', path: '/menu' }]);
  });

  it('maps events and meetings to Calendar', () => {
    expect(getTopicTrail('Event')).toEqual([{ label: 'Calendar', path: '/calendar' }]);
    expect(getTopicTrail('Meeting')).toEqual([{ label: 'Calendar', path: '/calendar' }]);
  });

  it('maps entertainment topics to their own views', () => {
    expect(getTopicTrail('Music')).toEqual([{ label: 'Entertainment', path: '/entertainment/music' }]);
    expect(getTopicTrail('Books')).toEqual([{ label: 'Entertainment', path: '/entertainment/books' }]);
    expect(getTopicTrail('TV/Movies')).toEqual([{ label: 'Entertainment', path: '/entertainment/tv' }]);
  });

  it('maps inspiration topics, with Idea non-clickable (no route)', () => {
    expect(getTopicTrail('Quote')).toEqual([{ label: 'Inspiration', path: '/inspiration/quotes' }]);
    expect(getTopicTrail('Idea')).toEqual([{ label: 'Inspiration', path: null }]);
  });

  it('falls back to Journal for custom, unknown, or missing topics', () => {
    expect(getTopicTrail('Books I Love')).toEqual([{ label: 'Journal', path: '/journal' }]);
    expect(getTopicTrail(undefined)).toEqual([{ label: 'Journal', path: '/journal' }]);
    expect(getTopicTrail(null)).toEqual([{ label: 'Journal', path: '/journal' }]);
  });

  it('is case-insensitive', () => {
    expect(getTopicTrail('recipe')).toEqual([{ label: 'Meals', path: '/menu' }]);
    expect(getTopicTrail('RECIPE')).toEqual([{ label: 'Meals', path: '/menu' }]);
  });
});
