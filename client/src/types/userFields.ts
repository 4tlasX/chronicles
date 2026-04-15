export interface UserFieldDef {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'url';
}

export type TopicCustomFields = Record<number, UserFieldDef[]>;
