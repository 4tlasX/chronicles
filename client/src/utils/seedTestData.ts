/**
 * Seed test data for all topic types.
 * Must run in the browser with encryption unlocked.
 */
import { entries as entriesApi } from '../services/api.js';
import type { useEntriesStore } from '../stores/entriesStore.js';

type EncryptPost = (content: string, metadata: Record<string, unknown>) => Promise<{
  contentEncrypted: string;
  contentIv: string;
  metadataEncrypted: string;
  metadataIv: string;
}>;

type TopicInfo = { id: number; name: string; icon: string | null; color: string | null };

interface SeedDeps {
  encryptPost: EncryptPost;
  topics: TopicInfo[];
  addDecryptedEntry: ReturnType<typeof useEntriesStore.getState>['addDecryptedEntry'];
  onProgress?: (msg: string) => void;
}

function findTopic(topics: TopicInfo[], name: string): number | null {
  const t = topics.find(tp => tp.name.toLowerCase() === name.toLowerCase());
  return t ? t.id : null;
}

async function createEntry(
  deps: SeedDeps,
  content: string,
  topicName: string | null,
  customFields?: Record<string, unknown>,
): Promise<number> {
  const { encryptPost, topics, addDecryptedEntry, onProgress } = deps;
  const topicId = topicName ? findTopic(topics, topicName) : null;

  if (topicName && !topicId) {
    throw new Error(`Topic "${topicName}" not found. Available: ${topics.map(t => t.name).join(', ')}`);
  }

  const metadata: Record<string, unknown> = {};
  if (topicId) metadata._taxonomyId = topicId;
  if (customFields && Object.keys(customFields).length > 0) metadata._customFields = customFields;

  const encrypted = await encryptPost(`<p>${content}</p>`, metadata);
  const result = await entriesApi.create({
    contentEncrypted: encrypted.contentEncrypted,
    contentIv: encrypted.contentIv,
    metadataEncrypted: encrypted.metadataEncrypted,
    metadataIv: encrypted.metadataIv,
    isEncrypted: true,
    taxonomyIds: topicId ? [topicId] : [],
  });

  const id = result.id as number;
  addDecryptedEntry({
    id,
    content: `<p>${content}</p>`,
    metadata,
    isEncrypted: true,
    createdAt: new Date(result.createdAt as string),
    updatedAt: new Date((result.updatedAt || result.createdAt) as string),
  });

  onProgress?.(`Created: ${content.slice(0, 50)}...`);
  return id;
}

export async function seedTestData(deps: SeedDeps): Promise<string> {
  const { onProgress } = deps;
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const fourDaysAgo = new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10);
  const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10);
  const sixDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  let count = 0;

  try {
    onProgress?.('Creating goals...');

    // Goals
    const goal1 = await createEntry(deps, 'Learn TypeScript deeply — generics, conditional types, mapped types', 'Goal', {
      goalType: 'short_term', goalStatus: 'active', targetDate: nextMonth,
    }); count++;
    const goal2 = await createEntry(deps, 'Ship Chronicles rebuild — complete Phase 1 with full feature parity', 'Goal', {
      goalType: 'long_term', goalStatus: 'active', targetDate: nextMonth,
    }); count++;

    onProgress?.('Creating milestones...');

    // Milestones (linked to goals)
    const ms1 = await createEntry(deps, 'Complete Phase 1 foundation — auth, entries, topics, search, settings', 'Milestone', {
      milestoneStatus: 'active', targetDate: nextWeek, isCompleted: false, parentGoalId: goal2,
    }); count++;
    const ms2 = await createEntry(deps, 'Set up CI/CD pipeline and deployment', 'Milestone', {
      milestoneStatus: 'active', targetDate: nextMonth, isCompleted: false, parentGoalId: goal2,
    }); count++;

    onProgress?.('Creating tasks...');

    // Tasks (linked to milestones)
    await createEntry(deps, 'Write encryption unit tests for shared/crypto', 'Task', {
      isInProgress: true, isCompleted: false, isAutoMigrating: true, parentMilestoneId: ms1,
    }); count++;
    await createEntry(deps, 'Port TipTap editor component with full toolbar', 'Task', {
      isInProgress: false, isCompleted: false, isAutoMigrating: true, parentMilestoneId: ms1,
    }); count++;
    await createEntry(deps, 'Review PR #42 for auth routes — split token validation', 'Task', {
      isInProgress: false, isCompleted: true, isAutoMigrating: false, parentMilestoneId: null,
    }); count++;

    onProgress?.('Creating medications...');

    // ── Medications ──
    await createEntry(deps, 'Lisinopril — blood pressure management', 'Medication', {
      dosage: '10mg', frequency: 'once_daily', scheduleTimes: ['08:00'], isActive: true, notes: 'Take in the morning with water. Monitor BP weekly.',
    }); count++;
    await createEntry(deps, 'Metformin — blood sugar control', 'Medication', {
      dosage: '500mg', frequency: 'twice_daily', scheduleTimes: ['08:00', '20:00'], isActive: true, notes: 'Take with meals to reduce GI side effects.',
    }); count++;
    await createEntry(deps, 'Vitamin D3 — supplement for deficiency', 'Medication', {
      dosage: '2000 IU', frequency: 'once_daily', scheduleTimes: ['08:00'], isActive: true, notes: 'Take with fatty food for better absorption.',
    }); count++;
    await createEntry(deps, 'Ibuprofen — for occasional headaches', 'Medication', {
      dosage: '400mg', frequency: 'as_needed', scheduleTimes: [], isActive: true, notes: 'Max 3 doses per day. Take with food.',
    }); count++;
    await createEntry(deps, 'Amoxicillin — sinus infection course', 'Medication', {
      dosage: '500mg', frequency: 'three_times_daily', scheduleTimes: ['08:00', '14:00', '20:00'], isActive: false, notes: 'Completed 10-day course on March 15.',
    }); count++;
    await createEntry(deps, 'Melatonin — sleep aid', 'Medication', {
      dosage: '3mg', frequency: 'once_daily', scheduleTimes: ['21:30'], isActive: true, notes: 'Take 30 min before bed. Reduce to 1mg after sleep pattern stabilizes.',
    }); count++;

    onProgress?.('Creating food entries...');

    // ── Food (multi-day, varied meals) ──
    // Today
    await createEntry(deps, 'Morning smoothie — banana, spinach, protein powder, almond milk', 'Food', {
      mealType: 'breakfast', consumedDate: today, consumedTime: '07:30', ingredients: 'banana, spinach, protein powder, almond milk', calories: '350', notes: 'Added extra protein today',
    }); count++;
    await createEntry(deps, 'Grilled chicken salad with avocado and quinoa', 'Food', {
      mealType: 'lunch', consumedDate: today, consumedTime: '12:30', ingredients: 'chicken breast, mixed greens, avocado, quinoa, cherry tomatoes, olive oil dressing', calories: '580', notes: 'Great balance of protein and healthy fats',
    }); count++;
    await createEntry(deps, 'Handful of almonds and a banana', 'Food', {
      mealType: 'snack', consumedDate: today, consumedTime: '15:30', ingredients: 'almonds, banana', calories: '250', notes: '',
    }); count++;
    // Yesterday
    await createEntry(deps, 'Scrambled eggs on sourdough with avocado', 'Food', {
      mealType: 'breakfast', consumedDate: yesterday, consumedTime: '08:00', ingredients: 'eggs, sourdough bread, avocado, salt, pepper, chili flakes', calories: '450', notes: 'Used farm-fresh eggs',
    }); count++;
    await createEntry(deps, 'Turkey and hummus wrap with side salad', 'Food', {
      mealType: 'lunch', consumedDate: yesterday, consumedTime: '12:45', ingredients: 'whole wheat wrap, turkey, hummus, lettuce, tomato, cucumber, side salad', calories: '520', notes: '',
    }); count++;
    await createEntry(deps, 'Salmon with roasted vegetables and brown rice', 'Food', {
      mealType: 'dinner', consumedDate: yesterday, consumedTime: '19:00', ingredients: 'salmon fillet, broccoli, sweet potato, brown rice, lemon, garlic', calories: '650', notes: 'Pan-seared salmon — came out perfectly',
    }); count++;
    await createEntry(deps, 'Greek yogurt with honey and walnuts', 'Food', {
      mealType: 'snack', consumedDate: yesterday, consumedTime: '21:00', ingredients: 'greek yogurt, honey, walnuts', calories: '220', notes: '',
    }); count++;
    // 2 days ago
    await createEntry(deps, 'Oatmeal with blueberries and chia seeds', 'Food', {
      mealType: 'breakfast', consumedDate: twoDaysAgo, consumedTime: '07:45', ingredients: 'oats, blueberries, chia seeds, almond milk, maple syrup', calories: '380', notes: '',
    }); count++;
    await createEntry(deps, 'Chicken tikka masala with naan bread', 'Food', {
      mealType: 'dinner', consumedDate: twoDaysAgo, consumedTime: '19:30', ingredients: 'chicken, tikka sauce, basmati rice, naan, raita', calories: '780', notes: 'Homemade — turned out amazing. Save recipe.',
    }); count++;
    // 3 days ago
    await createEntry(deps, 'Veggie burger with sweet potato fries', 'Food', {
      mealType: 'lunch', consumedDate: threeDaysAgo, consumedTime: '13:00', ingredients: 'black bean patty, brioche bun, lettuce, tomato, pickles, sweet potato fries', calories: '620', notes: 'From that new place downtown',
    }); count++;
    await createEntry(deps, 'Pasta carbonara with garlic bread', 'Food', {
      mealType: 'dinner', consumedDate: threeDaysAgo, consumedTime: '19:15', ingredients: 'spaghetti, pancetta, eggs, parmesan, garlic bread', calories: '720', notes: 'Went a bit heavy today. Worth it.',
    }); count++;

    onProgress?.('Creating exercise entries...');

    // ── Exercise (multi-day, varied types) ──
    await createEntry(deps, '5K morning run around the park — felt great', 'Exercise', {
      exerciseType: 'running', duration: '28', intensity: 'medium', distance: '5', distanceUnit: 'km', calories: '320', performedDate: today, performedTime: '06:00', notes: 'New personal best pace',
    }); count++;
    await createEntry(deps, 'Upper body strength training — bench, rows, OHP', 'Exercise', {
      exerciseType: 'strength', duration: '55', intensity: 'high', distance: '', distanceUnit: 'km', calories: '280', performedDate: yesterday, performedTime: '07:00', notes: 'Bench PR: 185 lbs. Increased OHP to 105.',
    }); count++;
    await createEntry(deps, 'Evening yoga flow — hips and shoulders focus', 'Exercise', {
      exerciseType: 'yoga', duration: '40', intensity: 'low', distance: '', distanceUnit: 'km', calories: '120', performedDate: yesterday, performedTime: '18:30', notes: 'Follow-along from Yoga with Adriene. Really needed this.',
    }); count++;
    await createEntry(deps, '10K cycling along the river trail', 'Exercise', {
      exerciseType: 'cycling', duration: '35', intensity: 'medium', distance: '10', distanceUnit: 'km', calories: '250', performedDate: twoDaysAgo, performedTime: '06:30', notes: 'Cool morning — perfect cycling weather',
    }); count++;
    await createEntry(deps, 'Lunchtime walk around the neighborhood', 'Exercise', {
      exerciseType: 'walking', duration: '30', intensity: 'low', distance: '2.5', distanceUnit: 'km', calories: '100', performedDate: twoDaysAgo, performedTime: '12:15', notes: 'Listened to a podcast on distributed systems',
    }); count++;
    await createEntry(deps, 'HIIT cardio session — 30 sec on / 30 sec off', 'Exercise', {
      exerciseType: 'cardio', duration: '25', intensity: 'high', distance: '', distanceUnit: 'km', calories: '310', performedDate: threeDaysAgo, performedTime: '06:00', notes: 'Burpees, mountain climbers, jumping jacks, high knees',
    }); count++;
    await createEntry(deps, 'Swimming laps at the community pool', 'Exercise', {
      exerciseType: 'swimming', duration: '45', intensity: 'medium', distance: '1.5', distanceUnit: 'km', calories: '400', performedDate: fourDaysAgo, performedTime: '07:00', notes: 'Alternated freestyle and backstroke. Pool was quiet.',
    }); count++;
    await createEntry(deps, 'Leg day — squats, deadlifts, lunges', 'Exercise', {
      exerciseType: 'strength', duration: '50', intensity: 'high', distance: '', distanceUnit: 'km', calories: '300', performedDate: fiveDaysAgo, performedTime: '07:15', notes: 'Squat 225 x 5. Legs are going to be sore tomorrow.',
    }); count++;
    await createEntry(deps, 'Rest day walk with the dog', 'Exercise', {
      exerciseType: 'walking', duration: '20', intensity: 'low', distance: '1.5', distanceUnit: 'km', calories: '70', performedDate: sixDaysAgo, performedTime: '08:00', notes: 'Active recovery. Stretched after.',
    }); count++;

    onProgress?.('Creating symptom entries...');

    // ── Symptoms (varied across days) ──
    await createEntry(deps, 'Mild headache after lunch — possibly dehydration', 'Symptom', {
      severity: 3, occurredDate: today, occurredTime: '13:30', duration: '45', notes: 'Drank more water, resolved by 2pm',
    }); count++;
    await createEntry(deps, 'Lower back stiffness after sitting all morning', 'Symptom', {
      severity: 4, occurredDate: yesterday, occurredTime: '11:00', duration: '120', notes: 'Improved after yoga session in the evening. Need to get up more frequently.',
    }); count++;
    await createEntry(deps, 'Sore throat — started in the evening', 'Symptom', {
      severity: 5, occurredDate: twoDaysAgo, occurredTime: '18:00', duration: '240', notes: 'Gargled with salt water. Drank herbal tea. Gone by morning.',
    }); count++;
    await createEntry(deps, 'Muscle soreness from leg day', 'Symptom', {
      severity: 6, occurredDate: fourDaysAgo, occurredTime: '09:00', duration: '1440', notes: 'DOMS hit hard. Walking down stairs was an adventure. Foam rolled.',
    }); count++;
    await createEntry(deps, 'Eye strain from prolonged screen time', 'Symptom', {
      severity: 3, occurredDate: threeDaysAgo, occurredTime: '16:00', duration: '90', notes: 'Used eye drops and took a 20-min break. Need to follow the 20-20-20 rule.',
    }); count++;
    await createEntry(deps, 'Slight nausea after taking Metformin on empty stomach', 'Symptom', {
      severity: 4, occurredDate: fiveDaysAgo, occurredTime: '08:30', duration: '60', notes: 'Forgot to eat before taking it. Resolved after having toast. Must take with food.',
    }); count++;
    await createEntry(deps, 'Seasonal allergies — sneezing and itchy eyes', 'Symptom', {
      severity: 5, occurredDate: sixDaysAgo, occurredTime: '10:00', duration: '360', notes: 'Pollen count was high. Took antihistamine which helped after an hour.',
    }); count++;

    onProgress?.('Creating entertainment entries...');

    // Music
    await createEntry(deps, 'Discovered Khruangbin — incredible blend of funk, soul, and psychedelic. "Time (You and I)" on repeat', 'Music', {}); count++;

    // Books
    await createEntry(deps, 'Reading "Designing Data-Intensive Applications" by Martin Kleppmann — chapter on replication is mind-blowing', 'Books', {}); count++;

    // TV/Movies
    await createEntry(deps, 'Watched Severance S2 — the worldbuilding keeps getting deeper. The corridor scene was incredible.', 'TV/Movies', {}); count++;

    onProgress?.('Creating events and meetings...');

    // Event
    await createEntry(deps, 'Team standup — daily sync on sprint progress', 'Event', {
      startDate: today, startTime: '09:00', endDate: today, endTime: '09:15', location: 'Zoom', address: '', phone: '', notes: 'Bring up the deployment blocker',
    }); count++;

    // Meeting
    await createEntry(deps, '1:1 with manager — discuss career growth and Q2 goals', 'Meeting', {
      startDate: nextWeek, startTime: '14:00', endDate: nextWeek, endTime: '14:45', meetingTopic: 'Career growth + Q2 planning', attendees: 'Sarah (manager)', location: 'Conference Room B', address: '', phone: '', notes: 'Prepare talking points about tech lead role',
    }); count++;

    onProgress?.('Creating inspiration entries...');

    // Idea
    await createEntry(deps, 'What if we added voice notes to journal entries? Could use Web Audio API for recording, encrypt the blob, and store alongside text content.', 'Idea', {}); count++;

    // Research
    await createEntry(deps, 'Investigating WebRTC for real-time collaboration — could enable shared journals or live co-editing. Found good resources on PeerJS for simplified WebRTC.', 'Research', {}); count++;

    // Quote
    await createEntry(deps, '"The best way to predict the future is to invent it." — Alan Kay', 'Quote', {}); count++;

    onProgress?.('Creating plain entry...');

    // Plain entry (no topic)
    await createEntry(deps, 'Just a regular journal entry — today was productive. Got a lot done on the rebuild, the weather was nice, and I cooked a great dinner. Sometimes the ordinary days are the best ones.', null); count++;

    onProgress?.('Done! All test data created.');
    return `Success — ${count} test entries created across all topic types.`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    onProgress?.(`Error: ${msg}`);
    return `Failed: ${msg}`;
  }
}
