import { notFound } from "next/navigation";
import { loadProperties } from "@/lib/data";
import { getPromptsForProperty } from "@/lib/manager-prompts";
import ManagerPromptSettings from "@/components/ManagerPromptSettings";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function SettingsPage({ params }: Props) {
  const { id } = await params;
  const properties = loadProperties();
  const property = properties.find((p) => p.eg_property_id === id);
  if (!property) notFound();

  const prompts = getPromptsForProperty(id);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-extrabold text-[#1E243A]">Review Prompts</h2>
        <p className="text-sm text-gray-500 mt-1">
          Pin up to 2 topics you want guests to be asked about. Questions appear naturally in the
          review flow — guests will not know they were requested by you. Prompts expire automatically
          on the date you set.
        </p>
      </div>

      <ManagerPromptSettings propertyId={id} initialPrompts={prompts} />
    </div>
  );
}
