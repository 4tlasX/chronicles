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
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  try {
    onProgress?.('Creating goals...');

    // Goals
    const goal1 = await createEntry(deps, 'Learn TypeScript deeply — generics, conditional types, mapped types', 'Goal', {
      goalType: 'short_term', goalStatus: 'active', targetDate: nextMonth,
    });
    const goal2 = await createEntry(deps, 'Ship Chronicles rebuild — complete Phase 1 with full feature parity', 'Goal', {
      goalType: 'long_term', goalStatus: 'active', targetDate: nextMonth,
    });

    onProgress?.('Creating milestones...');

    // Milestones (linked to goals)
    const ms1 = await createEntry(deps, 'Complete Phase 1 foundation — auth, entries, topics, search, settings', 'Milestone', {
      milestoneStatus: 'active', targetDate: nextWeek, isCompleted: false, parentGoalId: goal2,
    });
    const ms2 = await createEntry(deps, 'Set up CI/CD pipeline and deployment', 'Milestone', {
      milestoneStatus: 'active', targetDate: nextMonth, isCompleted: false, parentGoalId: goal2,
    });

    onProgress?.('Creating tasks...');

    // Tasks (linked to milestones)
    await createEntry(deps, 'Write encryption unit tests for shared/crypto', 'Task', {
      isInProgress: true, isCompleted: false, isAutoMigrating: true, parentMilestoneId: ms1,
    });
    await createEntry(deps, 'Port TipTap editor component with full toolbar', 'Task', {
      isInProgress: false, isCompleted: false, isAutoMigrating: true, parentMilestoneId: ms1,
    });
    await createEntry(deps, 'Review PR #42 for auth routes — split token validation', 'Task', {
      isInProgress: false, isCompleted: true, isAutoMigrating: false, parentMilestoneId: null,
    });

    onProgress?.('Creating health entries...');

    // Food
    await createEntry(deps, 'Morning smoothie — banana, spinach, protein powder, almond milk', 'Food', {
      mealType: 'breakfast', consumedDate: today, consumedTime: '07:30', ingredients: 'banana, spinach, protein powder, almond milk', calories: '350', notes: 'Added extra protein today',
    });

    // Exercise
    await createEntry(deps, '5K morning run around the park — felt great', 'Exercise', {
      exerciseType: 'running', duration: '28', intensity: 'medium', distance: '5', distanceUnit: 'km', calories: '320', performedDate: today, performedTime: '06:00', notes: 'New personal best pace',
    });

    // Symptom
    await createEntry(deps, 'Mild headache after lunch — possibly dehydration', 'Symptom', {
      severity: 3, occurredDate: today, occurredTime: '13:30', duration: '45 min', notes: 'Drank more water, resolved by 2pm',
    });

    onProgress?.('Creating entertainment entries...');

    // Music
    await createEntry(deps, 'Discovered Khruangbin — incredible blend of funk, soul, and psychedelic. "Time (You and I)" on repeat', 'Music', {});

    // Books
    await createEntry(deps, 'Reading "Designing Data-Intensive Applications" by Martin Kleppmann — chapter on replication is mind-blowing', 'Books', {});

    // TV/Movies
    await createEntry(deps, 'Watched Severance S2 — the worldbuilding keeps getting deeper. The corridor scene was incredible.', 'TV/Movies', {});

    onProgress?.('Creating events and meetings...');

    // Event
    await createEntry(deps, 'Team standup — daily sync on sprint progress', 'Event', {
      startDate: today, startTime: '09:00', endDate: today, endTime: '09:15', location: 'Zoom', address: '', phone: '', notes: 'Bring up the deployment blocker',
    });

    // Meeting
    await createEntry(deps, '1:1 with manager — discuss career growth and Q2 goals', 'Meeting', {
      startDate: nextWeek, startTime: '14:00', endDate: nextWeek, endTime: '14:45', meetingTopic: 'Career growth + Q2 planning', attendees: 'Sarah (manager)', location: 'Conference Room B', address: '', phone: '', notes: 'Prepare talking points about tech lead role',
    });

    onProgress?.('Creating inspiration entries...');

    // Idea
    await createEntry(deps, 'What if we added voice notes to journal entries? Could use Web Audio API for recording, encrypt the blob, and store alongside text content.', 'Idea', {});

    // Research
    await createEntry(deps, 'Investigating WebRTC for real-time collaboration — could enable shared journals or live co-editing. Found good resources on PeerJS for simplified WebRTC.', 'Research', {});

    // Quote
    await createEntry(deps, '"The best way to predict the future is to invent it." — Alan Kay', 'Quote', {});

    onProgress?.('Creating plain entry...');

    // Plain entry (no topic)
    await createEntry(deps, 'Just a regular journal entry — today was productive. Got a lot done on the rebuild, the weather was nice, and I cooked a great dinner. Sometimes the ordinary days are the best ones.', null);

    onProgress?.('Done! All test data created.');
    return 'Success — 18 test entries created across all topic types.';
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    onProgress?.(`Error: ${msg}`);
    return `Failed: ${msg}`;
  }
}
