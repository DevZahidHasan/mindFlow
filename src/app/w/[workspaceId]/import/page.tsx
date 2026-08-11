import React from "react";
import { ImportZone } from "@/features/knowledge/components/document-import/import-zone";

export const metadata = {
  title: "Import Knowledge — MINDSPACE",
};

export default async function ImportPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <div className="w-full min-h-screen pt-32 pb-64 px-6 md:px-12">
      <ImportZone workspaceId={workspaceId} />
    </div>
  );
}
