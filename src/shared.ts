// src/shared.ts

// A single chat message
export type ChatMessage = {
  id: string;
  content: string;
  user: string; // random name or login handle
  role: "user" | "assistant";
  timestamp: number; // Unix epoch ms
};

// Messages that can be sent across WS/Workers
export type Message =
  | {
      type: "add";
      id: string;
      content: string;
      user: string;
      role: "user" | "assistant";
      timestamp: number;
    }
  | {
      type: "update";
      id: string;
      content: string;
      user: string;
      timestamp: number;
    }
  | {
      type: "delete";
      id: string;
      user: string;
    }
  | {
      type: "all";
      messages: ChatMessage[];
    };

// Utility to generate random usernames
export const names = [
  "Alice","Bob","Charlie","David","Eve","Frank","Grace","Heidi","Ivan","Judy",
  "Kevin","Linda","Mallory","Nancy","Oscar","Peggy","Quentin","Randy","Steve",
  "Trent","Ursula","Victor","Walter","Xavier","Yvonne","Zoe"
];

// Pick a random name for anonymous sessions
export function randomName(): string {
  return names[Math.floor(Math.random() * names.length)];
}

// Generate unique IDs (safe for distributed workers)
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
