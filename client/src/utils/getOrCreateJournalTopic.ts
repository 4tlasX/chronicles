import { topics as topicsApi } from '../services/api.js';
import { useEntriesStore } from '../stores/entriesStore.js';

/** Returns the id of the "Journal" topic, creating it if it doesn't exist. */
export async function getOrCreateJournalTopic(): Promise<number> {
  const { allTopics, setTopics } = useEntriesStore.getState();
  let journal = allTopics.find(t => t.name.toLowerCase() === 'journal');
  if (!journal) {
    journal = await topicsApi.create({ name: 'Journal', icon: 'book' });
    setTopics([...allTopics, journal]);
  }
  return journal.id;
}
