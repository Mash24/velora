const SYSTEM_NOTE_LINES = [
  "Customer submitted this order request on the website.",
  "Customer requested delivery.",
  "Customer will collect from the shop.",
] as const;

export function splitOrderNotes(notes: string | null | undefined) {
  const lines = (notes ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const systemNotes = lines.filter((line) =>
    (SYSTEM_NOTE_LINES as readonly string[]).includes(line),
  );
  const customerNote = lines.filter(
    (line) => !(SYSTEM_NOTE_LINES as readonly string[]).includes(line),
  );
  return {
    systemNotes,
    customerNote: customerNote.join("\n"),
  };
}

export function mergeOrderNotes(systemNotes: string[], customerNote: string, staffNote?: string) {
  return [...systemNotes, customerNote.trim(), staffNote?.trim()].filter(Boolean).join("\n");
}
