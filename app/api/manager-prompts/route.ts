import { NextResponse } from "next/server";
import {
  getPromptsForProperty,
  savePromptsForProperty,
  type ManagerPrompt,
} from "@/lib/manager-prompts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
  }
  return NextResponse.json({ prompts: getPromptsForProperty(propertyId) });
}

export async function POST(request: Request) {
  try {
    const { propertyId, prompts } = await request.json() as {
      propertyId: string;
      prompts: ManagerPrompt[];
    };
    if (!propertyId || !Array.isArray(prompts)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    savePromptsForProperty(propertyId, prompts);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error saving manager prompts:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
