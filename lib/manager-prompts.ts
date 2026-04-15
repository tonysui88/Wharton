/**
 * lib/manager-prompts.ts
 *
 * Stores manager-requested review prompts per property.
 * Managers can pin up to 2 topics they want guests to be asked about,
 * with an optional context note and an expiry date.
 */

import fs from "fs";
import path from "path";

export interface ManagerPrompt {
  id: string;
  topicId: string | null;  // null = free-form / no predefined topic
  topicLabel: string;
  note: string;            // optional context for GPT ("we just renovated the bathrooms")
  expiresAt: string;       // "YYYY-MM-DD"
  createdAt: string;
}

interface StoredPropertyPrompts {
  prompts: ManagerPrompt[];
  updatedAt: string;
}

const PROMPTS_FILE = path.join(process.cwd(), "lib", "manager-prompts.json");

function readFile(): Record<string, StoredPropertyPrompts> {
  try {
    if (fs.existsSync(PROMPTS_FILE)) {
      return JSON.parse(fs.readFileSync(PROMPTS_FILE, "utf-8"));
    }
  } catch {
    // file missing or corrupt — start fresh
  }
  return {};
}

function writeFile(data: Record<string, StoredPropertyPrompts>): void {
  fs.writeFileSync(PROMPTS_FILE, JSON.stringify(data, null, 2));
}

export function getPromptsForProperty(propertyId: string): ManagerPrompt[] {
  return readFile()[propertyId]?.prompts ?? [];
}

/** Returns only prompts that haven't expired yet. */
export function getActivePromptsForProperty(propertyId: string): ManagerPrompt[] {
  const today = new Date().toISOString().slice(0, 10);
  return getPromptsForProperty(propertyId).filter((p) => p.expiresAt >= today);
}

/** Persist the full prompt list for a property (max 2 enforced here). */
export function savePromptsForProperty(propertyId: string, prompts: ManagerPrompt[]): void {
  const all = readFile();
  all[propertyId] = {
    prompts: prompts.slice(0, 2),
    updatedAt: new Date().toISOString(),
  };
  writeFile(all);
}
