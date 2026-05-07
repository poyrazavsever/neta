import Dexie, { type Table } from "dexie";

// Veritabanı Modelleri
export interface Journal {
  id: string;
  date: string;
  mood: string;
  energy: number;
  content: string;
  ai_tags?: string[];
  ai_sentiment_score?: number;
  ai_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  journal_id?: string;
  title: string;
  status: "todo" | "in_progress" | "completed";
  ai_generated: boolean;
  date: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export class MindSpaceDB extends Dexie {
  journals!: Table<Journal>;
  tasks!: Table<Task>;
  chat_messages!: Table<ChatMessage>;

  constructor() {
    super("MindSpaceDatabase");

    // Schema tanımlamaları.
    // IndexedDB'de sadece indekslenecek (üzerinde arama/sıralama yapılacak) alanları belirtiriz.
    this.version(2).stores({
      journals: "id, date, mood",
      tasks: "id, status, date, journal_id",
      chat_messages: "id, created_at",
    });
  }
}

export const db = new MindSpaceDB();
