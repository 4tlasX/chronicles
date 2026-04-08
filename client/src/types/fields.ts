/* ── Custom field value types for entry types ── */

export type ShoppingCategory =
  | 'produce' | 'meat' | 'dairy' | 'bakery' | 'frozen'
  | 'beverages' | 'sundries' | 'personal_care' | 'household' | 'other';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ShoppingCategory;
  checked: boolean;
}

export interface ShoppingListFieldValues {
  items: ShoppingItem[];
  notes: string;
  linkedRecipeIds: number[];
}

export interface RecipeIngredient {
  id: string;
  amount: string;
  name: string;
}

export interface RecipeFieldValues {
  servings: string;
  prepTime: string;
  cookTime: string;
  cuisine: string;
  ingredients: RecipeIngredient[];
  instructions: string;
  linkedShoppingListIds: number[];
}

export type MealSlotType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MenuMealSlot {
  mealName: string;
  recipeId: number | null;
  recipeName: string;
}

export interface MenuPlanDay {
  breakfast: MenuMealSlot;
  lunch: MenuMealSlot;
  dinner: MenuMealSlot;
  snack: MenuMealSlot;
}

export interface MenuPlanFieldValues {
  weekStart: string;
  days: Record<string, MenuPlanDay>;
}

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface TaskFieldValues {
  isInProgress: boolean;
  isCompleted: boolean;
  isAutoMigrating: boolean;
  parentMilestoneId: number | null;
  deadline: string;
  priority: TaskPriority;
}

export interface GoalFieldValues {
  goalType: 'short_term' | 'long_term';
  goalStatus: 'active' | 'completed' | 'archived';
  targetDate: string;
}

export interface MilestoneFieldValues {
  milestoneStatus: 'active' | 'completed' | 'archived';
  targetDate: string;
  isCompleted: boolean;
  parentGoalId: number | null;
}

export interface FoodFieldValues {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  consumedDate: string;
  consumedTime: string;
  ingredients: string;
  calories: string;
  notes: string;
}

export interface MedicationFieldValues {
  dosage: string;
  frequency: 'once_daily' | 'twice_daily' | 'three_daily' | 'as_needed' | 'custom';
  scheduleTimes: string[];
  isActive: boolean;
  notes: string;
}

export interface SymptomFieldValues {
  severity: number;
  occurredDate: string;
  occurredTime: string;
  duration: string;
  notes: string;
}

export interface ExerciseFieldValues {
  exerciseType: string;
  duration: string;
  intensity: 'low' | 'medium' | 'high';
  distance: string;
  distanceUnit: 'miles' | 'km';
  calories: string;
  performedDate: string;
  performedTime: string;
  notes: string;
}

export interface EventFieldValues {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  address: string;
  phone: string;
  notes: string;
}

export interface MeetingFieldValues {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  meetingTopic: string;
  attendees: string;
  location: string;
  address: string;
  phone: string;
  notes: string;
}

export interface AllergyFieldValues {
  allergen: string;
  severity: number;
  reaction: string;
  occurredDate: string;
  occurredTime: string;
  notes: string;
}
